// Gedeelde helpers voor het praten met Microsoft Graph / SharePoint.
// Authenticatie gebeurt via de "client credentials" flow (app-only, geen
// gebruiker die inlogt) met de gegevens van de Azure App registratie
// "Addon Inmeet Formulier".

const { ConfidentialClientApplication } = require("@azure/msal-node");

const FOTO_VELDEN = {
  fotoAchterBinnen: "Foto_AchtergevelBinnen",
  fotoAchterBuiten: "Foto_AchtergevelBuiten",
  fotoKruipruimte: "Foto_Kruipruimte",
  fotoBereikbaarheid: "Foto_Bereikbaarheid",
};

const SCHETS_VELDEN = {
  schetsMaatvoering: "Schets_Maatvoering",
  schetsKozijn1: "Schets_Kozijn1",
  schetsKozijn2: "Schets_Kozijn2",
  schetsKozijn3: "Schets_Kozijn3",
  schetsEinstallatie: "Schets_Einstallatie",
  schetsWinstallatie: "Schets_Winstallatie",
};

const CHUNK_SIZE = 16 * 327680; // ~5MB, moet een veelvoud van 327.680 bytes zijn

// Beveiliging: elk pad waar geschreven wordt moet letterlijk eindigen op
// deze mapnaam. Dit is een harde, code-brede waarborg (los van het feit dat
// alle aanroepers toch al alleen dit pad doorgeven) zodat een fout
// ergens anders in de code nooit per ongeluk buiten deze map kan schrijven.
const TOEGESTANE_SCHRIJFMAP = "03 Inmeetformulier";

let msalApp = null;
function getMsalApp() {
  if (!msalApp) {
    const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } = process.env;
    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
      throw new Error("AZURE_TENANT_ID, AZURE_CLIENT_ID en AZURE_CLIENT_SECRET moeten ingesteld zijn als App Settings.");
    }
    msalApp = new ConfidentialClientApplication({
      auth: {
        clientId: AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
        clientSecret: AZURE_CLIENT_SECRET,
      },
    });
  }
  return msalApp;
}

