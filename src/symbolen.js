import { E_UITVOERING_LEIDINGWERK } from "./schoon";

// Tekensymbolen voor de installatietekening, gelijk aan de "Elektra Legenda"
// die AddOn ook bij het tekenen gebruikt. Eén bron voor alles: de legenda-
// knoppen in de app, het stempelen op de tekening (canvas, via Path2D) en de
// legenda-tabel in de PDF (react-pdf Svg). Elk symbool is getekend in een
// vak van 40 x 40 (viewBox "0 0 40 40"), met lijnen en optioneel een tekstje.

const cirkel = (cx, cy, r) => `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy}`;
const boog = (x) => `M${x} 12 A8 8 0 0 0 ${x} 28`; // "(" die met zijn linkerkant op x-8 begint

export const SYMBOLEN = [
  { key: "wcd1", label: "Enkele wandcontactdoos", paden: [`M4 20 H14 M14 12 V28 ${boog(22)}`] },
  { key: "wcd2", label: "Dubbele wandcontactdoos", paden: [`M4 20 H12 M12 12 V28 ${boog(20)} ${boog(27)}`] },
  { key: "wcd3", label: "Driedubbele wandcontactdoos", paden: [`M2 20 H9 M9 12 V28 ${boog(17)} ${boog(23)} ${boog(29)}`] },
  { key: "spot", label: "Spotje", paden: [`${cirkel(20, 20, 9)} M13.6 13.6 L26.4 26.4 M26.4 13.6 L13.6 26.4`] },
  { key: "hanglamp", label: "Hanglamp", paden: [cirkel(20, 20, 11)], tekst: "HL" },
  { key: "wandlamp", label: "Wandlamp", paden: [cirkel(20, 20, 11)], tekst: "WL" },
  { key: "schakelaar", label: "Schakelaar", paden: [`${cirkel(14, 26, 4)} M17 23 L29 11 L33 15`] },
  { key: "dimmer", label: "Dimmer", paden: [`${cirkel(14, 26, 4)} M17 23 L29 11 L33 15 M19 11 L27 19 M27 19 L27 14.5 M27 19 L22.5 19`] },
  { key: "sensor", label: "Sensor", paden: [cirkel(20, 20, 11)], tekst: "S" },
  { key: "utp", label: "UTP", paden: ["M3 20 H22 M22 13 H36 V27 H22 Z"] },
  { key: "airco", label: "Airco", paden: ["M5 12 H35 V28 H5 Z"], tekst: "AC" },
  { key: "hwa", label: "HWA", paden: [`${cirkel(20, 20, 8)} M20 3 V37`] },
  { key: "buitenkraan", label: "Buitenkraan", paden: ["M13 8 H27 M20 8 V36 M20 22 H29 V29 M15 36 H25"] },
];

export const symboolOpKey = (key) => SYMBOLEN.find((s) => s.key === key);

