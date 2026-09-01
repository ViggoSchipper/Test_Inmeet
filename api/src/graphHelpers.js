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

// Herkent bestandsnamen die door onze eigen code zijn aangemaakt (altijd met
// een "_V{n}" versienummer erin, bv. "..._V3_data.json" of
// "Foto_..._V3.jpg"). Wordt gebruikt om het hoogste versienummer te bepalen
// én om bij het archiveren nooit iets te verplaatsen wat iemand met de hand
// in deze mappen heeft gezet.
const VERSIE_PATROON = /_V(\d+)(?:[._]|$)/i;

// Beveiliging: elk pad waar geschreven wordt moet letterlijk eindigen op
// deze mapnaam - óf op één van de vaste submappen daarbinnen (zie
// TOEGESTANE_SUBMAPPEN). Dit is een harde, code-brede waarborg (los van het
// feit dat alle aanroepers toch al alleen dit pad doorgeven) zodat een fout
// ergens anders in de code nooit per ongeluk buiten deze map kan schrijven.
const TOEGESTANE_SCHRIJFMAP = "03 Inmeetformulier";

// Vaste submappen direct ónder "03 Inmeetformulier". Foto's en schetsen
// gaan in hun eigen map, en oudere versies worden bij elke nieuwe opslag
// automatisch hierheen verplaatst zodat er in de hoofdmap altijd maar één
// (de nieuwste) versie te zien is.
const FOTO_SUBMAP = "Foto's";
const SCHETS_SUBMAP = "Schetsen";
const ARCHIEF_SUBMAP = "Oude versies";
const TOEGESTANE_SUBMAPPEN = [FOTO_SUBMAP, SCHETS_SUBMAP, ARCHIEF_SUBMAP];

// Mag er naar dit pad geschreven/verplaatst worden? Alleen als het pad
// letterlijk "…/03 Inmeetformulier" is, of "…/03 Inmeetformulier/<een van
// de vaste submappen>". Nooit dieper, nooit ergens anders.
function magSchrijvenNaar(folderPath) {
  const delen = folderPath.split("/");
  const laatste = delen[delen.length - 1];
  const voorlaatste = delen[delen.length - 2];
  if (laatste === TOEGESTANE_SCHRIJFMAP) return true;
  if (TOEGESTANE_SUBMAPPEN.includes(laatste) && voorlaatste === TOEGESTANE_SCHRIJFMAP) return true;
  return false;
}

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

// Site-id + drive-id worden één keer per functie-instantie opgehaald en
// daarna hergebruikt. De document bibliotheek (drive) heet op deze site
// "Documenten" - "02 Projecten" staat direct in de root van die bibliotheek
// (bevestigd via het kruimelpad: Documenten > 02 Projecten > 2026 > ...).
// Mocht dat ooit een extra map dieper zitten, kan dat via
// SHAREPOINT_ROOT_FOLDER ingesteld worden zonder de code aan te passen.
const ROOT_FOLDER = process.env.SHAREPOINT_ROOT_FOLDER || "";

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
  const driveName = process.env.SHAREPOINT_LIBRARY_NAME || "Documenten";
  const drive = drives.find((d) => d.name === driveName);
  if (!drive) {
    throw new Error(`Document bibliotheek '${driveName}' niet gevonden. Beschikbaar: ${drives.map((d) => d.name).join(", ")}`);
  }

  cachedSite = { siteId: site.id, driveId: drive.id };
  return cachedSite;
}

// Zet een eventuele vaste hoofdmap voor elk pad binnen de drive (leeg als
// "02 Projecten" al in de root van de bibliotheek staat).
function metRootmap(pad) {
  return ROOT_FOLDER ? `${ROOT_FOLDER}/${pad}` : pad;
}

