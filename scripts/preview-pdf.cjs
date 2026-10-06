// Genereert een voorbeeld-PDF van het inmeetformulier met nepgegevens,
// zodat de opmaak lokaal gecontroleerd kan worden zonder de app te deployen.
//
// Gebruik:  node scripts/preview-pdf.cjs
//
// Dit script bundelt de echte src/pdf/InmeetPdf.jsx (dezelfde component die
// de app straks ook gebruikt) met esbuild naar CommonJS, en rendert hem
// vervolgens met @react-pdf/renderer's Node-API naar een PDF-bestand.

const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");

// 1. De React-component (JSX + ESM) on-the-fly bundelen naar CommonJS.
const bundlePath = path.join(__dirname, "._InmeetPdf.bundle.cjs");
esbuild.buildSync({
  entryPoints: [path.join(root, "src/pdf/InmeetPdf.jsx")],
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  outfile: bundlePath,
  external: ["react", "react/jsx-runtime", "@react-pdf/renderer"],
  logLevel: "warning",
});

const InmeetPdf = require(bundlePath).default;
const React = require("react");
const { renderToFile } = require("@react-pdf/renderer");

// 2. Nepgegevens + placeholder-afbeeldingen inladen.
const dummyImages = JSON.parse(fs.readFileSync(path.join(__dirname, "dummy-images.json"), "utf8"));

const logoPath = path.join(root, "src/assets/logo.png");
const logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

const data = {
  projectnummer: "26007",
  geslacht: "Dhr.",
  geslachtAnders: "",
  naam: "J. de Voorbeeld", ingemetenDoor: "Viggo", gevondenVia: "Google, daarna Instagram bekeken",
  datum: "2026-08-19",
  telefoon: "06-12345678",
  mail: "j.devoorbeeld@example.nl",
  plaats: "Voorbeeldstad",
  adres: "Teststraat 12",
  postcode: "1234 AB",
  opmerkingen: "Klant wil graag zo snel mogelijk starten, is de hele zomer thuis.",

  hoogte: "2600", diepte: "3500", breedteBuiten: "5400", breedteBinnen: "5320",

  ondergrond: "Klei", bereikbaarheid: ["Kraan"], rijplaten: "Benodigd",
  bouwtekeningen: "Aanwezig", vergunning: "Vergunningsvrij", doorbraakMM: "3200", constructeur: "Bouwadvies Jansen",
  kruipruimteStatus: "Droog, goed bereikbaar",

  binnenwand: "Spuitwerk", stucwerk: "Glad",

  steenstrip: "Rood", steenstripAnders: "",
  composiet: "Compleet zwart", composietAnders: "",
  keramaType: "Kerama Marazzi", keramaKleur: "Antraciet",
  houtType: "", houtKleur: "",
  gevelOpmerking: "Kleur moet aansluiten bij bestaande gevel.",

  k1Type: "Schuifpui", k1Opties: ["Hefschuifpui", "Actief links (buitenaanzicht)"], k1Opmerking: "Extra brede middenstijl gewenst.",
  k1Materiaal: "Aluminium", k1RAL: "RAL 7016", k1Glas: "Triple", k1Breedte: "4200", k1Hoogte: "2400",

  k2Type: "Openslaande deuren", k2Opties: ["Loopdeur links (binnenaanzicht)"], k2Opmerking: "",
  k2Materiaal: "Aluminium", k2RAL: "RAL 7016", k2Glas: "HR+++", k2Breedte: "1800", k2Hoogte: "2300",

  k3Type: "Raam", k3Opties: [], k3Opmerking: "Vast glas, geen opening.",
  k3Materiaal: "Kunststof", k3RAL: "Wit", k3Glas: "Triple", k3Breedte: "1200", k3Hoogte: "1000",

  dakbedekking: "EPDM", overstek: "Ja", overstekMM: "400",
  dakrandAfwerking: "Aluminium daktrim", dakrandMateriaal: "Aluminium", dakrandKleur: "RAL 7016",
  lichtstraat: "Ja", lichtsturaatFormaat: "2000x1000", lichtsturaatKleur: "Antraciet",
  dakVorm: "Plat dak", dakOpmerking: "Afschot richting achtertuin.",

  eUitvoering: "AddOn levert en monteert alles incl. afmontage", schakelMerk: "Gira 55", schakelKleur: "Wit",
  stopcontacten: ["Enkel", "Dubbel"], stopAantalEnkel: "2", stopAantalDubbel: "3",
  verlichting: ["Spotjes", "Hanglamp", "Wandlampjes"], verAantalSpotjes: "8", verAantalHanglamp: "1", verAantalWandlampjes: "2", verlichtingSpotjesKleur: "Wit", hanglampOphangen: true, verlichtingMerk: "Lumina", verlichtingType: "LED dimbaar", verlichtingKleur: "Wit",
  schakelaars: ["Dimmer", "Schakelaar"], hotelschakeling: true, hotelLampen: ["Binnen: Spotjes", "Buiten: Wandlamp"], schakelaarMerk: "Niko", schakelaarType: "Original", schakelaarKleur: "Antraciet",
  buitenVerlichting: ["Spotjes", "Wandlamp"], buitenAantalSpotjes: "4", buitenSpotjesKleur: "Kleur van overstek", buitenSpotjesRAL: "RAL 7016",
  buitenAantalWandlamp: "2", buitenWandlampType: "Levi Up & Down - Mat zwart (7745)",
  wcd: true, wcdAantal: "1",
  warmteKoude: ["Airco"], aircoUitvoering: "Airco", aircoVermogen: "4,2 kW",
  eOpmerking: "Groepenkast heeft nog 3 vrije groepen.",

  hwaMateriaal: "Zwart-zink", hwaAantal: "2", bladvanger: true, vergaarbak: false,
  buitenkraan: "1", vloerverwarming: "Aanbouw", vloerM2: "24", verdeler: "Verdeler ophangen", warmtebron: ["CV-ketel"],
  wOpmerking: "Aansluiting op bestaande ketel in bijkeuken.",

  ...dummyImages,
};

const outPath = path.join(root, "preview-inmeetformulier.pdf");

renderToFile(React.createElement(InmeetPdf, { data, logoSrc }), outPath)
  .then(() => {
    console.log(`PDF geschreven: ${outPath}`);
    fs.unlinkSync(bundlePath);
  })
  .catch((err) => {
    console.error("Genereren van PDF mislukt:", err);
    process.exitCode = 1;
  });