// Tekent een symbool op een canvas-context, gecentreerd op (x, y), met de
// gegeven grootte in pixels (breedte = hoogte van het 40x40-vak).
export function tekenSymbool(ctx, symbool, x, y, grootte, kleur = "#1a1a1a") {
  const k = grootte / 40;
  ctx.save();
  ctx.translate(x - grootte / 2, y - grootte / 2);
  ctx.scale(k, k);
  ctx.strokeStyle = kleur;
  ctx.fillStyle = kleur;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  symbool.paden.forEach((d) => ctx.stroke(new Path2D(d)));
  if (symbool.tekst) {
    ctx.font = `bold ${symbool.tekst.length > 1 ? 11 : 13}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbool.tekst, 20, 20.5);
  }
  ctx.restore();
}

// --- Automatische legenda-tabel ------------------------------------------
// Eén regel per symbool (zoals de eigen AddOn-legenda). Kleur / Type en het
// opgegeven aantal komen uit E- en W-installaties; "getekend" telt hoe vaak
// het symbool in de installatietekening staat. Een symbool komt in de tabel
// zodra het is opgegeven óf getekend.

const RAL = { Wit: "RAL 9010", Zwart: "RAL 9005" };
const getal = (v) => {
  const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

function productRijen(data) {
  const d = data || {};
  const alleenLeidingwerk = d.eUitvoering === E_UITVOERING_LEIDINGWERK;
  const merk = alleenLeidingwerk ? "Klant" : d.schakelMerk === "Anders" ? (d.schakelMerkAnders || "Anders") : (d.schakelMerk || "");
  const kleur = alleenLeidingwerk ? "" : (RAL[d.schakelKleur] || d.schakelKleur || "");
  const heeft = (lijst, optie) => (d[lijst] || []).includes(optie);
  const buitenSpotKleur = d.buitenSpotjesKleur === "Kleur van overstek" ? (d.buitenSpotjesRAL || "Kleur overstek") : (RAL[d.buitenSpotjesKleur] || d.buitenSpotjesKleur || "");
  const hwaKleur = d.hwaMateriaal === "Zwart-zink" ? "Zwart" : "";
  const hwaType = d.hwaMateriaal === "Zwart-zink" ? "Zink" : (d.hwaMateriaal || "");
  const airco = heeft("warmteKoude", "Airco");

  const rijen = [
    { sym: "wcd1", omschrijving: "Enkele wandcontactdoos", kleur, type: merk, aantal: heeft("stopcontacten", "Enkel") ? getal(d.stopAantalEnkel) : 0 },
    { sym: "wcd2", omschrijving: "Dubbele wandcontactdoos", kleur, type: merk, aantal: heeft("stopcontacten", "Dubbel") ? getal(d.stopAantalDubbel) : 0 },
    { sym: "wcd3", omschrijving: "Driedubbele wandcontactdoos", kleur, type: merk, aantal: heeft("stopcontacten", "Tripel") ? getal(d.stopAantalTripel) : 0 },
    { sym: "wcd2", omschrijving: "Buitenstopcontact", kleur: RAL.Zwart, type: "NIKO inbouw hor.", aantal: d.wcd ? getal(d.wcdAantal) : 0 },
    { sym: "spot", omschrijving: "Spotje binnen", kleur: RAL[d.verlichtingSpotjesKleur] || "", type: "", aantal: heeft("verlichting", "Spotjes") ? getal(d.verAantalSpotjes) : 0 },
    { sym: "spot", omschrijving: "Spotje buiten", kleur: buitenSpotKleur, type: "", aantal: heeft("buitenVerlichting", "Spotjes") ? getal(d.buitenAantalSpotjes) : 0 },
    { sym: "hanglamp", omschrijving: "Hanglamp", kleur: "", type: d.hanglampOphangen ? "Klant levert" : "Aansluiting", aantal: heeft("verlichting", "Hanglamp") ? getal(d.verAantalHanglamp) : 0 },
    { sym: "wandlamp", omschrijving: "Wandlamp binnen", kleur: "", type: d.wandlampjesOphangen ? "Klant levert" : "Aansluiting", aantal: heeft("verlichting", "Wandlampjes") ? getal(d.verAantalWandlampjes) : 0 },
    { sym: "wandlamp", omschrijving: "Wandlamp buiten", kleur: "", type: d.buitenWandlampType === "Anders" ? "Klant levert" : (d.buitenWandlampType || ""), aantal: heeft("buitenVerlichting", "Wandlamp") ? getal(d.buitenAantalWandlamp) : 0 },
    { sym: "schakelaar", omschrijving: "Schakelaar", kleur, type: merk, aantal: heeft("schakelaars", "Schakelaar") ? getal(d.schAantalSchakelaar) : 0 },
    { sym: "dimmer", omschrijving: "Dimmer", kleur, type: merk, aantal: heeft("schakelaars", "Dimmer") ? getal(d.schAantalDimmer) : 0 },
    { sym: "sensor", omschrijving: "Sensor", kleur, type: merk, aantal: heeft("schakelaars", "Sensor") ? getal(d.schAantalSensor) : 0 },
    { sym: "airco", omschrijving: "Airco", kleur: "", type: d.aircoUitvoering === "Airco" ? (d.aircoVermogen || "Airco") : "Leidingwerk", aantal: airco ? 1 : 0 },
    { sym: "hwa", omschrijving: "HWA", kleur: hwaKleur, type: hwaType, aantal: d.hwaMateriaal ? getal(d.hwaAantal) : 0 },
    { sym: "buitenkraan", omschrijving: "Buitenkraan", kleur: "", type: "Vorstvrij", aantal: d.buitenkraan === "1" ? 1 : 0 },
  ];
  return rijen.filter((r) => r.aantal > 0);
}

export function legendaRijen(data) {
  const d = data || {};
  const producten = productRijen(d);
  const getekend = {};
  ((d.schetsInstallatieStaat && d.schetsInstallatieStaat.objecten) || []).forEach((o) => {
    if (o.type === "sym") getekend[o.key] = (getekend[o.key] || 0) + 1;
  });
  const uniek = (lijst) => [...new Set(lijst.filter(Boolean))].join(" / ");
  return SYMBOLEN
    .map((s) => {
      const rijen = producten.filter((r) => r.sym === s.key);
      const opgegeven = rijen.reduce((som, r) => som + r.aantal, 0);
      return {
        sym: s.key,
        omschrijving: s.label,
        kleur: uniek(rijen.map((r) => r.kleur)),
        type: uniek(rijen.map((r) => r.type)),
        detail: rijen.length > 1 ? rijen.map((r) => `${r.omschrijving} ${r.aantal}x`).join(", ") : "",
        aantal: opgegeven,
        getekend: getekend[s.key] || 0,
      };
    })
    .filter((r) => r.aantal > 0 || r.getekend > 0);
}