let cachedToken = null; // { token, expiresOn }
async function getGraphToken() {
  if (cachedToken && cachedToken.expiresOn > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const app = getMsalApp();
  const result = await app.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  cachedToken = { token: result.accessToken, expiresOn: result.expiresOn.getTime() };
  return cachedToken.token;
}

async function graphFetch(path, options = {}) {
  const token = await getGraphToken();
  const url = path.startsWith("https://") ? path : `https://graph.microsoft.com/v1.0${path}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

async function graphJsonOrThrow(res, foutmelding) {
  if (!res.ok) {
    const tekst = await res.text().catch(() => "");
    throw new Error(`${foutmelding}: ${res.status} ${tekst}`);
  }
  return res.json();
}

// Site-id + drive-id (document bibliotheek "Nieuwe documenten") worden één keer
// per functie-instantie opgehaald en daarna hergebruikt.
let cachedSite = null;
async function resolveSiteAndDrive() {
  if (cachedSite) return cachedSite;
  const siteUrlSetting = process.env.SHAREPOINT_SITE_URL;
  if (!siteUrlSetting) throw new Error("SHAREPOINT_SITE_URL is niet ingesteld als App Setting.");

  const siteUrl = new URL(siteUrlSetting);
  const site = await graphJsonOrThrow(
    await graphFetch(`/sites/${siteUrl.hostname}:${siteUrl.pathname}`),
    "Kon SharePoint site niet vinden"
  );

  const drivesRes = await graphFetch(`/sites/${site.id}/drives`);
  const drives = (await graphJsonOrThrow(drivesRes, "Kon document bibliotheken niet ophalen")).value;
  const driveName = process.env.SHAREPOINT_LIBRARY_NAME || "Nieuwe documenten";
  const drive = drives.find((d) => d.name === driveName);
  if (!drive) {
    throw new Error(`Document bibliotheek '${driveName}' niet gevonden. Beschikbaar: ${drives.map((d) => d.name).join(", ")}`);
  }

  cachedSite = { siteId: site.id, driveId: drive.id };
  return cachedSite;
}

// Projectmap vinden: Nieuwe documenten/02 Projecten/{jaar}/{projectnummer}_...
// Jaar wordt afgeleid uit de eerste 2 cijfers van het projectnummer (26001 -> 2026).
function jaarUitProjectnummer(projectnummer) {
  const kort = String(projectnummer).slice(0, 2);
  return `20${kort}`;
}

async function findProjectFolder(projectnummer) {
  const { driveId } = await resolveSiteAndDrive();
  const jaar = jaarUitProjectnummer(projectnummer);
  const path = `/drives/${driveId}/root:/02 Projecten/${jaar}:/children`;
  const res = await graphFetch(path);
  if (res.status === 404) return null;
  const children = (await graphJsonOrThrow(res, `Kon map '02 Projecten/${jaar}' niet lezen`)).value;
  return children.find((c) => c.folder && c.name.startsWith(`${projectnummer}_`)) || null;
}

async function listInmeetFiles(folderId) {
  const { driveId } = await resolveSiteAndDrive();
  const res = await graphFetch(`/drives/${driveId}/items/${folderId}:/03 Inmeetformulier:/children`);
  if (res.status === 404) return [];
  const body = await graphJsonOrThrow(res, "Kon map '03 Inmeetformulier' niet lezen");
  return body.value;
}

function hoogsteVersie(files) {
  let max = 0;
  for (const f of files) {
    const m = /_V(\d+)(?:[._]|$)/i.exec(f.name);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

async function downloadJson(itemId) {
  const { driveId } = await resolveSiteAndDrive();
  const res = await graphFetch(`/drives/${driveId}/items/${itemId}/content`);
  return graphJsonOrThrow(res, "Kon databestand niet downloaden");
}

function parseDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl || "");
  if (!m) return null;
  const mime = m[1];
  const buffer = Buffer.from(m[2], "base64");
  const ext = mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "bin";
  return { mime, buffer, ext };
}

// contentType wordt momenteel niet apart doorgegeven aan Graph — de
// bestandsextensie in filename (.json/.png/.jpg) is voldoende voor Graph
// om het juiste type te herkennen. Blijft als parameter staan voor
// leesbaarheid bij de aanroepers.
async function uploadFile(folderPath, filename, buffer, contentType) {
  void contentType;
  // Harde check, los van de aanroepende code: weiger elke upload die niet
  // naar een "03 Inmeetformulier"-map gaat.
  const laatsteSegment = folderPath.split("/").pop();
  if (laatsteSegment !== TOEGESTANE_SCHRIJFMAP) {
    throw new Error(`Beveiliging: upload geweigerd — pad '${folderPath}' is geen '${TOEGESTANE_SCHRIJFMAP}'-map.`);
  }
  // Bestandsnamen worden elders altijd opgebouwd met een vers versienummer
  // (_V1, _V2, ...) dat nog niet bestaat. conflictBehavior "fail" is de
  // laatste vangrail: mocht dat versienummer ooit toch al bezet zijn (bug
  // of dubbele aanvraag), dan krijg je een duidelijke foutmelding in plaats
  // van dat een bestaand bestand stilletjes wordt overschreven.
  const { driveId } = await resolveSiteAndDrive();
  const encodedPath = folderPath.split("/").map(encodeURIComponent).join("/");
  const encodedName = encodeURIComponent(filename);

  const sessionRes = await graphFetch(`/drives/${driveId}/root:/${encodedPath}/${encodedName}:/createUploadSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item: { "@microsoft.graph.conflictBehavior": "fail" } }),
  });
  const { uploadUrl } = await graphJsonOrThrow(sessionRes, `Kon upload-sessie voor ${filename} niet starten`);

  let start = 0;
  let laatsteResultaat = null;
  do {
    const end = Math.min(start + CHUNK_SIZE, buffer.length);
    const chunk = buffer.subarray(start, end);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.length),
        "Content-Range": `bytes ${start}-${Math.max(end - 1, 0)}/${buffer.length}`,
      },
      body: chunk,
    });
    if (!res.ok && res.status !== 202) {
      const tekst = await res.text().catch(() => "");
      throw new Error(`Upload van ${filename} mislukt (mogelijk bestaat dit bestand al): ${res.status} ${tekst}`);
    }
    if (res.status !== 202) laatsteResultaat = await res.json();
    start = end;
  } while (start < buffer.length);
  return laatsteResultaat;
}

function inmeetFormulierPad(jaar, projectMapNaam) {
  return `02 Projecten/${jaar}/${projectMapNaam}/03 Inmeetformulier`;
}

module.exports = {
  FOTO_VELDEN,
  SCHETS_VELDEN,
  resolveSiteAndDrive,
  jaarUitProjectnummer,
  findProjectFolder,
  listInmeetFiles,
  hoogsteVersie,
  downloadJson,
  parseDataUrl,
  uploadFile,
  inmeetFormulierPad,
};
