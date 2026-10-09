// "Opgeschoonde" kopie van de formuliergegevens voor de samenvatting, de PDF
// en het versturen naar SharePoint. Velden die in het formulier verborgen
// zijn omdat een bovenliggende keuze is gewijzigd (bijv. kozijnopties van een
// ander type, lichtstraatmaten bij N.V.T., kruipruimtefoto bij "geen
// kruipruimte") worden leeggemaakt. In de app zelf blijven ze wel bewaard,
// zodat terugklikken naar de oude keuze de ingevulde waarden terugbrengt.

export const E_UITVOERING_COMPLEET = "AddOn levert en monteert alles incl. afmontage";
export const E_UITVOERING_LEIDINGWERK = "AddOn verzorgt alleen leidingen en dozen";

export const STEENSTRIP_FORMATEN = ["Dikformaat (215x20x65)", "Waalformaat (210x20x50)"];
export const STEENSTRIP_LINK = "https://www.vandersanden.com/nl-nl/productzoeker/steenstrips";
export const KERAMA_LINK = "https://keramagroup.nl/gevelbekleding/";
export const HOUT_LINK = "https://www.gevenhout.nl/producten/__specie.thermo-frake";

export const COMPOSIET_KLEUREN = ["Teak met zwart", "Zwart", "Rustic Teak", "Rustic Eiken", "Rustic Brown", "Rustic grijs", "Eiken met zwart"];

// Welke kozijnopties bij welk kozijntype horen.
export const KOZIJN_OPTIES = {
  Schuifpui: [],
  "Openslaande deuren": ["Loopdeur links (binnenaanzicht)", "Loopdeur rechts (binnenaanzicht)", "Met zijlichten", "Vast glas"],
  Loopdeur: ["BW90 (Schuur)", "BW20 (Modern)", "Dicht"],
};

// Alleen de opties die bij het huidige kozijntype horen.
export const kozijnOpties = (data, prefix) =>
  (data[`${prefix}Opties`] || []).filter((o) => (KOZIJN_OPTIES[data[`${prefix}Type`]] || []).includes(o));

// Types met de keuze "Ventilatieroosters in vast glas".
export const KOZIJN_VENT_TYPES = ["Schuifpui"];
export const kozijnVentVastGlas = (data, prefix) =>
  KOZIJN_VENT_TYPES.includes(data[`${prefix}Type`]) && !!data[`${prefix}VentVastGlas`];

export const kozijnVastGlas = (data, prefix) =>
  kozijnOpties(data, prefix).includes("Vast glas") ||
  (data[`${prefix}Type`] === "Raam" && data[`${prefix}RaamType`] === "Vast glas");

