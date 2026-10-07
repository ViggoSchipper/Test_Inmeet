// PDF-weergave van het inmeetformulier, gebouwd met @react-pdf/renderer.
// Deze component wordt op twee plekken gebruikt:
//   1. In de browser (App.jsx) om de PDF te genereren bij "Versturen & Opslaan".
//   2. In een los Node-scriptje (scripts/preview-pdf.cjs) om snel een
//      voorbeeld-PDF te genereren met nepgegevens, zonder de hele app te
//      hoeven deployen.
// Daarom bevat dit bestand puur de opmaak/structuur en géén browser- of
// Node-specifieke code.

import { Document, Page, Text, View, Image, StyleSheet, Font, Svg, Path } from "@react-pdf/renderer";
import { legendaRijen, symboolOpKey } from "../symbolen";
import { E_UITVOERING_LEIDINGWERK } from "../schoon";

const GOLD = "#B69148";
const BLACK = "#1a1a1a";
const GREY = "#888888";
const LIGHT_BORDER = "#e5e5e5";

const styles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 50,
    paddingHorizontal: 36,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: BLACK,
  },

  // --- Header / footer (herhaald op elke pagina) ---
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 66,
    paddingHorizontal: 36,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `2 solid ${GOLD}`,
  },
  headerLogo: { width: 92, height: 36, objectFit: "contain" },
  headerTitleBlock: { marginLeft: 14, flexGrow: 1 },
  headerTitle: { fontSize: 13, fontWeight: 700, color: BLACK },
  headerSubtitle: { fontSize: 9, color: GREY, marginTop: 2 },
  headerMeta: { alignItems: "flex-end" },
  headerMetaText: { fontSize: 8.5, color: GREY },
  headerMetaStrong: { fontSize: 9.5, color: BLACK, fontWeight: 700 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    paddingHorizontal: 36,
    borderTop: `0.75 solid ${LIGHT_BORDER}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7.5, color: GREY },

  // --- Voorpagina ---
  coverBox: {
    marginTop: 40,
    border: `1 solid ${GOLD}`,
    borderRadius: 4,
    padding: 24,
  },
  coverTitle: { fontSize: 22, fontWeight: 700, color: BLACK, marginBottom: 4 },
  coverAccent: { color: GOLD },
  coverSubtitle: { fontSize: 11, color: GREY, marginBottom: 18 },
  coverRow: { flexDirection: "row", marginBottom: 8 },
  coverLabel: { width: 130, fontSize: 10, color: GREY },
  coverValue: { fontSize: 11, fontWeight: 700, color: BLACK, flexGrow: 1 },

  // --- Secties met key/value velden ---
  section: { marginBottom: 14, breakInside: "avoid" },
  sectionTitleBar: {
    backgroundColor: BLACK,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sectionTitleText: { fontSize: 10.5, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldGrid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", flexDirection: "row", marginBottom: 5, paddingRight: 8 },
  fieldLabel: { fontSize: 9, color: GREY, width: 105, flexShrink: 0 },
  fieldValue: { fontSize: 9.5, color: BLACK, fontWeight: 500, flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  fieldValueEmpty: { fontSize: 9.5, color: "#c9c9c9", fontStyle: "italic" },
  meldingBlock: { marginTop: 2, marginBottom: 6, padding: 6, border: `1 solid ${GOLD}`, borderRadius: 3 },
  meldingText: { fontSize: 9.5, color: BLACK, fontWeight: 700 },
  opmerkingBlock: { marginTop: 2, paddingTop: 6, borderTop: `0.5 solid ${LIGHT_BORDER}` },
  opmerkingLabel: { fontSize: 8.5, color: GREY, marginBottom: 2, textTransform: "uppercase" },
  opmerkingText: { fontSize: 9.5, color: BLACK },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  swatchItem: { flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 4 },
  swatchBox: { width: 16, height: 16, borderRadius: 3, marginRight: 6, border: `0.5 solid ${LIGHT_BORDER}` },
  swatchLabel: { fontSize: 9, color: BLACK },
  swatchSub: { fontSize: 8, color: GREY },

  // --- Foto- en schetspagina's ---
  pageHeading: { fontSize: 13, fontWeight: 700, color: BLACK, marginBottom: 12 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  photoCard: {
    width: "48%",
    marginBottom: 14,
    border: `1 solid ${LIGHT_BORDER}`,
    borderRadius: 3,
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: 170, objectFit: "cover" },
  photoImagePlaceholder: {
    width: "100%",
    height: 170,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCaption: {
    fontSize: 9,
    fontWeight: 700,
    color: BLACK,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTop: `1 solid ${GOLD}`,
  },
  placeholderText: { fontSize: 8.5, color: "#bbb" },

  sketchCard: {
    marginBottom: 16,
    border: `1 solid ${LIGHT_BORDER}`,
    borderRadius: 3,
    overflow: "hidden",
  },
  sketchCaption: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
    backgroundColor: BLACK,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sketchImageWrap: { padding: 8, backgroundColor: "#ffffff" },
  sketchImage: { width: "100%", objectFit: "contain" },
  sketchImagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
});

// --- Kleine helpers -------------------------------------------------------

function waarde(v) {
  if (Array.isArray(v)) return v.length ? v.join(", ") : "";
  if (typeof v === "boolean") return v ? "Ja" : "Nee";
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

// Merk/Type schakelmateriaal als één leesbare regel, bijv. "Gira 55 (standaard) - Wit".
function schakelmateriaalTekst(data) {
  if (data.eUitvoering === E_UITVOERING_LEIDINGWERK) return "N.V.T. (afmonteren door klant)";
  const label = data.schakelMerk === "Anders"
    ? (data.schakelMerkAnders ? `Anders: ${data.schakelMerkAnders}` : "Anders")
    : { "Gira 55": "Gira 55 (standaard)", "Busch-Jaeger": "Busch-Jaeger (modern)" }[data.schakelMerk];
  if (!label) return "";
  return data.schakelKleur ? `${label} - ${data.schakelKleur}` : label;
}

// Zet gekozen opties + bijbehorende aantallen om in leesbare tekst,
// bijv. ["Enkel", "Dubbel"] + {Enkel: "3", Dubbel: "1"} => "Enkel (3x), Dubbel (1x)".
function metAantal(items, aantallen) {
  return (items || []).map((i) => (aantallen[i] ? `${i} (${aantallen[i]}x)` : i)).join(", ");
}

function Field({ label, value }) {
  const tekst = waarde(value);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {tekst ? <Text style={styles.fieldValue}>{tekst}</Text> : <Text style={styles.fieldValueEmpty}>—</Text>}
    </View>
  );
}

function Section({ title, fields, opmerking, swatches, melding }) {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionTitleBar}>
        <Text style={styles.sectionTitleText}>{title}</Text>
      </View>
      {swatches && swatches.length > 0 ? (
        <View style={styles.swatchRow}>
          {swatches.map((s) => (
            <View key={s.label} style={styles.swatchItem}>
              <View style={[styles.swatchBox, { backgroundColor: s.color || "#ffffff" }]} />
              <View>
                <Text style={styles.swatchLabel}>{s.label}</Text>
                {s.sub ? <Text style={styles.swatchSub}>{s.sub}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.fieldGrid}>
        {fields.map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </View>
      {melding ? (
        <View style={styles.meldingBlock}>
          <Text style={styles.meldingText}>{melding}</Text>
        </View>
      ) : null}
      {opmerking ? (
        <View style={styles.opmerkingBlock}>
          <Text style={styles.opmerkingLabel}>Opmerkingen</Text>
          <Text style={styles.opmerkingText}>{opmerking}</Text>
        </View>
      ) : null}
    </View>
  );
}

function PageChrome({ data, pageLabel, children, logoSrc }) {
  const projectTitel = [data.projectnummer, data.naam].filter(Boolean).join(" — ") || "Nieuw project";
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        {logoSrc ? <Image src={logoSrc} style={styles.headerLogo} /> : null}
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Inmeetformulier</Text>
          <Text style={styles.headerSubtitle}>{pageLabel}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaStrong}>{projectTitel}</Text>
          <Text style={styles.headerMetaText}>{data.plaats || ""}</Text>
        </View>
      </View>

      {children}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>AddOn Aanbouw op Maat — Inmeetformulier</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
        />
      </View>
    </Page>
  );
}

// Kleuren van de gevelbekleding-opties — zelfde kleuren als de keuzekaarten
// op de Gevelbekleding-pagina in de app zelf (App.jsx), zodat de PDF een
// visuele swatch kan tonen bij de gekozen optie. Dit zijn (nog) geen echte
// productfoto's — als Viggo echte materiaalfoto's aanlevert, kunnen die de
// swatch hieronder vervangen (en meteen ook de keuzekaarten in de app).
const COMPOSIET_KLEUREN = { "Rustic Teak": "#8B6914", "Compleet zwart": "#1a1a1a", "Teak met zwart": "#4a3010" };

// --- Foto's / schetsen: veld -> { label, key } -----------------------------

const FOTO_VELDEN = [
  { key: "fotoAchterBuiten", label: "Achtergevel — buitenkant" },
  { key: "fotoAchterBinnen", label: "Achtergevel — binnenkant" },
  { key: "fotoKruipruimte", label: "Kruipruimte" },
  { key: "fotoBereikbaarheid", label: "Bereikbaarheid werkplek" },
  { key: "steenstripFoto", label: "Gevelbekleding — Bestaande gevel (steenstrips)" },
  { key: "composietAndersFoto", label: "Gevelbekleding — Composiet (Anders)" },
  { key: "fotoVerdeler", label: "Bestaande verdeler (vloerverwarming)" },
  { key: "extraFoto1", label: "Extra foto 1" },
  { key: "extraFoto2", label: "Extra foto 2" },
  { key: "extraFoto3", label: "Extra foto 3" },
  { key: "extraFoto4", label: "Extra foto 4" },
];

const SCHETS_VELDEN = [
  { key: "schetsMaatvoering", label: "Schets — Maatvoering" },
  { key: "schetsKozijn1", label: "Schets — Kozijn 1" },
  { key: "schetsKozijn2", label: "Schets — Kozijn 2" },
  { key: "schetsKozijn3", label: "Schets — Kozijn 3" },
  { key: "schetsLichtstraatPositie", label: "Schets — Positie lichtstraat op dak" },
  { key: "schetsEinstallatie", label: "Installatietekening (E + W)" },
];

// Tekensymbool (zie symbolen.js) als klein vectorplaatje in de PDF.
function PdfSymbool({ symKey, grootte = 20 }) {
  const s = symboolOpKey(symKey);
  if (!s) return null;
  return (
    <View style={{ width: grootte, height: grootte, position: "relative" }}>
      <Svg width={grootte} height={grootte} viewBox="0 0 40 40">
        {s.paden.map((d, i) => <Path key={i} d={d} stroke={BLACK} strokeWidth={2} fill="none" />)}
      </Svg>
      {s.tekst ? (
        <Text style={{ position: "absolute", top: 0, left: 0, width: grootte, height: grootte, textAlign: "center", fontSize: grootte * (s.tekst.length > 1 ? 0.26 : 0.32), fontWeight: 700, paddingTop: grootte * 0.3 }}>{s.tekst}</Text>
      ) : null}
    </View>
  );
}

// Legenda onder de installatietekening: symbool, omschrijving, kleur, type, aantal.
function InstallatieLegenda({ data }) {
  const rijen = legendaRijen(data);
  if (rijen.length === 0) return null;
  const kol = [{ w: 28 }, { w: 150 }, { w: 90 }, { w: 150 }, { w: 50, right: true }, { w: 50, right: true }];
  const cel = (i, extra = {}) => ({ width: kol[i].w, fontSize: 9, paddingVertical: 2, paddingHorizontal: 3, textAlign: kol[i].right ? "right" : "left", ...extra });
  return (
    <View style={{ marginTop: 8, paddingHorizontal: 8, paddingBottom: 8 }}>
      <Text style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 4 }} minPresenceAhead={60}>Legenda</Text>
      <View style={{ flexDirection: "row", borderBottom: `1 solid ${GOLD}` }}>
        {["", "Omschrijving", "Kleur", "Type", "Opgegeven", "Getekend"].map((h, i) => <Text key={h + i} style={cel(i, { color: GREY })}>{h}</Text>)}
      </View>
      {rijen.map((r) => (
        <View key={r.sym} style={{ flexDirection: "row", alignItems: "center", borderBottom: "0.5 solid #e5e5e5" }} wrap={false}>
          <View style={cel(0)}><PdfSymbool symKey={r.sym} /></View>
          <View style={cel(1)}>
            <Text>{r.omschrijving}</Text>
            {r.detail ? <Text style={{ fontSize: 7.5, color: GREY }}>{r.detail}</Text> : null}
          </View>
          <Text style={cel(2)}>{r.kleur}</Text>
          <Text style={cel(3)}>{r.type}</Text>
          <Text style={cel(4)}>{r.aantal}</Text>
          <Text style={cel(5, r.aantal !== r.getekend ? { color: "#b9770e", fontWeight: 700 } : {})}>{r.getekend}</Text>
        </View>
      ))}
    </View>
  );
}

// "2026-09-30" -> "30-09-2026"
function datumNL(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(waarde(v));
  return m ? `${m[3]}-${m[2]}-${m[1]}` : waarde(v);
}

function fmtMM(v) {
  const t = waarde(v);
  return t ? `${t} MM` : "";
}

// --- Hoofdcomponent --------------------------------------------------------

export default function InmeetPdf({ data, logoSrc }) {
  const kozijnFields = (prefix) => [
    ["Type", data[`${prefix}Type`]],
    ["Opties", data[`${prefix}Opties`]],
    ["Raamtype", data[`${prefix}RaamType`]],
    ["Harmonica delen", data[`${prefix}HarmonicaDelen`]],
    ["Harmonica richting", data[`${prefix}HarmonicaRichting`]],
    ["Ventilatierooster", data[`${prefix}Ventilatierooster`]],
    ["Materiaal", data[`${prefix}Materiaal`]],
    ["RAL kleur", data[`${prefix}RAL`]],
    ["Glas", data[`${prefix}Glas`]],
    ["Breedte", fmtMM(data[`${prefix}Breedte`])],
    ["Hoogte", fmtMM(data[`${prefix}Hoogte`])],
  ];

  const aanwezigeFotos = FOTO_VELDEN.filter((f) => data[f.key]);
  const aanwezigeSchetsen = SCHETS_VELDEN.filter((f) => data[f.key]);

  return (
    <Document
      title={`Inmeetformulier ${data.projectnummer || ""} ${data.naam || ""}`.trim()}
      author="AddOn Aanbouw op Maat"
    >
      {/* --- Voorpagina --- */}
      <PageChrome data={data} pageLabel="Overzicht" logoSrc={logoSrc}>
        <View style={styles.coverBox}>
          <Text style={styles.coverTitle}>
            Inmeet<Text style={styles.coverAccent}>formulier</Text>
          </Text>
          <Text style={styles.coverSubtitle}>AddOn Aanbouw op Maat</Text>

          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Projectnummer</Text>
            <Text style={styles.coverValue}>{waarde(data.projectnummer) || "—"}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Klant</Text>
            <Text style={styles.coverValue}>{waarde(data.naam) || "—"}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Datum opname</Text>
            <Text style={styles.coverValue}>{datumNL(data.datum) || "—"}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Ingemeten door</Text>
            <Text style={styles.coverValue}>{waarde(data.ingemetenDoor) || "—"}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Adres</Text>
            <Text style={styles.coverValue}>
              {[data.adres, [data.postcode, data.plaats].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—"}
            </Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>Telefoon</Text>
            <Text style={styles.coverValue}>{waarde(data.telefoon) || "—"}</Text>
          </View>
          <View style={styles.coverRow}>
            <Text style={styles.coverLabel}>E-mail</Text>
            <Text style={styles.coverValue}>{waarde(data.mail) || "—"}</Text>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Section
            title="Contact"
            fields={[
              ["Aanhef", data.geslacht],
              ["Gevonden via", data.gevondenVia],
            ]}
            opmerking={waarde(data.opmerkingen)}
          />
        </View>
      </PageChrome>

      {/* --- Maatvoering & voorbereidingen --- */}
      <PageChrome data={data} pageLabel="Maatvoering & voorbereidingen" logoSrc={logoSrc}>
        <Section
          title="Maatvoering"
          fields={[
            ["Hoogte", fmtMM(data.hoogte)],
            ["Diepte buiten", fmtMM(data.diepteBuiten)],
            ["Diepte binnen", fmtMM(data.diepteBinnen)],
            ["Breedte buiten", fmtMM(data.breedteBuiten)],
            ["Breedte binnen", fmtMM(data.breedteBinnen)],
          ]}
        />
        <Section
          title="Voorbereidingen"
          fields={[
            ["Bereikbaarheid", data.bereikbaarheid],
            ["Rijplaten", data.rijplaten],
            ["Bouwtekeningen", data.bouwtekeningen],
            ["Vergunning", data.vergunning],
            ["Doorbraak", fmtMM(data.doorbraakMM)],
            ["Constructeur", data.constructeur],
            ["Kruipruimte", data.geenKruipruimte ? "Geen kruipruimte aanwezig" : data.fotoKruipruimte ? "Aanwezig (zie foto)" : ""],
          ]}
        />
        <Section
          title="Wandafwerking"
          fields={[
            ["Binnenwand", data.binnenwand],
            ["Stucwerk", data.stucwerk],
          ]}
        />
        <Section
          title="Gevelbekleding"
          swatches={[
            data.composiet && data.composiet !== "Anders"
              ? { label: `Composiet: ${data.composiet}`, color: COMPOSIET_KLEUREN[data.composiet] }
              : null,
          ].filter(Boolean)}
          fields={[
            ["Steenstrips", data.steenstrip],
            ["Steenstrip type", data.steenstripType],
            ["Steenstrip code", data.steenstripCode],
            ["Voegkleur", data.steenstripVoegkleur],
            ["Boven het kozijn", data.steenstripBovenKozijn],
            ["Composiet", data.composiet === "Anders" ? data.composietAnders : data.composiet],
            ["Kerama type", data.keramaType],
            ["Kerama kleur", data.keramaKleur],
            ["Hout type", data.houtType],
            ["Hout kleur", data.houtKleur],
          ]}
          opmerking={waarde(data.gevelOpmerking)}
        />
      </PageChrome>

      {/* --- Kozijnen --- */}
      <PageChrome data={data} pageLabel="Kozijnen" logoSrc={logoSrc}>
        <Section title="Kozijn 1" fields={kozijnFields("k1")} opmerking={waarde(data.k1Opmerking)} />
        {/* Kozijn 2 en 3 zijn optioneel: alleen tonen als er een type gekozen is. */}
        {waarde(data.k2Type) ? <Section title="Kozijn 2" fields={kozijnFields("k2")} opmerking={waarde(data.k2Opmerking)} /> : null}
        {waarde(data.k3Type) ? <Section title="Kozijn 3" fields={kozijnFields("k3")} opmerking={waarde(data.k3Opmerking)} /> : null}
      </PageChrome>

      {/* --- Dak & installaties --- */}
      <PageChrome data={data} pageLabel="Dak & installaties" logoSrc={logoSrc}>
        <Section
          title="Dak & lichtstraat"
          fields={[
            ["Dakbedekking", data.dakbedekking],
            ["Overstek", data.overstek === "Ja" ? ["Ja", fmtMM(data.overstekMM), waarde(data.overstekRAL) && `RAL ${waarde(data.overstekRAL)}`].filter(Boolean).join(", ") : data.overstek],
            ["Dakrandafwerking", data.dakrandAfwerking],
            ["Dakrand kleur RAL", data.dakrandKleur],
            ["Lichtstraat", data.lichtstraat],
            ["Lichtstraat lengte", fmtMM(data.lichtstraatLengteMM)],
            ["Lichtstraat breedte", fmtMM(data.lichtstraatBreedteMM)],
            ["Lichtstraat kleur", data.lichtstraatKleur],
            ["Lichtstraat aantal delen glas", data.lichtstraatDelenGlas],
          ]}
          opmerking={waarde(data.dakOpmerking)}
        />
        <Section
          title="E-installaties"
          fields={[
            ["Uitvoering", data.eUitvoering],
            ["Merk/Type", schakelmateriaalTekst(data)],
            ["Stopcontacten", metAantal(data.stopcontacten, { Enkel: data.stopAantalEnkel, Dubbel: data.stopAantalDubbel, Tripel: data.stopAantalTripel, Anders: data.stopAantalAnders })],
            ["Stopcontacten - Anders", data.stopcontactenAnders],
            ["Verlichting", metAantal(data.verlichting, { Spotjes: data.verAantalSpotjes, Hanglamp: data.verAantalHanglamp, Wandlampjes: data.verAantalWandlampjes })],
            ["Verlichting Spotjes kleur", data.verlichtingSpotjesKleur],
            ["Hanglamp ophangen", (data.verlichting || []).includes("Hanglamp") ? (data.hanglampOphangen ? "Ja (klant levert aan)" : "Nee") : ""],
            ["Wandlampjes ophangen", (data.verlichting || []).includes("Wandlampjes") ? (data.wandlampjesOphangen ? "Ja (klant levert aan)" : "Nee") : ""],
            ["Schakelaars", metAantal(data.schakelaars, { Schakelaar: data.schAantalSchakelaar, Dimmer: data.schAantalDimmer, Sensor: data.schAantalSensor })],
            ["Hotelschakeling", data.hotelschakeling ? ["Dubbel", (data.hotelLampen || []).join(", ")].filter(Boolean).join(" - ") : ""],
            ["Buiten verlichting", metAantal(data.buitenVerlichting, { Spotjes: data.buitenAantalSpotjes, Wandlamp: data.buitenAantalWandlamp })],
            ["Buiten spotjes kleur", data.buitenSpotjesKleur === "Kleur van overstek" ? `Kleur van overstek${data.buitenSpotjesRAL ? ` (${data.buitenSpotjesRAL})` : ""}` : data.buitenSpotjesKleur],
            ["Wandlamp", data.buitenWandlampType === "Anders" ? "Anders: klant levert zelf aan, AddOn monteert" : data.buitenWandlampType],
            ["Buitenstopcontact", data.wcd ? `Ja${data.wcdAantal ? `, aantal ${data.wcdAantal}` : ""} (Dubbel NIKO inbouw horizontaal zwart)` : "Nee"],
            ["Airco", (data.warmteKoude || []).includes("Airco") ? (data.aircoUitvoering === "Airco" ? `Airco${data.aircoVermogen ? ` ${data.aircoVermogen}` : ""}` : data.aircoUitvoering || "Ja") : ""],
          ]}
          melding={data.eUitvoering === E_UITVOERING_LEIDINGWERK
            ? "Let op: het afmonteren gebeurt door de klant. Zodra er iets aan de elektra wordt gewijzigd ten opzichte van de staat waarin de aanbouw onze werkplaats verlaat, vervalt de garantie van AddOn op de elektra." : null}
          opmerking={waarde(data.eOpmerking)}
        />
        <Section
          title="W-installaties"
          fields={[
            ["HWA", data.hwaMateriaal ? `${data.hwaMateriaal}${data.hwaAantal ? ` (${data.hwaAantal}x)` : ""}` : ""],
            ["Bladvanger", data.bladvanger],
            ["Vergaarbak", data.vergaarbak],
            ["Vorstvrije buitenkraan", data.buitenkraan],
            ["Vloerverwarming", data.vloerverwarming],
            ...(data.vloerverwarming && data.vloerverwarming !== "N.V.T." ? [
              ...(data.vloerverwarming === "Gehele woning" ? [["Oppervlakte", data.vloerM2 ? `${data.vloerM2} m²` : ""]] : []),
              ["Verdeler", data.verdeler],
              ...(data.verdeler === "Verdeler ophangen" ? [["Warmtebron", data.warmtebron]] : []),
            ] : []),
          ]}
          melding={data.vloerverwarming && data.vloerverwarming !== "N.V.T." && data.verdeler === "Verdeler ophangen"
            ? "LET OP: het ophangen en aansluiten van de verdeler gebeurt altijd op stelpost, vanwege de verschillende situaties. Op de locatie van de verdeler dient een stopcontact aanwezig te zijn. Is dit er niet, dan dient dit met AddOn afgestemd te worden. AddOn kan op de plek van de verdeler voor € 300,- incl. btw een stopcontact realiseren." : null}
          opmerking={waarde(data.wOpmerking)}
        />
      </PageChrome>

      {/* --- Foto's: 2 per rij --- */}
      {aanwezigeFotos.length > 0 && (
        <PageChrome data={data} pageLabel="Foto's" logoSrc={logoSrc}>
          <Text style={styles.pageHeading}>Foto's</Text>
          <View style={styles.photoGrid}>
            {aanwezigeFotos.map((f) => (
              <View key={f.key} style={styles.photoCard} wrap={false}>
                <Image src={data[f.key]} style={styles.photoImage} />
                <Text style={styles.photoCaption}>{waarde(data[`${f.key}Omschrijving`]) || f.label}</Text>
              </View>
            ))}
          </View>
        </PageChrome>
      )}

      {/* --- Schetsen: 1 per kaart, breed --- */}
      {aanwezigeSchetsen.length > 0 && (
        <PageChrome data={data} pageLabel="Schetsen" logoSrc={logoSrc}>
          <Text style={styles.pageHeading}>Schetsen</Text>
          {aanwezigeSchetsen.map((s) => (
            // De installatietekening krijgt een eigen pagina en een begrensde hoogte,
            // zodat de legenda eronder past (of netjes doorloopt op de volgende pagina).
            <View key={s.key} style={styles.sketchCard} wrap={s.key === "schetsEinstallatie"} break={s.key === "schetsEinstallatie"}>
              <Text style={styles.sketchCaption}>{s.label}</Text>
              <View style={styles.sketchImageWrap}>
                <Image src={data[s.key]} style={s.key === "schetsEinstallatie" ? { ...styles.sketchImage, height: 400 } : styles.sketchImage} />
              </View>
              {s.key === "schetsEinstallatie" ? <InstallatieLegenda data={data} /> : null}
            </View>
          ))}
        </PageChrome>
      )}
    </Document>
  );
}
