const { app } = require("@azure/functions");
const { findProjectFolder, listInmeetFiles, hoogsteVersie, downloadJson } = require("../graphHelpers");

// GET /api/project-ophalen?projectnummer=26001
// Zoekt de laatste opgeslagen versie voor een project en geeft die terug
// zodat het formulier vooraf ingevuld kan worden bij een 2e/3e opname.
app.http("projectOphalen", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "project-ophalen",
  handler: async (request, context) => {
    const projectnummer = (request.query.get("projectnummer") || "").trim();
    if (!projectnummer) {
      return { status: 400, jsonBody: { error: "projectnummer ontbreekt" } };
    }

    try {
      const folder = await findProjectFolder(projectnummer);
      if (!folder) {
        return { status: 404, jsonBody: { error: "Projectmap niet gevonden" } };
      }

      const files = await listInmeetFiles(folder.id);
      const versie = hoogsteVersie(files);
      if (versie === 0) {
        return { status: 404, jsonBody: { error: "Nog geen eerdere versie voor dit project" } };
      }

      const dataFile = files.find((f) => f.name === `Inmeetformulier_${projectnummer}_V${versie}_data.json`);
      if (!dataFile) {
        return { status: 404, jsonBody: { error: `Databestand van versie V${versie} niet gevonden` } };
      }

      const data = await downloadJson(dataFile.id);
      return { status: 200, jsonBody: { versie, data } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
