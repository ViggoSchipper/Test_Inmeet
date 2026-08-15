# API — SharePoint koppeling

Deze map bevat de backend (Azure Functions, meegeleverd via Azure Static Web
Apps) die het formulier koppelt aan SharePoint via Microsoft Graph. De
React-app praat nooit rechtstreeks met Graph — dat zou betekenen dat de
Client Secret in de browser terecht komt, wat niet veilig is. In plaats
daarvan roept de app deze twee endpoints aan:

- `GET /api/project-ophalen?projectnummer=26001` — zoekt de laatste
  opgeslagen versie voor dit project en geeft de gegevens terug, zodat het
  formulier vooraf ingevuld kan worden bij een volgende opname.
- `POST /api/project-opslaan` — bepaalt het eerstvolgende versienummer
  (V1, V2, ...) en schrijft `Inmeetformulier_{projectnummer}_V{n}_data.json`
  plus alle foto's en schetsen weg naar de projectmap.

## Verwachte mapstructuur in SharePoint

```
Nieuwe documenten/
  02 Projecten/
    2026/
      26001_Klantnaam_Plaatsnaam/
        01 Ontvangen/
        02 Verzonden/
        03 Inmeetformulier/        ← hier komt alles terecht
```

De projectmap (`26001_Klantnaam_Plaatsnaam`) moet al bestaan — die maakt de
verkoper vooraf aan vanuit de template. De code zoekt in
`02 Projecten/{jaar}` naar een map die begint met het ingevoerde
projectnummer (het jaar wordt afgeleid uit de eerste 2 cijfers, bv. 26001 →
2026).

## Benodigde App Settings

Zet deze in Azure Static Web Apps onder **Configuration** (of lokaal in
`api/local.settings.json`, gekopieerd van `local.settings.json.example` —
dat bestand staat in `.gitignore` en wordt dus nooit gecommit):

| Naam | Waarde |
|---|---|
| `AZURE_TENANT_ID` | Tenant ID van de Azure App registratie "Addon Inmeet Formulier" |
| `AZURE_CLIENT_ID` | Client ID van diezelfde App registratie |
| `AZURE_CLIENT_SECRET` | Het aangemaakte Client Secret |
| `SHAREPOINT_SITE_URL` | Volledige URL van de SharePoint site, bv. `https://addonbv.sharepoint.com/sites/<naam>` |
| `SHAREPOINT_LIBRARY_NAME` | Naam van de document bibliotheek (standaard `Nieuwe documenten`, hoeft niet ingesteld te worden tenzij die naam wijzigt) |

De App registratie heeft de application permissions `Sites.ReadWrite.All`
en `Files.ReadWrite.All` (met admin consent) nodig — die staan volgens de
laatste update al goed.

## Lokaal testen

```bash
cd api
npm install
cp local.settings.json.example local.settings.json   # en vul de echte waarden in
npm start
```

Gebruik bij voorkeur de [SWA CLI](https://learn.microsoft.com/azure/static-web-apps/local-development)
(`swa start`) vanuit de root van de repo, zodat de React-app en de API
samen draaien zoals in productie.
