// PDF-weergave van het inmeetformulier, gebouwd met @react-pdf/renderer.
// Deze component wordt op twee plekken gebruikt:
//   1. In de browser (App.jsx) om de PDF te genereren bij "Versturen & Opslaan".
//   2. In een los Node-scriptje (scripts/preview-pdf.cjs) om snel een
//      voorbeeld-PDF te genereren met nepgegevens, zonder de hele app te
//      hoeven deployen.
// Daarom bevat dit bestand puur de opmaak/structuur en géén browser- of
// Node-specifieke code.

import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";

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
  fieldLabel: { fontSize: 9, color: GREY, width: 105 },
  fieldValue: { fontSize: 9.5, color: BLACK, fontWeight: 500, flexGrow: 1 },
  fieldValueEmpty: { fontSize: 9.5, color: "#c9c9c9", fontStyle: "italic" },
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

function Field({ label, value }) {
  const tekst = waarde(value);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {tekst ? <Text style={styles.fieldValue}>{tekst}</Text> : <Text style={styles.fieldValueEmpty}>—</Text>}
    </View>
  );
}

function Section({ title, fields, opmerking, swatches }) {
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
        <Text style={styles.footerText}>Add On Aanbouw op Maat — Inmeetformulier</Text>
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
const STEENSTRIP_KLEUREN = { Rood: "#c0392b", Grijs: "#95a5a6", Geel: "#d4ac0d" };
const COMPOSIET_KLEUREN = { "Rustic Teak": "#8B6914", "Compleet zwart": "#1a1a1a", "Teak met zwart": "#4a3010" };

// --- Foto's / schetsen: veld -> { label, key } -----------------------------

const FOTO_VELDEN = [
  { key: "fotoAchterBuiten", label: "Achtergevel — buitenkant" },
  { key: "fotoAchterBinnen", label: "Achtergevel — binnenkant" },
  { key: "fotoKruipruimte", label: "Kruipruimte" },
  { key: "fotoBereikbaarheid", label: "Bereikbaarheid werkplek" },
];

const SCHETS_VELDEN = [
  { key: "schetsMaatvoering", label: "Schets — Maatvoering" },
  { key: "schetsKozijn1", label: "Schets — Kozijn 1" },
  { key: "schetsKozijn2", label: "Schets — Kozijn 2" },
  { key: "schetsKozijn3", label: "Schets — Kozijn 3" },
  { key: "schetsEinstallatie", label: "Schets — Elektra installatie" },
  { key: "schetsWinstallatie", label: "Schets — Water/CV installatie" },
];

function fmtMM(v) {
  const t = waarde(v);
  return t ? `${t} MM` : "";
}

// --- Hoofdcomponent --------------------------------------------------------

export default function InmeetPdf({ data, logoSrc }) {
  const kozijnFields = (prefix) => [
    ["Type", data[`${prefix}Type`]],
    ["Opties", data[`${prefix}Opties`]],
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
      author="Add On Aanbouw op Maat"
    >
      {/* --- Voorpagina --- */}
      <PageChrome data={data} pageLabel="Overzicht" logoSrc={logoSrc}>
        <View style={styles.coverBox}>
          <Text style={styles.coverTitle}>
            Inmeet<Text style={styles.coverAccent}>formulier</Text>
          </Text>
          <Text style={styles.coverSubtitle}>Add On Aanbouw op Maat</Text>

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
            <Text style={styles.coverValue}>{waarde(data.datum) || "—"}</Text>
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
              ["Aanhef", data.geslacht === "Anders" ? data.geslachtAnders : data.geslacht],
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
            ["Diepte", fmtMM(data.diepte)],
            ["Breedte buiten", fmtMM(data.breedteBuiten)],
            ["Breedte binnen", fmtMM(data.breedteBinnen)],
          ]}
        />
        <Section
          title="Voorbereidingen"
          fields={[
            ["Ondergrond", data.ondergrond],
            ["Heipalen", data.heipalen],
            ["Bouwtekeningen", data.bouwtekeningen],
            ["Vergunning", data.vergunning],
            ["Doorbraak", fmtMM(data.doorbraakMM)],
            ["Constructeur", data.constructeur],
            ["Kruipruimte", data.kruipruimteStatus],
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
            data.steenstrip && data.steenstrip !== "Anders"
              ? { label: `Steenstrips: ${data.steenstrip}`, color: STEENSTRIP_KLEUREN[data.steenstrip] }
              : null,
            data.composiet && data.composiet !== "Anders"
              ? { label: `Composiet: ${data.composiet}`, color: COMPOSIET_KLEUREN[data.composiet] }
              : null,
          ].filter(Boolean)}
          fields={[
            ["Steenstrips", data.steenstrip === "Anders" ? data.steenstripAnders : data.steenstrip],
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
        <Section title="Kozijn 2" fields={kozijnFields("k2")} opmerking={waarde(data.k2Opmerking)} />
        <Section title="Kozijn 3" fields={kozijnFields("k3")} opmerking={waarde(data.k3Opmerking)} />
      </PageChrome>

      {/* --- Dak & installaties --- */}
      <PageChrome data={data} pageLabel="Dak & installaties" logoSrc={logoSrc}>
        <Section
          title="Dak & lichtstraat"
          fields={[
            ["Dakbedekking", data.dakbedekking],
            ["Dakvorm", data.dakVorm],
            ["Overstek", data.overstek === "Ja" ? `Ja, ${waarde(data.overstekMM)} MM` : data.overstek],
            ["Dakrand afwerking", data.dakrandAfwerking],
            ["Dakrand materiaal", data.dakrandMateriaal],
            ["Dakrand kleur", data.dakrandKleur],
            ["Lichtstraat", data.lichtstraat],
            ["Lichtstraat formaat", data.lichtsturaatFormaat],
            ["Lichtstraat kleur", data.lichtsturaatKleur],
          ]}
          opmerking={waarde(data.dakOpmerking)}
        />
        <Section
          title="E-installaties"
          fields={[
            ["Stopcontacten", data.stopcontacten],
            ["Stopcontact merk/type/kleur", [data.stopMerk, data.stopType, data.stopKleur].filter(Boolean).join(" / ")],
            ["Verlichting", data.verlichting],
            ["Verlichting merk/type/kleur", [data.verlichtingMerk, data.verlichtingType, data.verlichtingKleur].filter(Boolean).join(" / ")],
            ["Schakelaars", data.schakelaars],
            ["Schakelaar merk/type/kleur", [data.schakelaarMerk, data.schakelaarType, data.schakelaarKleur].filter(Boolean).join(" / ")],
            ["Buitenverlichting", data.buitenVerlichting],
            ["Buiten merk/type/kleur", [data.buitenVerlichtingMerk, data.buitenVerlichtingType, data.buitenVerlichtingKleur].filter(Boolean).join(" / ")],
            ["Wandcontactdoos (WCD)", data.wcd],
            ["WCD merk/type/kleur", [data.wcdMerk, data.wcdType, data.wcdKleur].filter(Boolean).join(" / ")],
            ["Warmte/koude", data.warmteKoude],
          ]}
          opmerking={waarde(data.eOpmerking)}
        />
        <Section
          title="W-installaties"
          fields={[
            ["HWA materiaal", data.hwaMateriaal],
            ["Bladvanger", data.bladvanger],
            ["Vergaarbak", data.vergaarbak],
            ["Warmte", data.warmte],
            ["Warmte scope", data.warmteScope],
            ["Warmte M2", fmtMM(data.warmteM2)],
            ["Ketel", data.ketel],
            ["Stadsverwarming", data.stadsverwarming],
            ["Buitenkraan", data.buitenkraan],
            ["Buitenkraan kleur", data.buitenkraanKleur],
            ["Warm/koud water", data.wkWater],
          ]}
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
                <Text style={styles.photoCaption}>{f.label}</Text>
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
            <View key={s.key} style={styles.sketchCard} wrap={false}>
              <Text style={styles.sketchCaption}>{s.label}</Text>
              <View style={styles.sketchImageWrap}>
                <Image src={data[s.key]} style={styles.sketchImage} />
              </View>
            </View>
          ))}
        </PageChrome>
      )}
    </Document>
  );
}
