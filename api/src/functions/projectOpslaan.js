const { app } = require("@azure/functions");
const {
  FOTO_VELDEN,
  SCHETS_VELDEN,
  FOTO_SUBMAP,
  SCHETS_SUBMAP,
  jaarUitProjectnummer,
  findProjectFolder,
  listInmeetFiles,
  hoogsteVersie,
  parseDataUrl,
  uploadFile,
  inmeetFormulierPad,
  archiveerOudeVersies,
} = require("../graphHelpers");

// POST /api/project-opslaan   body: { projectnummer, data, pdfDataUrl? }
// Bepaalt zelf het eerstvolgende versienummer (V1, V2, ...) op basis van wat
// er al in de projectmap staat. Verplaatst daarna alles van de vorige versie
// naar "Oude versies" (zodat er buiten het archief maar één versie te zien
// is), en schrijft dan de nieuwe versie weg: data.json + pdf direct in
// "03 Inmeetformulier", foto's in de "Foto's"-map en schetsen in de
// "Schetsen"-map.
app.http("projectOpslaan", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "project-opslaan",
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: "Ongeldige JSON in request body" } };
    }

    const projectnummer = (body?.projectnummer || "").trim();
    const data = body?.data;
    if (!projectnummer) return { status: 400, jsonBody: { error: "projectnummer ontbreekt" } };
    if (!data || typeof data !== "object") return { status: 400, jsonBody: { error: "data ontbreekt" } };

    try {
      const folder = await findProjectFolder(projectnummer);
      if (!folder) {
        return {
          status: 404,
          jsonBody: { error: `Projectmap voor ${projectnummer} niet gevonden. Laat de verkoper de map eerst aanmaken vanuit de template.` },
        };
      }

      const bestaandeFiles = await listInmeetFiles(folder.id);
      const versie = hoogsteVersie(bestaandeFiles) + 1;
      const basisPad = inmeetFormulierPad(jaarUitProjectnummer(projectnummer), folder.name);

      // Eerst alles van de vorige versie(s) naar "Oude versies" verplaatsen,
      // zodat de hoofdmap en de Foto's/Schetsen-mappen straks alleen de
      // zojuist opgeslagen (nieuwste) versie bevatten.
      await archiveerOudeVersies(basisPad);

      // Volledige formulierdata (incl. foto's/schetsen als base64) - dient als
      // bron voor prefill bij een volgende opname van hetzelfde project.
      await uploadFile(
        basisPad,
        `Inmeetformulier_${projectnummer}_V${versie}_data.json`,
        Buffer.from(JSON.stringify(data)),
        "application/json"
      );

      // Losse foto's en schetsen, zodat iemand die de map opent ze direct kan
      // bekijken zonder het databestand te hoeven openen - elk in hun eigen
      // submap.
      const uploads = [];
      for (const [veld, bestandsnaam] of Object.entries(FOTO_VELDEN)) {
        const waarde = data[veld];
        if (!waarde) continue;
        const parsed = parseDataUrl(waarde);
        if (!parsed) continue;
        uploads.push(uploadFile(`${basisPad}/${FOTO_SUBMAP}`, `${bestandsnaam}_V${versie}.${parsed.ext}`, parsed.buffer, parsed.mime));
      }
      for (const [veld, bestandsnaam] of Object.entries(SCHETS_VELDEN)) {
        const waarde = data[veld];
        if (!waarde) continue;
        const parsed = parseDataUrl(waarde);
        if (!parsed) continue;
        uploads.push(uploadFile(`${basisPad}/${SCHETS_SUBMAP}`, `${bestandsnaam}_V${versie}.${parsed.ext}`, parsed.buffer, parsed.mime));
      }

      // De leesbare PDF (zelfde bestand als "PDF bekijken" in de app laat
      // zien), zodat er ook zonder de app een compleet overzicht in de map
      // staat. Optioneel/backwards compatible: als de client geen pdfDataUrl
      // meestuurt, wordt dit stilletjes overgeslagen.
      const pdfParsed = parseDataUrl(body?.pdfDataUrl);
      if (pdfParsed) {
        uploads.push(uploadFile(basisPad, `Inmeetformulier_${projectnummer}_V${versie}.pdf`, pdfParsed.buffer, pdfParsed.mime));
      }

      await Promise.all(uploads);

      return { status: 200, jsonBody: { versie } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