export function schoneData(data) {
  const d = data || {};
  const s = { ...d };
  const leeg = (...keys) => keys.forEach((k) => { s[k] = ""; });
  const geen = (...keys) => keys.forEach((k) => { s[k] = null; });
  const heeft = (lijst, optie) => (d[lijst] || []).includes(optie);

  // Wandafwerking & kruipruimte
  if (d.binnenwand !== "Compleet afgewerkt") leeg("stucwerk");
  if (d.geenKruipruimte) geen("fotoKruipruimte");

  // Gevelbekleding
  if (!STEENSTRIP_FORMATEN.includes(d.steenstrip)) {
    leeg("steenstrip", "steenstripType", "steenstripCode", "steenstripVoegkleur", "steenstripBovenKozijn"); geen("steenstripFoto");
  }
  // Oude velden (vóór de Vandersanden-opzet), kunnen nog in een concept staan.
  delete s.steenstripAnders; delete s.steenstripAndersFoto;
  if (!COMPOSIET_KLEUREN.includes(d.composiet)) { leeg("composiet"); s.composietBreed = false; }
  if (d.houtKleur !== "Anders") leeg("houtKleurAnders");
  delete s.composietAnders; delete s.composietAndersFoto;

  // Kozijnen
  ["k1", "k2", "k3"].forEach((p) => {
    const type = d[`${p}Type`];
    s[`${p}Opties`] = kozijnOpties(d, p);
    if (type !== "Raam") leeg(`${p}RaamType`);
    if (type !== "Harmonica wand") leeg(`${p}HarmonicaDelen`, `${p}HarmonicaRichting`);
    if (!kozijnVastGlas(d, p)) leeg(`${p}Ventilatierooster`);
    if (type !== "Schuifpui") leeg(`${p}Delen`, `${p}Loopdeur`);
    if (!kozijnVentVastGlas(d, p)) { s[`${p}VentVastGlas`] = false; leeg(`${p}VentVak`); }
  });

  // Dak & lichtstraat
  if (d.dakrandAfwerking !== "Modern zetwerk") leeg("dakrandKleur");
  if (d.overstek !== "Ja") leeg("overstekMM", "overstekRAL");
  if (d.lichtstraat !== "Lessenaar" && d.lichtstraat !== "Zadeldak") {
    leeg("lichtstraatLengteMM", "lichtstraatBreedteMM", "lichtstraatKleur", "lichtstraatDelenGlas");
    geen("schetsLichtstraatPositie");
  }

  // E-installaties
  if (d.eUitvoering === E_UITVOERING_LEIDINGWERK) leeg("schakelMerk", "schakelMerkAnders", "schakelKleur");
  else if (d.schakelMerk !== "Anders") leeg("schakelMerkAnders");
  if (!heeft("stopcontacten", "Enkel")) leeg("stopAantalEnkel");
  if (!heeft("stopcontacten", "Dubbel")) leeg("stopAantalDubbel");
  if (!heeft("stopcontacten", "Tripel")) leeg("stopAantalTripel");
  if (!heeft("stopcontacten", "Anders")) leeg("stopAantalAnders", "stopcontactenAnders");
  if (!heeft("verlichting", "Spotjes")) leeg("verAantalSpotjes", "verlichtingSpotjesKleur");
  if (!heeft("verlichting", "Hanglamp")) { leeg("verAantalHanglamp"); s.hanglampOphangen = false; }
  if (!heeft("verlichting", "Wandlampjes")) { leeg("verAantalWandlampjes"); s.wandlampjesOphangen = false; }
  if (!heeft("schakelaars", "Schakelaar")) leeg("schAantalSchakelaar");
  if (!heeft("schakelaars", "Dimmer")) leeg("schAantalDimmer");
  if (!heeft("schakelaars", "Sensor")) leeg("schAantalSensor");
  if (!d.hotelschakeling) s.hotelLampen = [];
  if (!heeft("buitenVerlichting", "Spotjes")) leeg("buitenAantalSpotjes", "buitenSpotjesKleur", "buitenSpotjesRAL");
  else if (d.buitenSpotjesKleur !== "Kleur van overstek") leeg("buitenSpotjesRAL");
  if (!heeft("buitenVerlichting", "Wandlamp")) leeg("buitenAantalWandlamp", "buitenWandlampType");
  if (!d.wcd) leeg("wcdAantal");
  if (!heeft("warmteKoude", "Airco")) leeg("aircoUitvoering", "aircoVermogen");
  else if (d.aircoUitvoering !== "Airco") leeg("aircoVermogen");

  // W-installaties
  if (!d.hwaMateriaal) leeg("hwaAantal");
  if (d.vloerverwarming !== "Aanbouw" && d.vloerverwarming !== "Gehele woning") {
    leeg("vloerM2", "verdeler"); geen("fotoVerdeler"); s.warmtebron = [];
  } else {
    if (d.vloerverwarming !== "Gehele woning") leeg("vloerM2");
    if (d.verdeler !== "Verdeler aanwezig") geen("fotoVerdeler");
    if (d.verdeler !== "Verdeler ophangen") s.warmtebron = [];
  }

  // Niet meer gebruikt: losse W-tekening.
  delete s.schetsWinstallatie;
  return s;
}