// Projectmap vinden: {ROOT_FOLDER}/02 Projecten/{jaar}/{projectnummer}_...
// Jaar wordt afgeleid uit de eerste 2 cijfers van het projectnummer (26001 -> 2026).
function jaarUitProjectnummer(projectnummer) {
  const kort = String(projectnummer).slice(0, 2);
  return `20${kort}`;
}

async function findProjectFolder(projectnummer) {
  const { driveId } = await resolveSiteAndDrive();
  const jaar = jaarUitProjectnummer(projectnummer);
  const relatiefPad = metRootmap(`02 Projecten/${jaar}`);
  const res = await graphFetch(`/drives/${driveId}/root:/${relatiefPad}:/children`);
  if (res.status === 404) return null;
  const children = (await graphJsonOrThrow(res, `Kon map '${relatiefPad}' niet lezen`)).value;
  return children.find((c) => c.folder && c.name.startsWith(`${projectnummer}_`)) || null;
}

async function listInmeetFiles(folderId) {
  const { driveId } = await resolveSiteAndDrive();
  const res = await graphFetch(`/drives/${driveId}/items/${folderId}:/03 Inmeetformulier:/children`);
  if (res.status === 404) return [];
  const body = await graphJsonOrThrow(res, "Kon map '03 Inmeetformulier' niet lezen");
  return body.value;
}

// Generieke variant op listInmeetFiles: lijst de directe children van een
// willekeurig relatief pad binnen de drive (leeg array als de map nog niet
// bestaat, in plaats van een foutmelding).
async function listChildren(relatiefPad) {
  const { driveId } = await resolveSiteAndDrive();
  const encoded = relatiefPad.split("/").map(encodeURIComponent).join("/");
  const res = await graphFetch(`/drives/${driveId}/root:/${encoded}:/children`);
  if (res.status === 404) return [];
  const body = await graphJsonOrThrow(res, `Kon map '${relatiefPad}' niet lezen`);
  return body.value;
}

// Zorgt dat een submap (Foto's / Schetsen / Oude versies) van
// "03 Inmeetformulier" bestaat en geeft 'm terug (maakt 'm aan als hij nog
// niet bestaat). Alleen submappen uit TOEGESTANE_SUBMAPPEN zijn toegestaan.
async function zorgVoorSubmap(basisPad, submapNaam) {
  if (!TOEGESTANE_SUBMAPPEN.includes(submapNaam)) {
    throw new Error(`Beveiliging: '${submapNaam}' is geen toegestane submap van ${TOEGESTANE_SCHRIJFMAP}.`);
  }
  const { driveId } = await resolveSiteAndDrive();
  const volledigPad = `${basisPad}/${submapNaam}`;
  const encodedVolledigPad = volledigPad.split("/").map(encodeURIComponent).join("/");

  const getRes = await graphFetch(`/drives/${driveId}/root:/${encodedVolledigPad}`);
  if (getRes.ok) return getRes.json();
  if (getRes.status !== 404) {
    throw new Error(`Kon submap '${submapNaam}' niet controleren: ${getRes.status}`);
  }

  const encodedBasisPad = basisPad.split("/").map(encodeURIComponent).join("/");
  const createRes = await graphFetch(`/drives/${driveId}/root:/${encodedBasisPad}:/children`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: submapNaam, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
  });
  if (createRes.status === 409) {
    // Race met een andere gelijktijdige opslag die 'm net aanmaakte - gewoon
    // opnieuw ophalen in plaats van te falen.
    return graphJsonOrThrow(await graphFetch(`/drives/${driveId}/root:/${encodedVolledigPad}`), "Kon submap niet lezen na race");
  }
  return graphJsonOrThrow(createRes, `Kon submap '${submapNaam}' niet aanmaken`);
}

