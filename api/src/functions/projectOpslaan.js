const { app } = require("@azure/functions");
const {
  FOTO_VELDEN,
  SCHETS_VELDEN,
  FOTO_SUBMAP,
  SCHETS_SUBMAP,
  jaarUitProjectnummer,
  findProjectFolder,
  listInmeetFiles,
  hoogsteVersieInclusiefArchief,
  parseDataUrl,
  uploadFile,
  inmeetFormulierPad,
  archiveerOudeVersies,
} = require("../graphHelpers");

// POST /api/project-opslaan   body: { projectnummer, data, pdfDataUrl? }
// Bepaalt zelf het eerstvolgende versienummer (V1, V2, ...) op basis van wat
// er al in de projectmap (incl. "Oude versies") staat. Schrijft EERST de
// nieuwe versie weg (data.json + pdf in "03 Inmeetformulier", foto's in
// "Foto's", schetsen in "Schetsen") en verplaatst pas DAARNA de oudere
// versies naar "Oude versies". Mislukt het wegschrijven, dan blijft de vorige
// versie dus gewoon zichtbaar en bruikbaar.
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
      const basisPad = inmeetFormulierPad(jaarUitProjectnummer(projectnummer), folder.name);
      const versie = (await hoogsteVersieInclusiefArchief(basisPad, bestaandeFiles)) + 1;

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

      // Pas nu de nieuwe versie er volledig staat: oudere versies archiveren,
      // zodat buiten "Oude versies" alleen de nieuwste zichtbaar is. Lukt dat
      // niet, dan is de nieuwe versie toch opgeslagen (alleen staat de oude
      // er dan nog naast) - daarom geen foutmelding naar de gebruiker.
      try {
        await archiveerOudeVersies(basisPad, versie);
      } catch (archiefFout) {
        context.warn(`Archiveren oude versies mislukt (V${versie} is wel opgeslagen): ${archiefFout.message}`);
      }

      return { status: 200, jsonBody: { versie } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
