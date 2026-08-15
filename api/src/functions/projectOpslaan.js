const { app } = require("@azure/functions");
const {
  FOTO_VELDEN,
  SCHETS_VELDEN,
  jaarUitProjectnummer,
  findProjectFolder,
  listInmeetFiles,
  hoogsteVersie,
  parseDataUrl,
  uploadFile,
  inmeetFormulierPad,
} = require("../graphHelpers");

// POST /api/project-opslaan   body: { projectnummer, data }
// Bepaalt zelf het eerstvolgende versienummer (V1, V2, ...) op basis van wat
// er al in de projectmap staat, en schrijft data.json + losse foto's + losse
// schetsen weg naar .../{projectmap}/03 Inmeetformulier.
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

      // Volledige formulierdata (incl. foto's/schetsen als base64) - dient als
      // bron voor prefill bij een volgende opname van hetzelfde project.
      await uploadFile(
        basisPad,
        `Inmeetformulier_${projectnummer}_V${versie}_data.json`,
        Buffer.from(JSON.stringify(data)),
        "application/json"
      );

      // Losse foto's en schetsen, zodat iemand die de map opent ze direct kan
      // bekijken zonder het databestand te hoeven openen.
      const uploads = [];
      for (const [veld, bestandsnaam] of Object.entries({ ...FOTO_VELDEN, ...SCHETS_VELDEN })) {
        const waarde = data[veld];
        if (!waarde) continue;
        const parsed = parseDataUrl(waarde);
        if (!parsed) continue;
        uploads.push(uploadFile(basisPad, `${bestandsnaam}_V${versie}.${parsed.ext}`, parsed.buffer, parsed.mime));
      }
      await Promise.all(uploads);

      return { status: 200, jsonBody: { versie } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
