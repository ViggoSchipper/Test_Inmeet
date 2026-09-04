// Add On Aanbouw op Maat - Inmeet Formulier App
// Full React SPA - works as iPad PWA

import { useState, useRef, useEffect } from "react";
import logoUrl from "./assets/logo.png";
// @react-pdf/renderer is een zware library (~500KB gzipped). Die wordt pas
// ingeladen op het moment dat de opmeter daadwerkelijk op "PDF bekijken"
// klikt (zie bekijkPdf hieronder), zodat de eerste keer laden van de app
// op de iPad niet onnodig trager wordt.

const GOLD = "#B69148";
const BLACK = "#1a1a1a";
const LIGHT = "#f5f5f5";

const styles = {
  app: { fontFamily: "'Segoe UI', sans-serif", background: LIGHT, minHeight: "100vh", width: "100vw", boxSizing: "border-box", overflowX: "hidden", padding: 0, margin: 0 },
  header: { borderTop: `5px solid ${GOLD}`, background: "white", padding: "12px 20px", borderBottom: `2px solid ${GOLD}`, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  logoText: { fontSize: 22, fontWeight: 900, color: BLACK, letterSpacing: -1 },
  logoAccent: { color: GOLD },
  pageTitle: { fontSize: 18, fontWeight: 600, color: BLACK, marginLeft: 4 },
  progress: { display: "flex", gap: 4, marginLeft: "auto", alignItems: "center" },
  progressDot: (active, done) => ({ width: active ? 10 : 6, height: active ? 10 : 6, borderRadius: "50%", background: done ? GOLD : active ? BLACK : "#ccc", transition: "all 0.2s" }),
  body: { padding: "20px 24px 100px", width: "100%" },
  section: { background: "white", borderRadius: 10, border: `1px solid #e8e8e8`, marginBottom: 16, overflow: "hidden", width: "100%" },
  sectionHeader: { padding: "10px 16px", borderBottom: `1px solid ${GOLD}`, background: "white" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: BLACK, margin: 0 },
  sectionBody: { padding: "14px 16px" },
  row: { display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap" },
  label: { fontSize: 13, fontWeight: 600, color: BLACK, minWidth: 120 },
  hint: { fontSize: 11, color: GOLD, fontStyle: "italic", marginTop: 2 },
  input: { border: `1px solid #ddd`, borderRadius: 6, padding: "8px 12px", fontSize: 13, flex: 1, minWidth: 140, outline: "none", color: BLACK },
  inputSmall: { border: `1px solid #ddd`, borderRadius: 6, padding: "8px 12px", fontSize: 13, width: 100, outline: "none", color: BLACK },
  textarea: { border: `1px solid #ddd`, borderRadius: 6, padding: "10px 12px", fontSize: 13, width: "100%", minHeight: 80, resize: "vertical", outline: "none", color: BLACK, fontFamily: "inherit", boxSizing: "border-box" },
  radioGroup: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" },
  radioLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: BLACK, cursor: "pointer" },
  checkGroup: { display: "flex", flexDirection: "column", gap: 8 },
  checkLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: BLACK, cursor: "pointer" },
  divider: { height: 1, background: `${GOLD}33`, margin: "12px 0" },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: `2px solid ${GOLD}`, padding: "12px 20px", display: "flex", justifyContent: "space-between" },
  btnPrev: { background: "white", border: `2px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnNext: { background: GOLD, border: "none", color: "white", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  photoBox: { border: `2px dashed ${GOLD}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer", background: "#fdfcf8", minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 },
  photoThumb: { width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6, marginTop: 8 },
  canvas: { border: `2px solid ${GOLD}`, borderRadius: 8, cursor: "crosshair", touchAction: "none", display: "block", width: "100%", background: "white" },
  canvasToolbar: { display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  toolBtn: (active) => ({ background: active ? GOLD : "white", color: active ? "white" : GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }),
  badge: { background: `${GOLD}22`, color: GOLD, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 },
  optionCard: (selected) => ({ border: `2px solid ${selected ? GOLD : "#e0e0e0"}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", background: selected ? `${GOLD}11` : "white", transition: "all 0.15s" }),
  subSection: { background: "#fdfcf8", border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "12px 14px", marginTop: 10 },
  foutBanner: { background: "#fdecea", border: "1.5px solid #c0392b", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "#c0392b", fontSize: 13 },
  foutBannerTitel: { fontWeight: 700, marginBottom: 4 },
};

// Canvas Drawing Component
// Gestuurd (controlled) via value/onChange zodat schetsen net als foto's opgeslagen,
// vooraf ingevuld (prefill bij 2e opname) en gewijzigd kunnen worden.
function DrawingCanvas({ id, value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1a1a");
  const lastPos = useRef(null);
  const loadedValueRef = useRef(null);

  const drawImageOnCanvas = (canvas, ctx, src) => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.offsetWidth, 300);
      loadedValueRef.current = src;
    };
    img.src = src;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = 300 * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) drawImageOnCanvas(canvas, ctx, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vult de schets alsnog in als de vorige-versie-data later binnenkomt (async prefill)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value || value === loadedValueRef.current) return;
    const ctx = canvas.getContext("2d");
    drawImageOnCanvas(canvas, ctx, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;
    const dataUrl = canvas.toDataURL("image/png");
    loadedValueRef.current = dataUrl;
    onChange(dataUrl);
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.offsetWidth / rect.width;
    const scaleY = (canvas.height / window.devicePixelRatio) / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "white" : color;
    ctx.lineWidth = tool === "eraser" ? 20 : 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    exportImage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    exportImage();
  };

  return (
    <div>
      <div style={styles.canvasToolbar}>
        {["pen", "eraser"].map(t => (
          <button key={t} style={styles.toolBtn(tool === t)} onClick={() => setTool(t)}>
            {t === "pen" ? "✏️ Pen" : "⬜ Gum"}
          </button>
        ))}
        {["#1a1a1a", "#B69148", "#e74c3c", "#2980b9"].map(c => (
          <div key={c} onClick={() => { setTool("pen"); setColor(c); }}
            style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: color === c && tool === "pen" ? "3px solid #333" : "2px solid #eee" }} />
        ))}
        <button style={styles.toolBtn(false)} onClick={clearCanvas}>🗑️ Wissen</button>
      </div>
      <canvas ref={canvasRef} style={{ ...styles.canvas, height: 300 }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
    </div>
  );
}

// Photo Upload Component
function PhotoUpload({ label, hint, value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: BLACK, marginBottom: 6 }}>{label}</div>}
      {hint && <div style={styles.hint}>{hint}</div>}
      <div style={styles.photoBox} onClick={() => inputRef.current.click()}>
        {value ? (
          <img src={value} alt="upload" style={styles.photoThumb} />
        ) : (
          <>
            <div style={{ fontSize: 28 }}>📷</div>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Foto toevoegen</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>Tik om te uploaden</div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f); } }} />
    </div>
  );
}

// Radio component
function RadioGroup({ name, options, value, onChange }) {
  return (
    <div style={styles.radioGroup}>
      {options.map(opt => (
        <label key={opt} style={styles.radioLabel}>
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)}
            style={{ accentColor: GOLD }} />
          {opt}
        </label>
      ))}
    </div>
  );
}

// Checkbox component
function CheckGroup({ options, values, onChange }) {
  return (
    <div style={styles.checkGroup}>
      {options.map(opt => (
        <label key={opt} style={styles.checkLabel}>
          <input type="checkbox" checked={values.includes(opt)} style={{ accentColor: GOLD, width: 16, height: 16 }}
            onChange={e => { if (e.target.checked) onChange([...values, opt]); else onChange(values.filter(v => v !== opt)); }} />
          {opt}
        </label>
      ))}
    </div>
  );
}

const PAGES = [
  "Contact", "Maatvoering", "Maatvoering Schets", "Voorbereidingen", "Voorbereiding Foto's",
  "Wandafwerking", "Gevelbekleding", "Kozijn 1", "Kozijn 1 Schets", "Kozijn 2", "Kozijn 2 Schets",
  "Kozijn 3", "Kozijn 3 Schets", "Dak & Lichtstraat", "E-installaties", "E-installatie Tekening",
  "W-installaties", "W-installatie Tekening", "Samenvatting"
];

// --- Verplichte-veldvalidatie -------------------------------------------
// Per pagina (zelfde volgorde/index als PAGES) een functie die controleert
// of alle verplichte velden op die pagina zijn ingevuld. Geeft een lijst
// met leesbare namen van wat er nog mist terug (leeg = alles goed). Een
// pagina zonder validator (null) heeft geen verplichte velden.
function heeftWaarde(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "boolean") return v;
  return v !== null && v !== undefined && String(v).trim() !== "";
}

// Kozijn 1 is altijd verplicht in te vullen; kozijn 2/3 alleen als de
// opmeter er zelf een "Type" voor kiest (niet elk project heeft 3 kozijnen)
// - is er geen type gekozen, dan mag de hele pagina overgeslagen worden.
function kozijnValidator(prefix, naam, altijdVerplicht) {
  return (data) => {
    const type = data[`${prefix}Type`];
    if (!altijdVerplicht && !heeftWaarde(type)) return [];
    const missend = [];
    if (!heeftWaarde(type)) missend.push(`${naam}: type`);
    if (!heeftWaarde(data[`${prefix}Materiaal`])) missend.push(`${naam}: materiaal`);
    if (!heeftWaarde(data[`${prefix}RAL`])) missend.push(`${naam}: RAL kleur`);
    if (!heeftWaarde(data[`${prefix}Glas`])) missend.push(`${naam}: glas`);
    if (!heeftWaarde(data[`${prefix}Breedte`])) missend.push(`${naam}: breedte`);
    if (!heeftWaarde(data[`${prefix}Hoogte`])) missend.push(`${naam}: hoogte`);
    return missend;
  };
}

const PAGE_VALIDATORS = [
  // 0: Contact
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.projectnummer)) missend.push("Projectnummer");
    if (!heeftWaarde(data.naam)) missend.push("Naam");
    if (!heeftWaarde(data.geslacht)) missend.push("Aanhef");
    if (!heeftWaarde(data.telefoon)) missend.push("Telefoon");
    if (!heeftWaarde(data.mail)) missend.push("Mail");
    if (!heeftWaarde(data.plaats)) missend.push("Plaats");
    if (!heeftWaarde(data.adres)) missend.push("Adres");
    if (!heeftWaarde(data.postcode)) missend.push("Postcode");
    return missend;
  },
  // 1: Maatvoering
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.hoogte)) missend.push("Hoogte");
    if (!heeftWaarde(data.diepteBuiten) && !heeftWaarde(data.diepteBinnen)) missend.push("Diepte (buiten of binnen)");
    if (!heeftWaarde(data.breedteBuiten) && !heeftWaarde(data.breedteBinnen)) missend.push("Breedte (buiten of binnen)");
    return missend;
  },
  // 2: Maatvoering Schets
  (data) => (heeftWaarde(data.schetsMaatvoering) ? [] : ["Schets maatvoering"]),
  // 3: Voorbereidingen
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.ondergrond)) missend.push("Ondergrond");
    if (!heeftWaarde(data.heipalen)) missend.push("Bereikbaarheid");
    if (!heeftWaarde(data.bouwtekeningen)) missend.push("Bouwtekeningen");
    if (!heeftWaarde(data.vergunning)) missend.push("Vergunning");
    if (!heeftWaarde(data.constructeur)) missend.push("Constructeur");
    return missend;
  },
  // 4: Voorbereiding Foto's
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.fotoAchterBinnen)) missend.push("Foto achtergevel binnen");
    if (!heeftWaarde(data.fotoAchterBuiten)) missend.push("Foto achtergevel buiten");
    if (!heeftWaarde(data.kruipruimteStatus)) missend.push("Kruipruimte status");
    if (data.kruipruimteStatus === "Vloeroplegging foto bijgevoegd" && !heeftWaarde(data.fotoKruipruimte)) missend.push("Foto kruipruimte");
    if (!heeftWaarde(data.fotoBereikbaarheid)) missend.push("Foto bereikbaarheid");
    return missend;
  },
  // 5: Wandafwerking
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.binnenwand)) missend.push("Binnenwand afwerking");
    if (data.binnenwand === "Compleet afgewerkt" && !heeftWaarde(data.stucwerk)) missend.push("Stucwerk");
    return missend;
  },
  // 6: Gevelbekleding - niet elk project gebruikt elke materiaalsoort, dus
  // alleen controleren dat er in elk geval íets gekozen is.
  (data) => {
    const ietsGekozen = heeftWaarde(data.steenstrip) || heeftWaarde(data.composiet) || heeftWaarde(data.keramaType) || heeftWaarde(data.houtType);
    return ietsGekozen ? [] : ["Minimaal één gevelbekleding-optie (steenstrips, composiet, kerama of hout)"];
  },
  // 7: Kozijn 1 (altijd verplicht)
  kozijnValidator("k1", "Kozijn 1", true),
  // 8: Kozijn 1 Schets
  (data) => (heeftWaarde(data.schetsKozijn1) ? [] : ["Schets kozijn 1"]),
  // 9: Kozijn 2 (alleen verplicht als er een type gekozen is)
  kozijnValidator("k2", "Kozijn 2", false),
  // 10: Kozijn 2 Schets
  (data) => (data.k2Type && !heeftWaarde(data.schetsKozijn2) ? ["Schets kozijn 2"] : []),
  // 11: Kozijn 3 (alleen verplicht als er een type gekozen is)
  kozijnValidator("k3", "Kozijn 3", false),
  // 12: Kozijn 3 Schets
  (data) => (data.k3Type && !heeftWaarde(data.schetsKozijn3) ? ["Schets kozijn 3"] : []),
  // 13: Dak & Lichtstraat
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.dakbedekking)) missend.push("Dakbedekking");
    if (!heeftWaarde(data.dakrandAfwerking)) missend.push("Dakrand afwerking");
    if (!heeftWaarde(data.dakrandKleur)) missend.push("Dakrand kleur RAL");
    if (!heeftWaarde(data.overstek)) missend.push("Overstek");
    if (data.overstek === "Ja" && !heeftWaarde(data.overstekMM)) missend.push("Overstek MM");
    if (!heeftWaarde(data.dakVorm)) missend.push("Dakvorm");
    if (!heeftWaarde(data.lichtstraat)) missend.push("Lichtstraat");
    if (data.lichtstraat === "Ja") {
      if (!heeftWaarde(data.lichtsturaatFormaat)) missend.push("Lichtstraat formaat");
      if (!heeftWaarde(data.lichtsturaatKleur)) missend.push("Lichtstraat kleur");
    }
    return missend;
  },
  // 14: E-installaties - veel losse, optionele keuzes; alleen checken dat
  // de pagina niet helemaal leeg is.
  (data) => {
    const iets = heeftWaarde(data.stopcontacten) || heeftWaarde(data.verlichting) || heeftWaarde(data.schakelaars) ||
      heeftWaarde(data.warmteKoude) || data.buitenVerlichting || data.wcd;
    return iets ? [] : ["Minimaal één keuze bij stopcontacten, verlichting, schakelaars of warmte/koude"];
  },
  // 15: E-installatie Tekening - geen verplichte velden.
  null,
  // 16: W-installaties - HWA is altijd relevant (elk dak heeft een
  // hemelwaterafvoer), de rest is projectafhankelijk.
  (data) => (heeftWaarde(data.hwaMateriaal) ? [] : ["HWA materiaal"]),
  // 17: W-installatie Tekening - geen verplichte velden.
  null,
];

export default function App() {
  const [page, setPage] = useState(0);
  const [foutmeldingen, setFoutmeldingen] = useState([]);
  const [data, setData] = useState({
    // Contact
    projectnummer: "",
    geslacht: "", naam: "", datum: new Date().toISOString().split("T")[0],
    telefoon: "", mail: "", plaats: "", adres: "", postcode: "", opmerkingen: "",
    // Maatvoering
    hoogte: "", diepteBuiten: "", diepteBinnen: "", breedteBuiten: "", breedteBinnen: "",
    schetsMaatvoering: null,
    // Voorbereidingen
    ondergrond: "", heipalen: [], bereikbaarheidFoto: null,
    bouwtekeningen: "", vergunning: "", doorbraakMM: "", constructeur: "",
    // Foto's
    fotoAchterBuiten: null, fotoAchterBinnen: null, fotoKruipruimte: null, fotoBereikbaarheid: null,
    kruipruimteStatus: "",
    // Wandafwerking
    binnenwand: "", stucwerk: "",
    // Gevelbekleding
    steenstrip: "", steenstripAnders: "",
    composiet: "", composietAnders: "",
    keramaType: "", keramaKleur: "",
    houtType: "", houtKleur: "",
    gevelOpmerking: "",
    // Kozijn 1
    k1Type: "", k1Opties: [], k1Opmerking: "", k1Materiaal: "", k1RAL: "", k1Glas: "", k1Breedte: "", k1Hoogte: "",
    schetsKozijn1: null,
    // Kozijn 2
    k2Type: "", k2Opties: [], k2Opmerking: "", k2Materiaal: "", k2RAL: "", k2Glas: "", k2Breedte: "", k2Hoogte: "",
    schetsKozijn2: null,
    // Kozijn 3
    k3Type: "", k3Opties: [], k3Opmerking: "", k3Materiaal: "", k3RAL: "", k3Glas: "", k3Breedte: "", k3Hoogte: "",
    schetsKozijn3: null,
    // Dak
    dakbedekking: "", overstek: "", overstekMM: "", dakrandAfwerking: "", dakrandMateriaal: "", dakrandKleur: "",
    lichtstraat: "", lichtsturaatFormaat: "", lichtsturaatKleur: "", dakVorm: "", dakOpmerking: "",
    // E-installaties
    stopcontacten: [], stopMerk: "", stopType: "", stopKleur: "",
    verlichting: [], verlichtingMerk: "", verlichtingType: "", verlichtingKleur: "",
    schakelaars: [], schakelaarMerk: "", schakelaarType: "", schakelaarKleur: "",
    buitenVerlichting: false, buitenVerlichtingMerk: "", buitenVerlichtingType: "", buitenVerlichtingKleur: "",
    wcd: false, wcdMerk: "Niko", wcdType: "Hor", wcdKleur: "Zwart",
    warmteKoude: [],
    eOpmerking: "",
    schetsEinstallatie: null,
    // W-installaties
    hwaMateriaal: "", bladvanger: false, vergaarbak: false,
    warmte: "", warmteScope: "", warmteM2: "", ketel: false, stadsverwarming: false,
    buitenkraan: "", buitenkraanKleur: "", wkWater: "",
    wOpmerking: "",
    schetsWinstallatie: null,
  });

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  // --- Projectnummer: bestaande gegevens ophalen bij SharePoint (prefill bij 2e/3e opname) ---
  const [projectStatus, setProjectStatus] = useState({ loading: false, error: null, foundVersion: null, nextVersion: 1 });

  const projectGegevensOphalen = async (nr) => {
    const projectnummer = (nr || "").trim();
    if (!projectnummer) {
      setProjectStatus({ loading: false, error: null, foundVersion: null, nextVersion: 1 });
      return;
    }
    setProjectStatus(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/project-ophalen?projectnummer=${encodeURIComponent(projectnummer)}`);
      if (res.status === 404) {
        setProjectStatus({ loading: false, error: null, foundVersion: null, nextVersion: 1 });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Kon project niet ophalen");
      }
      const json = await res.json();
      setData(d => ({ ...d, ...json.data, projectnummer }));
      setProjectStatus({ loading: false, error: null, foundVersion: json.versie, nextVersion: json.versie + 1 });
    } catch (err) {
      setProjectStatus({ loading: false, error: err.message, foundVersion: null, nextVersion: 1 });
    }
  };

  // --- PDF genereren: gedeelde helper, gebruikt door zowel "PDF bekijken"
  // (hieronder) als "Versturen & Opslaan" (die de PDF meestuurt naar
  // SharePoint). @react-pdf/renderer wordt pas dynamisch ingeladen op het
  // moment dat hij nodig is, zodat het eerste laden van de app op de iPad
  // niet trager wordt door deze (~500KB) library. ---
  const genereerPdfBlob = async () => {
    const [{ pdf }, { default: InmeetPdf }, { createElement }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./pdf/InmeetPdf"),
      import("react"),
    ]);
    return pdf(createElement(InmeetPdf, { data, logoSrc: logoUrl })).toBlob();
  };

  const blobNaarDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // --- PDF bekijken: genereert de PDF in de browser met de echte
  // formuliergegevens, zodat de opmeter hem kan controleren voordat er
  // verstuurd wordt. ---
  const [pdfStatus, setPdfStatus] = useState({ loading: false, error: null });

  const bekijkPdf = async () => {
    setPdfStatus({ loading: true, error: null });
    // Het nieuwe tabblad moet synchroon met de klik geopend worden, anders
    // blokkeert Safari op iPad de popup omdat het genereren van de PDF
    // asynchroon gebeurt.
    const nieuwTab = window.open("", "_blank");
    try {
      const blob = await genereerPdfBlob();
      const url = URL.createObjectURL(blob);
      if (nieuwTab) nieuwTab.location.href = url;
      else window.location.href = url;
      setPdfStatus({ loading: false, error: null });
    } catch (err) {
      if (nieuwTab) nieuwTab.close();
      setPdfStatus({ loading: false, error: err.message || "PDF genereren is mislukt" });
    }
  };

  // --- Versturen & Opslaan: schrijft data.json + foto's + schetsen weg naar SharePoint ---
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, done: false, versie: null });

  const versturenEnOpslaan = async () => {
    if (!data.projectnummer || !data.projectnummer.trim()) {
      setSubmitStatus({ loading: false, error: "Vul eerst een projectnummer in op de Contact-pagina.", done: false, versie: null });
      setPage(0);
      return;
    }
    setSubmitStatus({ loading: true, error: null, done: false, versie: null });
    try {
      // Dezelfde PDF die "PDF bekijken" ook zou tonen, wordt meegestuurd zodat
      // die als leesbaar bestand naast de data.json in de 03 Inmeetformulier-
      // map terechtkomt.
      const pdfBlob = await genereerPdfBlob();
      const pdfDataUrl = await blobNaarDataUrl(pdfBlob);

      const res = await fetch("/api/project-opslaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectnummer: data.projectnummer.trim(), data, pdfDataUrl }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Opslaan is mislukt");
      setSubmitStatus({ loading: false, error: null, done: true, versie: body.versie });
      setProjectStatus(s => ({ ...s, foundVersion: body.versie, nextVersion: body.versie + 1 }));
    } catch (err) {
      setSubmitStatus({ loading: false, error: err.message || "PDF genereren of opslaan is mislukt", done: false, versie: null });
    }
  };

  const KozijnPage = ({ prefix, num }) => {
    const type = data[`${prefix}Type`];
    const opties = data[`${prefix}Opties`] || [];
    const schuifpuiOpties = ["Hefschuifpui", "Binnen/buiten cilinder", "Actief links (buitenaanzicht)", "Actief rechts (buitenaanzicht)", "4-delig (met zijlichten)"];
    const openslaandOpties = ["Loopdeur links (binnenaanzicht)", "Loopdeur rechts (binnenaanzicht)", "Met zijlichten"];
    const loopdeurOpties = ["BW90 (Schuur)", "BW20 (Modern)", "Dicht"];

    return (
      <div>
        <div style={styles.section}>
          <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Type kozijn</p></div>
          <div style={styles.sectionBody}>
            <RadioGroup name={`${prefix}type`} options={["Schuifpui", "Openslaande deuren", "Loopdeur", "Harmonica wand", "Raam"]}
              value={type} onChange={v => set(`${prefix}Type`, v)} />
          </div>
        </div>

        {type === "Schuifpui" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Schuifpui opties</p></div>
            <div style={styles.sectionBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <CheckGroup options={schuifpuiOpties} values={opties} onChange={v => set(`${prefix}Opties`, v)} />
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Opmerkingen:</div>
                  <textarea style={styles.textarea} placeholder="Extra opmerkingen..." value={data[`${prefix}Opmerking`]}
                    onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {type === "Openslaande deuren" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Openslaande deuren opties</p></div>
            <div style={styles.sectionBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <CheckGroup options={openslaandOpties} values={opties} onChange={v => set(`${prefix}Opties`, v)} />
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Opmerkingen:</div>
                  <textarea style={styles.textarea} placeholder="Extra opmerkingen..." value={data[`${prefix}Opmerking`]}
                    onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {type === "Loopdeur" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Loopdeur opties</p></div>
            <div style={styles.sectionBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <CheckGroup options={loopdeurOpties} values={opties} onChange={v => set(`${prefix}Opties`, v)} />
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Opmerkingen:</div>
                  <textarea style={styles.textarea} placeholder="Extra opmerkingen..." value={data[`${prefix}Opmerking`]}
                    onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {type === "Harmonica wand" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Harmonica wand</p></div>
            <div style={styles.sectionBody}>
              <textarea style={styles.textarea} placeholder="Vul hier de specificaties in..." value={data[`${prefix}Opmerking`]}
                onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
            </div>
          </div>
        )}

        {type === "Raam" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Raam</p></div>
            <div style={styles.sectionBody}>
              <textarea style={styles.textarea} placeholder="Vul hier de specificaties in..." value={data[`${prefix}Opmerking`]}
                onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Materiaal & afwerking</p></div>
          <div style={styles.sectionBody}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Materiaal:</div>
                <RadioGroup name={`${prefix}mat`} options={["Aluminium", "Hout", "Kunststof"]}
                  value={data[`${prefix}Materiaal`]} onChange={v => set(`${prefix}Materiaal`, v)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Kleur RAL:</div>
                <input style={styles.input} placeholder="RAL kleurcode" value={data[`${prefix}RAL`]}
                  onChange={e => set(`${prefix}RAL`, e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Glas:</div>
                <RadioGroup name={`${prefix}glas`} options={["Triple", "HR+++"]}
                  value={data[`${prefix}Glas`]} onChange={v => set(`${prefix}Glas`, v)} />
              </div>
            </div>
            <div style={styles.divider} />
            <div style={styles.row}>
              <div style={styles.label}>Formaat:</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>Breedte:</span>
                <input style={styles.inputSmall} placeholder="0" value={data[`${prefix}Breedte`]}
                  onChange={e => set(`${prefix}Breedte`, e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={{ fontSize: 13 }}>Hoogte:</span>
                <input style={styles.inputSmall} placeholder="0" value={data[`${prefix}Hoogte`]}
                  onChange={e => set(`${prefix}Hoogte`, e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const pages = [
    // 0: Contact
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Contact gegevens</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Projectnummer:</div>
            <input style={{ ...styles.input, maxWidth: 160 }} placeholder="bijv. 26001" value={data.projectnummer}
              onChange={e => set("projectnummer", e.target.value)}
              onBlur={e => projectGegevensOphalen(e.target.value)} />
            {projectStatus.loading && <span style={styles.hint}>Bezig met ophalen uit SharePoint...</span>}
            {!projectStatus.loading && projectStatus.foundVersion && (
              <span style={styles.hint}>Vorige versie V{projectStatus.foundVersion} gevonden — gegevens vooraf ingevuld. Dit wordt V{projectStatus.nextVersion}.</span>
            )}
            {!projectStatus.loading && !projectStatus.foundVersion && !projectStatus.error && data.projectnummer && (
              <span style={styles.hint}>Geen eerdere versie gevonden — dit wordt V1.</span>
            )}
            {projectStatus.error && <span style={{ fontSize: 11, color: "#c0392b" }}>{projectStatus.error}</span>}
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Naam:</div>
            <input style={styles.input} value={data.naam} onChange={e => set("naam", e.target.value)} />
            <div style={styles.label}>Aanhef:</div>
            <RadioGroup name="geslacht" options={["Meneer", "Mevrouw", "Familie"]} value={data.geslacht} onChange={v => set("geslacht", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Adres:</div>
            <input style={styles.input} value={data.adres} onChange={e => set("adres", e.target.value)} />
            <div style={styles.label}>Postcode:</div>
            <input style={{ ...styles.input, maxWidth: 120 }} value={data.postcode} onChange={e => set("postcode", e.target.value)} />
            <div style={styles.label}>Plaats:</div>
            <input style={styles.input} value={data.plaats} onChange={e => set("plaats", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Telefoon:</div>
            <input type="tel" style={styles.input} value={data.telefoon} onChange={e => set("telefoon", e.target.value)} />
            <div style={styles.label}>Mail:</div>
            <input type="email" style={styles.input} value={data.mail} onChange={e => set("mail", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Datum:</div>
            <input type="date" style={styles.input} value={data.datum} onChange={e => set("datum", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Opmerkingen:</div>
            <textarea style={{ ...styles.textarea, flex: 1 }} value={data.opmerkingen} onChange={e => set("opmerkingen", e.target.value)} />
          </div>
        </div>
      </div>
    </div>,

    // 1: Maatvoering
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Maatvoering</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Hoogte:</div>
            <input inputMode="decimal" style={styles.inputSmall} value={data.hoogte} onChange={e => set("hoogte", e.target.value)} />
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
            <span style={styles.hint}>P=0 van huidige vloer tot plafond huidige woning</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Diepte:</div>
            <div style={{ flex: 1 }}>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Buiten:</span>
                <input inputMode="decimal" style={styles.inputSmall} value={data.diepteBuiten} onChange={e => set("diepteBuiten", e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={styles.hint}>Relevant bij werken met erfgrens</span>
              </div>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Binnen:</span>
                <input inputMode="decimal" style={styles.inputSmall} value={data.diepteBinnen} onChange={e => set("diepteBinnen", e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={styles.hint}>Wanneer niet afhankelijk van erfgrens</span>
              </div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Breedte:</div>
            <div style={{ flex: 1 }}>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Buiten:</span>
                <input inputMode="decimal" style={styles.inputSmall} value={data.breedteBuiten} onChange={e => set("breedteBuiten", e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={styles.hint}>Relevant bij werken met erfgrens</span>
              </div>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Binnen:</span>
                <input inputMode="decimal" style={styles.inputSmall} value={data.breedteBinnen} onChange={e => set("breedteBinnen", e.target.value)} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={styles.hint}>Wanneer niet afhankelijk van erfgrens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // 2: Maatvoering Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Schets maatvoering</p></div>
        <div style={styles.sectionBody}>
          <DrawingCanvas id="maatvoering" value={data.schetsMaatvoering} onChange={v => set("schetsMaatvoering", v)} />
        </div>
      </div>
    </div>,

    // 3: Voorbereidingen
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Voorbereidingen</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Ondergrond:</div>
            <RadioGroup name="ondergrond" options={["Klei", "Zand"]} value={data.ondergrond} onChange={v => set("ondergrond", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Bereikbaarheid:</div>
            <CheckGroup options={["Kraan", "Bereikbaar"]} values={data.heipalen} onChange={v => set("heipalen", v)} />
            <label style={styles.checkLabel}>
              <input type="checkbox" style={{ accentColor: GOLD }} checked={!!data.bereikbaarheidFotoCheck}
                onChange={e => set("bereikbaarheidFotoCheck", e.target.checked)} />
              Foto bijgevoegd
            </label>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Bouwtekeningen:</div>
            <RadioGroup name="bouwtekeningen" options={["Aanwezig", "Aangevraagd", "N.V.T."]} value={data.bouwtekeningen} onChange={v => set("bouwtekeningen", v)} />
            <span style={styles.hint}>N.V.T. alleen geldig bij kozijnverwijdering</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Vergunning:</div>
            <RadioGroup name="vergunning" options={["Benodigd", "N.V.T."]} value={data.vergunning} onChange={v => set("vergunning", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Doorbraak:</div>
            <input style={styles.inputSmall} placeholder="0" value={data.doorbraakMM} onChange={e => set("doorbraakMM", e.target.value)} />
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
            <div style={styles.label}>Constructeur:</div>
            <RadioGroup name="constructeur" options={["Benodigd", "N.V.T."]} value={data.constructeur} onChange={v => set("constructeur", v)} />
            <span style={styles.hint}>Benodigd bij vergunningen of complexe situaties</span>
          </div>
        </div>
      </div>
    </div>,

    // 4: Voorbereiding Foto's
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Voorbereiding Foto's</p></div>
        <div style={styles.sectionBody}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <PhotoUpload label="Achtergevel Binnen" value={data.fotoAchterBinnen} onChange={v => set("fotoAchterBinnen", v)} />
            <PhotoUpload label="Achtergevel Buiten" value={data.fotoAchterBuiten} onChange={v => set("fotoAchterBuiten", v)} />
            <div>
              <PhotoUpload label="Kruipruimte" hint="Vloer op funderingsbalk" value={data.fotoKruipruimte} onChange={v => set("fotoKruipruimte", v)} />
              <div style={{ marginTop: 10 }}>
                <RadioGroup name="kruipruimte" options={["Vloeroplegging foto bijgevoegd", "Geen kruipruimte aanwezig"]}
                  value={data.kruipruimteStatus} onChange={v => set("kruipruimteStatus", v)} />
              </div>
            </div>
            <PhotoUpload label="Bereikbaarheid" hint="Weg naar locatie" value={data.fotoBereikbaarheid} onChange={v => set("fotoBereikbaarheid", v)} />
          </div>
        </div>
      </div>
    </div>,

    // 5: Wandafwerking
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Wandafwerking & Gevelbekleding</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, marginBottom: 10 }}>Binnenwand afwerking</div>
          <div style={styles.row}>
            <RadioGroup name="binnenwand" options={["Casco", "Gips", "Compleet afgewerkt"]} value={data.binnenwand} onChange={v => set("binnenwand", v)} />
          </div>
          {data.binnenwand === "Casco" && <div style={styles.hint}>Geen elektra, isolatie of platen</div>}
          {data.binnenwand === "Gips" && <div style={styles.hint}>Zonder stucwerk</div>}
          {data.binnenwand === "Compleet afgewerkt" && (
            <div style={styles.subSection}>
              <RadioGroup name="stucwerk" options={["Stucen complete woning", "Stucen aanbouw"]} value={data.stucwerk} onChange={v => set("stucwerk", v)} />
            </div>
          )}
        </div>
      </div>
    </div>,

    // 6: Gevelbekleding
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Gevelbekleding</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Steenstrips</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[{ val: "Rood", hint: "Viola 0013A0", color: "#c0392b" }, { val: "Grijs", hint: "Platina 0004A0", color: "#95a5a6" }, { val: "Geel", hint: "Freya 0504A0", color: "#d4ac0d" }].map(opt => (
              <div key={opt.val} style={styles.optionCard(data.steenstrip === opt.val)} onClick={() => set("steenstrip", opt.val)}>
                <div style={{ height: 50, background: opt.color, borderRadius: 6, marginBottom: 6 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" readOnly checked={data.steenstrip === opt.val} style={{ accentColor: GOLD }} />
                  <span style={{ fontSize: 12 }}>{opt.val}</span>
                </div>
                <div style={{ fontSize: 11, color: GOLD }}>{opt.hint}</div>
              </div>
            ))}
            <div style={styles.optionCard(data.steenstrip === "Anders")}>
              <div style={{ height: 50, border: `2px dashed ${GOLD}`, borderRadius: 6, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: GOLD }}>Anders</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" readOnly checked={data.steenstrip === "Anders"} style={{ accentColor: GOLD }} onClick={() => set("steenstrip", "Anders")} />
                <span style={{ fontSize: 12 }}>Type:</span>
              </div>
              <input style={{ ...styles.input, marginTop: 4, fontSize: 11 }} placeholder="Invullen..." value={data.steenstripAnders}
                onChange={e => { set("steenstripAnders", e.target.value); set("steenstrip", "Anders"); }} />
            </div>
          </div>

          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Rhombus-smal profiel (Composiet)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[{ val: "Rustic Teak", color: "#8B6914" }, { val: "Compleet zwart", color: "#1a1a1a" }, { val: "Teak met zwart", color: "#4a3010" }].map(opt => (
              <div key={opt.val} style={styles.optionCard(data.composiet === opt.val)} onClick={() => set("composiet", opt.val)}>
                <div style={{ height: 50, background: opt.color, borderRadius: 6, marginBottom: 6 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" readOnly checked={data.composiet === opt.val} style={{ accentColor: GOLD }} />
                  <span style={{ fontSize: 12 }}>{opt.val}</span>
                </div>
              </div>
            ))}
            <div style={styles.optionCard(data.composiet === "Anders")}>
              <div style={{ height: 50, border: `2px dashed ${GOLD}`, borderRadius: 6, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: GOLD }}>Anders</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" readOnly checked={data.composiet === "Anders"} style={{ accentColor: GOLD }} onClick={() => set("composiet", "Anders")} />
                <span style={{ fontSize: 12 }}>Type:</span>
              </div>
              <input style={{ ...styles.input, marginTop: 4, fontSize: 11 }} placeholder="Invullen..." value={data.composietAnders}
                onChange={e => { set("composietAnders", e.target.value); set("composiet", "Anders"); }} />
            </div>
          </div>

          <div style={styles.divider} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Kerama <span style={{ color: GOLD, fontWeight: 400, fontSize: 11 }}>Luxe onderhoudsvrij</span></div>
              <input style={styles.input} placeholder="Type profiel:" value={data.keramaType} onChange={e => set("keramaType", e.target.value)} />
              <input style={{ ...styles.input, marginTop: 8 }} placeholder="Kleur:" value={data.keramaKleur} onChange={e => set("keramaKleur", e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Thermisch gemodificeerd hout</div>
              <input style={styles.input} placeholder="Type profiel:" value={data.houtType} onChange={e => set("houtType", e.target.value)} />
              <input style={{ ...styles.input, marginTop: 8 }} placeholder="Kleur:" value={data.houtKleur} onChange={e => set("houtKleur", e.target.value)} />
            </div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen</div>
          <textarea style={styles.textarea} value={data.gevelOpmerking} onChange={e => set("gevelOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 7: Kozijn 1
    <KozijnPage prefix="k1" num={1} />,
    // 8: Kozijn 1 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 1 — Schets</p></div>
        <div style={styles.sectionBody}><DrawingCanvas id="kozijn1" value={data.schetsKozijn1} onChange={v => set("schetsKozijn1", v)} /></div>
      </div>
    </div>,
    // 9: Kozijn 2
    <KozijnPage prefix="k2" num={2} />,
    // 10: Kozijn 2 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 2 — Schets</p></div>
        <div style={styles.sectionBody}><DrawingCanvas id="kozijn2" value={data.schetsKozijn2} onChange={v => set("schetsKozijn2", v)} /></div>
      </div>
    </div>,
    // 11: Kozijn 3
    <KozijnPage prefix="k3" num={3} />,
    // 12: Kozijn 3 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 3 — Schets</p></div>
        <div style={styles.sectionBody}><DrawingCanvas id="kozijn3" value={data.schetsKozijn3} onChange={v => set("schetsKozijn3", v)} /></div>
      </div>
    </div>,

    // 13: Dak & Lichtstraat
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Dakbedekking & Lichtstraat</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Dakbedekking:</div>
            <RadioGroup name="dak" options={["EPDM"]} value={data.dakbedekking} onChange={v => set("dakbedekking", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Dakrand afwerking:</div>
            <RadioGroup name="dakrand" options={["Modern zw zetwerk", "Kraal zink"]} value={data.dakrandAfwerking} onChange={v => set("dakrandAfwerking", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Overstek:</div>
            <RadioGroup name="overstek" options={["N.V.T.", "Ja"]} value={data.overstek} onChange={v => set("overstek", v)} />
            {data.overstek === "Ja" && <input style={styles.inputSmall} placeholder="MM" value={data.overstekMM} onChange={e => set("overstekMM", e.target.value)} />}
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Dakvorm:</div>
            <RadioGroup name="dakvorm" options={["Lessenaar", "Zadeldak"]} value={data.dakVorm} onChange={v => set("dakVorm", v)} />
            <div style={styles.label}>Kleur RAL:</div>
            <input style={styles.inputSmall} value={data.dakrandKleur} onChange={e => set("dakrandKleur", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Lichtstraat:</div>
            <RadioGroup name="lichtstraat" options={["N.V.T.", "Ja"]} value={data.lichtstraat} onChange={v => set("lichtstraat", v)} />
          </div>
          {data.lichtstraat === "Ja" && (
            <div style={styles.subSection}>
              <div style={styles.row}>
                <div style={styles.label}>Formaat:</div>
                <input style={styles.inputSmall} placeholder="Breedte MM" value={data.lichtsturaatFormaat} onChange={e => set("lichtsturaatFormaat", e.target.value)} />
                <div style={styles.label}>Kleur RAL:</div>
                <input style={styles.inputSmall} value={data.lichtsturaatKleur} onChange={e => set("lichtsturaatKleur", e.target.value)} />
              </div>
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / extra's:</div>
          <textarea style={styles.textarea} value={data.dakOpmerking} onChange={e => set("dakOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 14: E-installaties
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>E-installaties</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 11, color: GOLD, marginBottom: 12, fontStyle: "italic" }}>Positie op tekening aangeven gekoppeld met letters. Schakelaar A → spotjes A</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Stopcontacten</div>
          <CheckGroup options={["Enkel", "Dubbel", "Tripel", "Anders"]} values={data.stopcontacten} onChange={v => set("stopcontacten", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
            <div><div style={{ fontSize: 11, color: "#888" }}>Merk:</div><input style={styles.input} value={data.stopMerk} onChange={e => set("stopMerk", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Type:</div><input style={styles.input} value={data.stopType} onChange={e => set("stopType", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Kleur:</div><input style={styles.input} value={data.stopKleur} onChange={e => set("stopKleur", e.target.value)} /></div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Binnen verlichting</div>
          <CheckGroup options={["CD", "Spotjes", "Hanglamp"]} values={data.verlichting} onChange={v => set("verlichting", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
            <div><div style={{ fontSize: 11, color: "#888" }}>Merk:</div><input style={styles.input} value={data.verlichtingMerk} onChange={e => set("verlichtingMerk", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Type:</div><input style={styles.input} value={data.verlichtingType} onChange={e => set("verlichtingType", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Kleur:</div><input style={styles.input} value={data.verlichtingKleur} onChange={e => set("verlichtingKleur", e.target.value)} /></div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Schakelaars</div>
          <CheckGroup options={["Schakelaar", "Dimmer", "Sensor"]} values={data.schakelaars} onChange={v => set("schakelaars", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
            <div><div style={{ fontSize: 11, color: "#888" }}>Merk:</div><input style={styles.input} value={data.schakelaarMerk} onChange={e => set("schakelaarMerk", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Type:</div><input style={styles.input} value={data.schakelaarType} onChange={e => set("schakelaarType", e.target.value)} /></div>
            <div><div style={{ fontSize: 11, color: "#888" }}>Kleur:</div><input style={styles.input} value={data.schakelaarKleur} onChange={e => set("schakelaarKleur", e.target.value)} /></div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Buiten E-installaties</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.buitenVerlichting} onChange={e => set("buitenVerlichting", e.target.checked)} /> Verlichting / Spotjes / U/D wand</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <input style={styles.input} placeholder="Merk" value={data.buitenVerlichtingMerk} onChange={e => set("buitenVerlichtingMerk", e.target.value)} />
                <input style={styles.input} placeholder="Type" value={data.buitenVerlichtingType} onChange={e => set("buitenVerlichtingType", e.target.value)} />
                <input style={styles.input} placeholder="Kleur" value={data.buitenVerlichtingKleur} onChange={e => set("buitenVerlichtingKleur", e.target.value)} />
              </div>
            </div>
            <div>
              <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.wcd} onChange={e => set("wcd", e.target.checked)} /> WCD's</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <input style={styles.input} placeholder="Merk" defaultValue="Niko" value={data.wcdMerk} onChange={e => set("wcdMerk", e.target.value)} />
                <input style={styles.input} placeholder="Type" defaultValue="Hor" value={data.wcdType} onChange={e => set("wcdType", e.target.value)} />
                <input style={styles.input} placeholder="Kleur" defaultValue="Zwart" value={data.wcdKleur} onChange={e => set("wcdKleur", e.target.value)} />
              </div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Warmte / Koude</div>
          <CheckGroup options={["Airco", "WTW-unit", "Vloerverwarming"]} values={data.warmteKoude} onChange={v => set("warmteKoude", v)} />
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / Extra's:</div>
          <textarea style={styles.textarea} value={data.eOpmerking} onChange={e => set("eOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 15: E-installatie Tekening
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>E-installatie tekening</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.hint}>Hoogte en positie WCD's en afstand wand-verlichting aangeven</div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: BLACK }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Legenda:</div>
              {[["⊗", "Centraal doos"], ["○", "Spot"], ["◌", "Schakelaar"], ["◉", "Dimmer"], ["⊣", "Stopcontact"]].map(([sym, lbl]) => (
                <div key={lbl} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ fontSize: 16, fontFamily: "monospace" }}>{sym}</span> {lbl}
                </div>
              ))}
            </div>
            <DrawingCanvas id="einstallatie" value={data.schetsEinstallatie} onChange={v => set("schetsEinstallatie", v)} />
          </div>
        </div>
      </div>
    </div>,

    // 16: W-installaties
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>W-installaties</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>HWA (Hemelwaterafvoer)</div>
          <RadioGroup name="hwa" options={["PVC", "Zink", "Zwart"]} value={data.hwaMateriaal} onChange={v => set("hwaMateriaal", v)} />
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.bladvanger} onChange={e => set("bladvanger", e.target.checked)} /> Bladvanger</label>
            <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.vergaarbak} onChange={e => set("vergaarbak", e.target.checked)} /> Vergaarbak</label>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Warmte / Koude</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <RadioGroup name="warmtew" options={["Vloerverwarming", "Stadsverwarming"]} value={data.warmte} onChange={v => set("warmte", v)} />
              {data.warmte === "Vloerverwarming" && (
                <div style={{ marginTop: 10 }}>
                  <RadioGroup name="warmtescope" options={["Aanbouw", "Gehele woning"]} value={data.warmteScope} onChange={v => set("warmteScope", v)} />
                  {data.warmteScope === "Gehele woning" && <input style={{ ...styles.inputSmall, marginTop: 8 }} placeholder="m²" value={data.warmteM2} onChange={e => set("warmteM2", e.target.value)} />}
                </div>
              )}
            </div>
            <div>
              <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.ketel} onChange={e => set("ketel", e.target.checked)} /> Ketel</label>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>W/K Water:</div>
                <input style={styles.input} value={data.wkWater} onChange={e => set("wkWater", e.target.value)} />
              </div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Vorst vrije buitenkraan</div>
          <div style={styles.row}>
            <RadioGroup name="buitenkraan" options={["1", "2"]} value={data.buitenkraan} onChange={v => set("buitenkraan", v)} />
            <div style={styles.label}>Kleur:</div>
            <input style={{ ...styles.inputSmall }} value={data.buitenkraanKleur} onChange={e => set("buitenkraanKleur", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / Extra's:</div>
          <textarea style={styles.textarea} value={data.wOpmerking} onChange={e => set("wOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 17: W-installatie Tekening
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>W-installatie tekening</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.hint}>Afmetingen voor positie aangeven vanuit binnenmaat aanbouw</div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: BLACK }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Legenda:</div>
              {[["○", "HWA"], ["BK", "Buitenkraan"]].map(([sym, lbl]) => (
                <div key={lbl} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700 }}>{sym}</span> {lbl}
                </div>
              ))}
            </div>
            <DrawingCanvas id="winstallatie" value={data.schetsWinstallatie} onChange={v => set("schetsWinstallatie", v)} />
          </div>
        </div>
      </div>
    </div>,

    // 18: Samenvatting
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Samenvatting — {data.naam || "Klant"}</p>
        </div>
        <div style={styles.sectionBody}>
          {[
            ["Contact", [["Projectnummer", data.projectnummer], ["Naam", data.naam], ["Aanhef", data.geslacht], ["Datum", data.datum], ["Telefoon", data.telefoon], ["Mail", data.mail], ["Adres", `${data.adres}, ${data.postcode} ${data.plaats}`]]],
            ["Maatvoering", [["Hoogte", `${data.hoogte} MM`], ["Diepte buiten", `${data.diepteBuiten} MM`], ["Diepte binnen", `${data.diepteBinnen} MM`], ["Breedte buiten", `${data.breedteBuiten} MM`], ["Breedte binnen", `${data.breedteBinnen} MM`]]],
            ["Voorbereidingen", [["Ondergrond", data.ondergrond], ["Bouwtekeningen", data.bouwtekeningen], ["Vergunning", data.vergunning], ["Doorbraak", `${data.doorbraakMM} MM`], ["Constructeur", data.constructeur]]],
            ["Wandafwerking", [["Binnenwand", data.binnenwand], ["Stucwerk", data.stucwerk]]],
            ["Gevelbekleding", [["Steenstrips", data.steenstrip === "Anders" ? data.steenstripAnders : data.steenstrip], ["Composiet", data.composiet === "Anders" ? data.composietAnders : data.composiet], ["Kerama type", data.keramaType], ["Kerama kleur", data.keramaKleur], ["Hout type", data.houtType], ["Hout kleur", data.houtKleur]]],
            ["Kozijn 1", [["Type", data.k1Type], ["Opties", data.k1Opties.join(", ")], ["Materiaal", data.k1Materiaal], ["RAL", data.k1RAL], ["Glas", data.k1Glas], ["Breedte", `${data.k1Breedte} MM`], ["Hoogte", `${data.k1Hoogte} MM`]]],
            ["Kozijn 2", [["Type", data.k2Type], ["Materiaal", data.k2Materiaal], ["RAL", data.k2RAL], ["Glas", data.k2Glas], ["Breedte", `${data.k2Breedte} MM`], ["Hoogte", `${data.k2Hoogte} MM`]]],
            ["Kozijn 3", [["Type", data.k3Type], ["Materiaal", data.k3Materiaal], ["RAL", data.k3RAL], ["Glas", data.k3Glas], ["Breedte", `${data.k3Breedte} MM`], ["Hoogte", `${data.k3Hoogte} MM`]]],
            ["Dak", [["Dakbedekking", data.dakbedekking], ["Dakrand", data.dakrandAfwerking], ["Overstek", data.overstek === "Ja" ? `Ja, ${data.overstekMM} MM` : "N.V.T."], ["Lichtstraat", data.lichtstraat]]],
            ["E-installaties", [["Stopcontacten", data.stopcontacten.join(", ")], ["Verlichting", data.verlichting.join(", ")], ["Schakelaars", data.schakelaars.join(", ")], ["Warmte/Koude", data.warmteKoude.join(", ")]]],
            ["W-installaties", [["HWA materiaal", data.hwaMateriaal], ["Warmte", data.warmte], ["Buitenkraan", data.buitenkraan]]],
          ].map(([title, rows]) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6, borderBottom: `1px solid ${GOLD}33`, paddingBottom: 4 }}>{title}</div>
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#888", minWidth: 140 }}>{k}:</span>
                  <span style={{ color: BLACK, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={styles.divider} />
          <button style={{ ...styles.btnPrev, width: "100%", fontSize: 15, padding: "12px", marginBottom: 10, opacity: pdfStatus.loading ? 0.6 : 1, cursor: pdfStatus.loading ? "default" : "pointer" }}
            disabled={pdfStatus.loading}
            onClick={bekijkPdf}>
            {pdfStatus.loading ? "PDF wordt gemaakt..." : "📄 PDF bekijken"}
          </button>
          {pdfStatus.error && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>{pdfStatus.error}</div>}
          <button style={{ ...styles.btnNext, width: "100%", fontSize: 16, padding: "14px", opacity: submitStatus.loading ? 0.6 : 1, cursor: submitStatus.loading ? "default" : "pointer" }}
            disabled={submitStatus.loading}
            onClick={versturenEnOpslaan}>
            {submitStatus.loading ? "Bezig met opslaan..." : `✉️ Versturen & Opslaan (wordt V${projectStatus.nextVersion})`}
          </button>
          {submitStatus.error && <div style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{submitStatus.error}</div>}
          {submitStatus.done && <div style={{ color: "#2e7d32", fontSize: 13, marginTop: 8 }}>Opgeslagen in SharePoint als versie V{submitStatus.versie}.</div>}
        </div>
      </div>
    </div>,
  ];

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logoText}>Add<span style={styles.logoAccent}>On</span></div>
        <div style={styles.pageTitle}>{PAGES[page]}</div>
        <div style={styles.progress}>
          {PAGES.map((_, i) => <div key={i} style={styles.progressDot(i === page, i < page)} />)}
        </div>
      </div>
      <div style={styles.body}>
        {foutmeldingen.length > 0 && (
          <div style={styles.foutBanner}>
            <div style={styles.foutBannerTitel}>Vul eerst het volgende in voor je verder kunt:</div>
            <div>{foutmeldingen.join(", ")}</div>
          </div>
        )}
        {pages[page]}
      </div>
      <div style={styles.nav}>
        <button style={styles.btnPrev} onClick={() => { setFoutmeldingen([]); setPage(p => Math.max(0, p - 1)); }} disabled={page === 0}>
          ← Vorige
        </button>
        <span style={{ fontSize: 12, color: "#888", alignSelf: "center" }}>{page + 1} / {PAGES.length}</span>
        {page < PAGES.length - 1 ? (
          <button
            style={styles.btnNext}
            onClick={() => {
              const validator = PAGE_VALIDATORS[page];
              const missend = validator ? validator(data) : [];
              if (missend.length > 0) {
                setFoutmeldingen(missend);
                return;
              }
              setFoutmeldingen([]);
              setPage(p => Math.min(PAGES.length - 1, p + 1));
            }}
          >
            Volgende →
          </button>
        ) : null}
      </div>
    </div>
  );
}