// Verplaatst één bestand naar een andere map binnen dezelfde drive (een
// Graph "move" is een PATCH die de parentReference wijzigt).
async function verplaatsBestand(item, naarFolderId) {
  const { driveId } = await resolveSiteAndDrive();
  const res = await graphFetch(`/drives/${driveId}/items/${item.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentReference: { id: naarFolderId } }),
  });
  return graphJsonOrThrow(res, `Kon '${item.name}' niet verplaatsen naar archief`);
}

// Verplaatst alles wat nu direct in "03 Inmeetformulier" staat (data.json,
// pdf - géén submappen zelf) plus alles in de Foto's- en Schetsen-mappen,
// naar "Oude versies". Wordt aangeroepen vlak vóórdat een nieuwe versie
// wordt weggeschreven, zodat er buiten het archief altijd maar één (de
// nieuwste) versie zichtbaar staat. Beveiliging: verplaatst uitsluitend
// bestanden die zelf al binnen "03 Inmeetformulier" (of een toegestane
// submap daarvan) stonden, naar de eveneens toegestane "Oude versies"-map.
async function archiveerOudeVersies(basisPad) {
  if (!magSchrijvenNaar(basisPad)) {
    throw new Error(`Beveiliging: archiveren geweigerd — pad '${basisPad}' is geen '${TOEGESTANE_SCHRIJFMAP}'-map.`);
  }
  const archiefFolder = await zorgVoorSubmap(basisPad, ARCHIEF_SUBMAP);
  const [topLevel, fotos, schetsen] = await Promise.all([
    listChildren(basisPad),
    listChildren(`${basisPad}/${FOTO_SUBMAP}`),
    listChildren(`${basisPad}/${SCHETS_SUBMAP}`),
  ]);
  // Alleen bestanden verplaatsen die overduidelijk van ónze app komen (dus
  // met een "_V{n}" versienummer in de naam) - geen (sub)mappen zoals
  // Foto's/Schetsen/Oude versies zelf, en ook niets dat iemand met de hand
  // in deze mappen heeft gezet zonder dat patroon.
  const isEigenVersieBestand = (it) => !it.folder && VERSIE_PATROON.test(it.name);
  const teVerplaatsen = [...topLevel, ...fotos, ...schetsen].filter(isEigenVersieBestand);
  await Promise.all(teVerplaatsen.map((item) => verplaatsBestand(item, archiefFolder.id)));
}

function hoogsteVersie(files) {
  let max = 0;
  for (const f of files) {
    const m = VERSIE_PATROON.exec(f.name);
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
  const ext =
    mime === "image/png" ? "png" :
    mime === "image/jpeg" ? "jpg" :
    mime === "image/webp" ? "webp" :
    mime === "application/pdf" ? "pdf" : "bin";
  return { mime, buffer, ext };
}

// contentType wordt momenteel niet apart doorgegeven aan Graph — de
// bestandsextensie in filename (.json/.png/.jpg) is voldoende voor Graph
// om het juiste type te herkennen. Blijft als parameter staan voor
// leesbaarheid bij de aanroepers.
async function uploadFile(folderPath, filename, buffer, contentType) {
  void contentType;
  // Harde check, los van de aanroepende code: weiger elke upload die niet
  // naar "03 Inmeetformulier" zelf, of een toegestane submap daarvan, gaat.
  if (!magSchrijvenNaar(folderPath)) {
    throw new Error(`Beveiliging: upload geweigerd — pad '${folderPath}' is geen '${TOEGESTANE_SCHRIJFMAP}'-map (of toegestane submap).`);
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
  return metRootmap(`02 Projecten/${jaar}/${projectMapNaam}/03 Inmeetformulier`);
}

module.exports = {
  FOTO_VELDEN,
  SCHETS_VELDEN,
  FOTO_SUBMAP,
  SCHETS_SUBMAP,
  ARCHIEF_SUBMAP,
  resolveSiteAndDrive,
  jaarUitProjectnummer,
  findProjectFolder,
  listInmeetFiles,
  hoogsteVersie,
  downloadJson,
  parseDataUrl,
  uploadFile,
  inmeetFormulierPad,
  zorgVoorSubmap,
  archiveerOudeVersies,
};
