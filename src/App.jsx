// AddOn Aanbouw op Maat - Inmeet Formulier App
// Full React SPA - works as iPad PWA

import { useState, useRef, useEffect } from "react";
import logoUrl from "./assets/logo.png";
import fotoCompositRusticTeak from "./assets/gevel/composiet-rustic-teak.jpg";
import fotoCompositComleetZwart from "./assets/gevel/composiet-compleet-zwart.jpg";
import fotoCompositTeakZwart from "./assets/gevel/composiet-teak-zwart.jpg";
import fotoKerama from "./assets/gevel/kerama.jpg";
import fotoHoutThermisch from "./assets/gevel/hout-thermisch.jpg";
import fotoLichtstraatLessenaar from "./assets/lichtstraat/lessenaar.jpg";
import fotoLichtstraatZadeldak from "./assets/lichtstraat/zadeldak.jpg";
import { legendaRijen, symboolOpKey } from "./symbolen";
import InstallatieCanvas, { SymboolIcoon } from "./InstallatieCanvas";
import { conceptLaden, conceptBewaren, conceptWissen } from "./concept";
import { schoneData, STEENSTRIP_FORMATEN, STEENSTRIP_LINK, kozijnOpties, kozijnVastGlas, KOZIJN_OPTIES, E_UITVOERING_COMPLEET, E_UITVOERING_LEIDINGWERK } from "./schoon";
import fotoGira55 from "./assets/elektra/gira55.jpg";
import fotoBuschJaeger from "./assets/elektra/busch-jaeger.jpg";
import fotoReachChampagne from "./assets/wandlamp/reach-champagne.jpg";
import fotoReachZwartBruin from "./assets/wandlamp/reach-zwart-bruin.jpg";
import fotoReachWit from "./assets/wandlamp/reach-wit.jpg";
import fotoReachZwart from "./assets/wandlamp/reach-zwart.jpg";
import fotoLeviMatZwart from "./assets/wandlamp/levi-mat-zwart.jpg";
import fotoLeviAntraciet from "./assets/wandlamp/levi-antraciet.jpg";
import fotoNoaVerzinkt from "./assets/wandlamp/noa-verzinkt.jpg";
import fotoNoaZwart from "./assets/wandlamp/noa-zwart.jpg";
import fotoNoaAntraciet from "./assets/wandlamp/noa-antraciet.jpg";
// @react-pdf/renderer is een zware library (~500KB gzipped). Die wordt pas
// ingeladen op het moment dat de opmeter daadwerkelijk op "PDF bekijken"
// klikt (zie bekijkPdf hieronder), zodat de eerste keer laden van de app
// op de iPad niet onnodig trager wordt.

const GOLD = "#B69148";
const BLACK = "#1a1a1a";
const LIGHT = "#f5f5f5";

const styles = {
  app: { fontFamily: "'Segoe UI', sans-serif", background: LIGHT, minHeight: "100dvh", width: "100vw", boxSizing: "border-box", overflowX: "hidden", padding: 0, margin: 0, display: "flex", flexDirection: "column" },
  header: { borderTop: `5px solid ${GOLD}`, background: "white", padding: "12px 20px", borderBottom: `2px solid ${GOLD}`, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  logoImg: { height: 32, width: "auto", display: "block" },
  pageTitle: { fontSize: 18, fontWeight: 600, color: BLACK, marginLeft: 4 },
  progress: { display: "flex", gap: 4, marginLeft: "auto", alignItems: "center" },
  progressDot: (active, done) => ({ width: active ? 10 : 6, height: active ? 10 : 6, borderRadius: "50%", background: done ? GOLD : active ? BLACK : "#ccc", transition: "all 0.2s" }),
  body: { padding: "20px 24px 24px", width: "100%", boxSizing: "border-box", flex: 1 },
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
  // Tikvlakken minstens ~40 px hoog, zodat ze op de iPad goed te raken zijn.
  radioGroup: { display: "flex", columnGap: 20, rowGap: 2, flexWrap: "wrap", alignItems: "center" },
  radioLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: BLACK, cursor: "pointer", minHeight: 40 },
  checkGroup: { display: "flex", flexDirection: "column", gap: 2 },
  checkLabel: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: BLACK, cursor: "pointer", minHeight: 40 },
  divider: { height: 1, background: `${GOLD}33`, margin: "12px 0" },
  // Navigatiebalk staat onderaan de pagina (na de inhoud), niet vast over de inhoud heen.
  // paddingBottom houdt rekening met de "home"-streep onderaan de iPad.
  nav: { background: "white", borderTop: `2px solid ${GOLD}`, padding: "12px 20px", paddingBottom: "max(12px, env(safe-area-inset-bottom))", display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnPrev: { background: "white", border: `2px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnNext: { background: GOLD, border: "none", color: "white", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  photoBox: { border: `2px dashed ${GOLD}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer", background: "#fdfcf8", minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 },
  photoThumb: { width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6, marginTop: 8 },
  canvas: { border: `2px solid ${GOLD}`, borderRadius: 8, cursor: "crosshair", touchAction: "none", display: "block", width: "100%", background: "white" },
  canvasToolbar: { display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  toolBtn: (active) => ({ background: active ? GOLD : "white", color: active ? "white" : GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 6, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600, minHeight: 40 }),
  badge: { background: `${GOLD}22`, color: GOLD, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 },
  optionCard: (selected) => ({ border: `2px solid ${selected ? GOLD : "#e0e0e0"}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", background: selected ? `${GOLD}11` : "white", transition: "all 0.15s" }),
  subSection: { background: "#fdfcf8", border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "12px 14px", marginTop: 10 },
  foutBanner: { background: "#fdecea", border: "1.5px solid #c0392b", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "#c0392b", fontSize: 13 },
  foutBannerTitel: { fontWeight: 700, marginBottom: 4 },
};

// Canvas Drawing Component
// Gestuurd (controlled) via value/onChange zodat schetsen net als foto's opgeslagen,
// vooraf ingevuld (prefill bij 2e opname) en gewijzigd kunnen worden.
// Aantal vakjes van de hulp-grid (alleen gebruikt als grid=true) - elk vakje
// stelt 1x1 meter voor, dus 15 vakjes = een grid van 15x15 meter.
const GRID_VAKJES = 15;
// Hoeveel stappen "Ongedaan maken" onthoudt (ouder dan dit wordt vergeten).
const MAX_UNDO_STAPPEN = 15;

function DrawingCanvas({ id, value, onChange, grid = false, square = false, height = 300, gridCols = GRID_VAKJES, gridRows = GRID_VAKJES, aspectRatio = null, maxVh = 70 }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1a1a");
  const [canUndo, setCanUndo] = useState(false);
  const lastPos = useRef(null);
  const loadedValueRef = useRef(null);
  // Snapshots (dataURLs) van het canvas vóór elke actie, voor "Ongedaan maken".
  const historyRef = useRef([]);

  const tekenGrid = (ctx, w, h) => {
    ctx.save();
    ctx.strokeStyle = "#e5ddc8";
    ctx.lineWidth = 1;
    for (let i = 1; i < gridCols; i++) {
      const x = (w / gridCols) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 1; i < gridRows; i++) {
      const y = (h / gridRows) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  };

  const legeAchtergrond = (canvas, ctx) => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    if (grid) tekenGrid(ctx, w, h);
  };

  const drawImageOnCanvas = (canvas, ctx, src) => {
    const img = new Image();
    img.onload = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      loadedValueRef.current = src;
    };
    img.src = src;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    if (value) drawImageOnCanvas(canvas, ctx, value);
    else legeAchtergrond(canvas, ctx);
    // Schermgrootte verandert (bijv. iPad gedraaid): canvas meeschalen en de
    // bestaande tekening opnieuw (geschaald) neerzetten, zodat nieuwe lijnen
    // weer precies onder de vinger komen.
    let vorigeBreedte = canvas.offsetWidth;
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (!w || w === vorigeBreedte) return;
      vorigeBreedte = w;
      const huidig = canvas.toDataURL("image/png");
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      const c = canvas.getContext("2d");
      c.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      drawImageOnCanvas(canvas, c, huidig);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
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

  const bewaarVoorUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL("image/png"));
    if (historyRef.current.length > MAX_UNDO_STAPPEN) historyRef.current.shift();
    setCanUndo(true);
  };

  const ongedaanMaken = () => {
    const canvas = canvasRef.current;
    const vorige = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    if (!canvas || !vorige) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      loadedValueRef.current = vorige;
      if (onChange) onChange(vorige);
    };
    img.src = vorige;
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.offsetWidth / rect.width;
    const scaleY = canvas.offsetHeight / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    bewaarVoorUndo();
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
    bewaarVoorUndo();
    legeAchtergrond(canvas, ctx);
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
            style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", border: color === c && tool === "pen" ? "3px solid #333" : "2px solid #eee" }} />
        ))}
        <button style={{ ...styles.toolBtn(false), opacity: canUndo ? 1 : 0.4, cursor: canUndo ? "pointer" : "default" }}
          onClick={ongedaanMaken} disabled={!canUndo}>↩️ Ongedaan maken</button>
        <button style={styles.toolBtn(false)} onClick={clearCanvas}>🗑️ Wissen</button>
      </div>
      <canvas ref={canvasRef}
        style={
          square ? { ...styles.canvas, width: `min(100%, ${maxVh}vh)`, aspectRatio: "1 / 1", margin: "0 auto" }
          : aspectRatio ? { ...styles.canvas, width: "100%", aspectRatio, margin: "0 auto" }
          : { ...styles.canvas, height }
        }
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      {grid && <div style={{ ...styles.hint, marginTop: 6, textAlign: "center" }}>Elk vakje = 1 x 1 meter (grid van {gridCols} x {gridRows} m)</div>}
    </div>
  );
}

// Verkleint een gekozen foto tot max. 1600 px (langste zijde), als JPEG 80%.
// Een iPad-foto van 3-5 MB wordt zo ca. 200-400 KB: ruim genoeg voor de PDF,
// en het versturen vanaf de locatie (4G) blijft snel. Lukt verkleinen niet,
// dan wordt de originele foto gebruikt.
const FOTO_MAX_PX = 1600;
function fotoInlezen(file) {
  const origineel = () => new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (ev) => resolve(ev.target.result);
    r.readAsDataURL(file);
  });
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const schaal = Math.min(1, FOTO_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * schaal);
      c.height = Math.round(img.naturalHeight * schaal);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      try { resolve(c.toDataURL("image/jpeg", 0.8)); } catch { origineel().then(resolve); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); origineel().then(resolve); };
    img.src = url;
  });
}

// Naam van de inmeter onthouden op dit apparaat, zodat die bij een volgend
// formulier al ingevuld staat.
const INMETER_SLEUTEL = "addon-inmeter";
function laatsteInmeter() { try { return localStorage.getItem(INMETER_SLEUTEL) || ""; } catch { return ""; } }
function bewaarInmeter(naam) { try { localStorage.setItem(INMETER_SLEUTEL, naam); } catch { /* niet fataal */ } }

// Maten (mm) en aantallen: alleen hele getallen.
const alleenCijfers = (v) => String(v).replace(/[^0-9]/g, "");

// Photo Upload Component
function PhotoUpload({ label, hint, value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: BLACK, marginBottom: 6 }}>{label}</div>}
      {hint && <div style={styles.hint}>{hint}</div>}
      <div style={{ ...styles.photoBox, position: "relative" }} onClick={() => inputRef.current.click()}>
        {value ? (
          <>
            <img src={value} alt="upload" style={styles.photoThumb} />
            <button type="button" title="Foto verwijderen" aria-label="Foto verwijderen"
              onClick={e => { e.stopPropagation(); if (window.confirm("Deze foto verwijderen?")) onChange(null); }}
              style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "white", fontSize: 16, cursor: "pointer" }}>✕</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 28 }}>📷</div>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Foto toevoegen</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>Foto maken of kiezen uit fotobibliotheek</div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) fotoInlezen(f).then(onChange); e.target.value = ""; }} />
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

// Checkbox-groep met een aantal-veld (numeriek) per aangevinkte optie.
// extra(opt) mag optioneel extra JSX teruggeven die verschijnt zodra die
// specifieke optie is aangevinkt (bijv. een kleurkeuze bij "Spotjes").
function CheckGroupAantal({ options, values, onChange, aantallen, onAantalChange, extra }) {
  return (
    <div>
      {options.map(opt => {
        const checked = values.includes(opt);
        return (
          <div key={opt} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={checked} style={{ accentColor: GOLD, width: 16, height: 16 }}
                  onChange={e => { if (e.target.checked) onChange([...values, opt]); else onChange(values.filter(v => v !== opt)); }} />
                {opt}
              </label>
              {checked && (
                <>
                  <span style={{ fontSize: 12, color: "#888" }}>Aantal:</span>
                  <input style={{ ...styles.inputSmall, width: 70 }} inputMode="numeric" placeholder="0"
                    value={aantallen[opt] || ""} onChange={e => onAantalChange(opt, alleenCijfers(e.target.value))} />
                </>
              )}
            </div>
            {checked && extra && extra(opt)}
          </div>
        );
      })}
    </div>
  );
}

const PAGES = [
  "Contact", "Maatvoering", "Maatvoering Schets", "Voorbereidingen", "Voorbereiding Foto's",
  "Wandafwerking & Gevelbekleding", "Kozijn 1", "Kozijn 1 Schets", "Kozijn 2", "Kozijn 2 Schets",
  "Kozijn 3", "Kozijn 3 Schets", "Dak & Lichtstraat", "E-installaties", "W-installaties",
  "Installatietekening", "Extra foto's", "Samenvatting"
];

// Merk/Type schakelmateriaal als één leesbare regel, bijv. "Gira 55 (standaard) - Wit".
function schakelmateriaalTekst(data) {
  if (data.eUitvoering === E_UITVOERING_LEIDINGWERK) return "N.V.T. (afmonteren door klant)";
  const label = data.schakelMerk === "Anders"
    ? (data.schakelMerkAnders ? `Anders: ${data.schakelMerkAnders}` : "Anders")
    : { "Gira 55": "Gira 55 (standaard)", "Busch-Jaeger": "Busch-Jaeger (modern)" }[data.schakelMerk];
  if (!label) return "";
  return data.schakelKleur ? `${label} - ${data.schakelKleur}` : label;
}

// --- Verplichte-veldvalidatie -------------------------------------------
// Per pagina (zelfde volgorde/index als PAGES) een functie die controleert
// of alle verplichte velden op die pagina zijn ingevuld. Geeft een lijst
// met leesbare namen van wat er nog mist terug (leeg = alles goed). Een
// pagina zonder validator (null) heeft geen verplichte velden.
// Zet een lijst gekozen opties + bijbehorende aantallen om in leesbare tekst,
// bijv. ["Enkel", "Dubbel"] + {Enkel: "3", Dubbel: "1"} => "Enkel (3x), Dubbel (1x)".
function metAantal(items, aantallen) {
  return (items || []).map(i => (aantallen[i] ? `${i} (${aantallen[i]}x)` : i)).join(", ");
}

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
    // Vast glas (als optie bij Schuifpui/Openslaande deuren, of als het raamtype
    // zelf) vereist een keuze voor het ventilatierooster.
    if (type === "Raam" && !heeftWaarde(data[`${prefix}RaamType`])) missend.push(`${naam}: raamtype`);
    if (type === "Harmonica wand") {
      if (!heeftWaarde(data[`${prefix}HarmonicaDelen`])) missend.push(`${naam}: aantal delen`);
      if (!heeftWaarde(data[`${prefix}HarmonicaRichting`])) missend.push(`${naam}: richting`);
    }
    const vastGlasGekozen = kozijnVastGlas(data, prefix);
    if (vastGlasGekozen && !heeftWaarde(data[`${prefix}Ventilatierooster`])) missend.push(`${naam}: ventilatierooster (ja/nee)`);
    return missend;
  };
}

// Tijdelijk uitgezet tijdens het pagina-voor-pagina optimaliseren, zodat je
// niet elke keer alle verplichte velden opnieuw hoeft in te vullen om verder
// te kunnen bladeren. De validatieregels hieronder blijven gewoon staan -
// zet dit terug op true voor de grote eindtest / productie.
const VALIDATIE_ACTIEF = false;

// Standaard buiten-wandlampen (bron: Wandlampjes_besteloverzicht.xlsx). Foto's staan in assets/wandlamp.
const WANDLAMPEN = [
  { serie: "Reach Up & Down", opties: [
    { kleur: "Champagne", code: "G97857", foto: fotoReachChampagne },
    { kleur: "Zwart/Bruin", code: "G97859", foto: fotoReachZwartBruin },
    { kleur: "Wit", code: "G97858", foto: fotoReachWit },
    { kleur: "Zwart", code: "G97856", foto: fotoReachZwart },
  ] },
  { serie: "Levi Up & Down", opties: [
    { kleur: "Mat zwart", code: "7745", foto: fotoLeviMatZwart },
    { kleur: "Antraciet RAL 7022", code: "7746", foto: fotoLeviAntraciet },
  ] },
  { serie: "Noa Down", opties: [
    { kleur: "Verzinkt", code: "7760", foto: fotoNoaVerzinkt },
    { kleur: "Zwart", code: "7757", foto: fotoNoaZwart },
    { kleur: "Antraciet", code: "7758", foto: fotoNoaAntraciet, opmerking: "Alleen leverbaar in RAL 7021 (niet in RAL 7016)" },
  ] },
].map(s => ({ ...s, opties: s.opties.map(o => ({ ...o, label: `${s.serie} - ${o.kleur} (${o.code})` })) }));
const wandlampFoto = (label) => WANDLAMPEN.flatMap(s => s.opties).find(o => o.label === label)?.foto;
const VERDELER_LET_OP = "LET OP: het ophangen en aansluiten van de verdeler gebeurt altijd op stelpost, vanwege de verschillende situaties. Op de locatie van de verdeler dient een stopcontact aanwezig te zijn. Is dit er niet, dan dient dit met AddOn afgestemd te worden. AddOn kan op de plek van de verdeler voor € 300,- incl. btw een stopcontact realiseren.";
// Foto's en tekeningen in de samenvatting: [veld, omschrijving, pagina-index].
const SAMENVATTING_BEELDEN = [
  ["fotoAchterBuiten", "Achtergevel buiten", 4], ["fotoAchterBinnen", "Achtergevel binnen", 4],
  ["fotoKruipruimte", "Kruipruimte", 4], ["fotoBereikbaarheid", "Bereikbaarheid", 4],
  ["steenstripFoto", "Bestaande gevel (steenstrips)", 5], ["composietAndersFoto", "Composiet (anders)", 5],
  ["schetsMaatvoering", "Schets maatvoering", 2], ["schetsKozijn1", "Schets kozijn 1", 7],
  ["schetsKozijn2", "Schets kozijn 2", 9], ["schetsKozijn3", "Schets kozijn 3", 11],
  ["schetsLichtstraatPositie", "Positie lichtstraat", 12], ["fotoVerdeler", "Bestaande verdeler", 14],
  ["schetsEinstallatie", "Installatietekening", 15],
  ["extraFoto1", "Extra foto 1", 16], ["extraFoto2", "Extra foto 2", 16],
  ["extraFoto3", "Extra foto 3", 16], ["extraFoto4", "Extra foto 4", 16],
];
const HOTEL_VERLICHTING = ["Binnen: Spotjes", "Binnen: Hanglamp", "Binnen: Wandlampjes", "Buiten: Spotjes", "Buiten: Wandlamp"];
const WCD_TYPE = "Dubbel NIKO inbouw horizontaal zwart";
const E_GARANTIE_TEKST = "zodra er iets aan de elektra wordt gewijzigd ten opzichte van de staat waarin de aanbouw onze werkplaats verlaat, vervalt de garantie van AddOn op de elektra.";

// E-installaties: veel losse, optionele keuzes; checken dat de pagina niet
// helemaal leeg is en dat alles wat aangevinkt is compleet is.
const valideerE = (data) => {
  const missend = [];
  if (!heeftWaarde(data.eUitvoering)) missend.push("Uitvoering elektra");
  if (data.eUitvoering === E_UITVOERING_COMPLEET) {
    if (!heeftWaarde(data.schakelMerk)) missend.push("Merk/Type");
    else if (data.schakelMerk === "Anders" && !heeftWaarde(data.schakelMerkAnders)) missend.push("Merk/Type (Anders)");
    if (!heeftWaarde(data.schakelKleur)) missend.push("Kleur Merk/Type");
  }
  if (data.hotelschakeling) {
    if (!heeftWaarde(data.hotelLampen)) missend.push("Hotelschakeling: welke verlichting");
  }
  if ((data.warmteKoude || []).includes("Airco")) {
    if (!heeftWaarde(data.aircoUitvoering)) missend.push("Airco: alleen leidingwerk of airco");
    else if (data.aircoUitvoering === "Airco" && !heeftWaarde(data.aircoVermogen)) missend.push("Airco: vermogen");
  }
  const buiten = data.buitenVerlichting || [];
  if (buiten.includes("Spotjes")) {
    if (!heeftWaarde(data.buitenSpotjesKleur)) missend.push("Kleur buiten spotjes");
    else if (data.buitenSpotjesKleur === "Kleur van overstek" && !heeftWaarde(data.buitenSpotjesRAL)) missend.push("RAL-code buiten spotjes");
  }
  if (buiten.includes("Wandlamp") && !heeftWaarde(data.buitenWandlampType)) missend.push("Type wandlamp");
  if (data.wcd && !heeftWaarde(data.wcdAantal)) missend.push("Aantal buitenstopcontacten");
  const iets = heeftWaarde(data.stopcontacten) || heeftWaarde(data.verlichting) || heeftWaarde(data.schakelaars) ||
    heeftWaarde(data.warmteKoude) || heeftWaarde(data.buitenVerlichting) || data.wcd;
  if (!iets) missend.push("Minimaal één keuze bij stopcontacten, verlichting, schakelaars of warmte/koude");
  return missend;
};

// W-installaties: HWA, buitenkraan en vloerverwarming altijd beantwoorden;
// bij vloerverwarming ook m², verdeler en (foto of warmtebron).
const valideerW = (data) => {
  const missend = [];
  if (!heeftWaarde(data.hwaMateriaal)) missend.push("HWA materiaal");
  else if (!heeftWaarde(data.hwaAantal)) missend.push("HWA aantal");
  if (!heeftWaarde(data.buitenkraan)) missend.push("Vorstvrije buitenkraan");
  if (!heeftWaarde(data.vloerverwarming)) missend.push("Vloerverwarming");
  else if (data.vloerverwarming !== "N.V.T.") {
    if (data.vloerverwarming === "Gehele woning" && !heeftWaarde(data.vloerM2)) missend.push("Vloerverwarming m²");
    if (!heeftWaarde(data.verdeler)) missend.push("Verdeler aanwezig of ophangen");
    else if (data.verdeler === "Verdeler aanwezig" && !heeftWaarde(data.fotoVerdeler)) missend.push("Foto bestaande verdeler");
    else if (data.verdeler === "Verdeler ophangen" && !heeftWaarde(data.warmtebron)) missend.push("Warmtebron");
  }
  return missend;
};

// Pagina-index van de drie pagina's in het installatieblok.
const INSTALLATIE_TABS = [[13, "E-installaties"], [14, "W-installaties"], [15, "Tekening"]];

const PAGE_VALIDATORS = [
  // 0: Contact
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.projectnummer)) missend.push("Projectnummer");
    if (!heeftWaarde(data.naam)) missend.push("Naam");
    if (!heeftWaarde(data.ingemetenDoor)) missend.push("Ingemeten door");
    // Aanhef is bewust niet verplicht (wel invulbaar).
    if (!heeftWaarde(data.telefoon)) missend.push("Telefoon");
    if (!heeftWaarde(data.mail)) missend.push("E-mail");
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
    if (!heeftWaarde(data.bereikbaarheid)) missend.push("Bereikbaarheid");
    if (!heeftWaarde(data.rijplaten)) missend.push("Rijplaten");
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
    if (!data.geenKruipruimte && !heeftWaarde(data.fotoKruipruimte)) missend.push("Foto kruipruimte (of 'Geen kruipruimte aanwezig' aanvinken)");
    if (!heeftWaarde(data.fotoBereikbaarheid)) missend.push("Foto bereikbaarheid");
    return missend;
  },
  // 5: Wandafwerking & Gevelbekleding - gevelbekleding gebruikt niet elk
  // project elke materiaalsoort, dus daar alleen controleren dat er in elk
  // geval íets gekozen is.
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.binnenwand)) missend.push("Binnenwandafwerking");
    if (data.binnenwand === "Compleet afgewerkt" && !heeftWaarde(data.stucwerk)) missend.push("Stucwerk");
    const ietsGekozen = STEENSTRIP_FORMATEN.includes(data.steenstrip) || heeftWaarde(data.composiet) || heeftWaarde(data.keramaType) || heeftWaarde(data.houtType);
    if (!ietsGekozen) missend.push("Minimaal één gevelbekleding-optie (steenstrips, composiet, kerama of hout)");
    if (STEENSTRIP_FORMATEN.includes(data.steenstrip)) {
      if (!heeftWaarde(data.steenstripType)) missend.push("Type / omschrijving steenstrips");
      if (!heeftWaarde(data.steenstripCode)) missend.push("Code steenstrips");
      if (!heeftWaarde(data.steenstripVoegkleur)) missend.push("Voegkleur steenstrips");
      if (!heeftWaarde(data.steenstripBovenKozijn)) missend.push("Steenstrips: afwerking boven het kozijn");
    }
    return missend;
  },
  // 6: Kozijn 1 (altijd verplicht)
  kozijnValidator("k1", "Kozijn 1", true),
  // 7: Kozijn 1 Schets
  (data) => (heeftWaarde(data.schetsKozijn1) ? [] : ["Schets kozijn 1"]),
  // 8: Kozijn 2 (alleen verplicht als er een type gekozen is)
  kozijnValidator("k2", "Kozijn 2", false),
  // 9: Kozijn 2 Schets
  (data) => (data.k2Type && !heeftWaarde(data.schetsKozijn2) ? ["Schets kozijn 2"] : []),
  // 10: Kozijn 3 (alleen verplicht als er een type gekozen is)
  kozijnValidator("k3", "Kozijn 3", false),
  // 11: Kozijn 3 Schets
  (data) => (data.k3Type && !heeftWaarde(data.schetsKozijn3) ? ["Schets kozijn 3"] : []),
  // 12: Dak & Lichtstraat
  (data) => {
    const missend = [];
    if (!heeftWaarde(data.dakbedekking)) missend.push("Dakbedekking");
    if (!heeftWaarde(data.dakrandAfwerking)) missend.push("Dakrandafwerking");
    if (data.dakrandAfwerking === "Modern zetwerk" && !heeftWaarde(data.dakrandKleur)) missend.push("Dakrand kleur RAL");
    if (!heeftWaarde(data.overstek)) missend.push("Overstek");
    if (data.overstek === "Ja") {
      if (!heeftWaarde(data.overstekMM)) missend.push("Overstek diepte (MM)");
      if (!heeftWaarde(data.overstekRAL)) missend.push("Overstek RAL kleur");
    }
    if (!heeftWaarde(data.lichtstraat)) missend.push("Lichtstraat");
    if (data.lichtstraat === "Lessenaar" || data.lichtstraat === "Zadeldak") {
      if (!heeftWaarde(data.lichtstraatLengteMM)) missend.push("Lichtstraat lengte");
      if (!heeftWaarde(data.lichtstraatBreedteMM)) missend.push("Lichtstraat breedte");
      if (!heeftWaarde(data.lichtstraatKleur)) missend.push("Lichtstraat kleur");
      if (!heeftWaarde(data.lichtstraatDelenGlas)) missend.push("Lichtstraat aantal delen glas");
    }
    return missend;
  },
  // 13-15: Installatieblok (E-installaties, W-installaties, Installatietekening).
  // Binnen het blok mag je vrij wisselen zonder controle; pas bij "Volgende"
  // op de tekening wordt alles van E en W in één keer gecontroleerd.
  null,
  null,
  (data) => [
    ...valideerE(data).map(m => `E-installaties: ${m}`),
    ...valideerW(data).map(m => `W-installaties: ${m}`),
  ],
  // 16: Extra foto's - optioneel.
  null,
];

export default function App() {
  const [page, setPage] = useState(0);
  // Verste pagina waar je al bent geweest (tot daar kun je via de bolletjes springen).
  const [verstePagina, setVerstePagina] = useState(0);
  // Bij elke andere pagina bovenaan beginnen (de navigatiebalk staat onderaan).
  useEffect(() => { window.scrollTo(0, 0); setVerstePagina(v => Math.max(v, page)); }, [page]);
  const [foutmeldingen, setFoutmeldingen] = useState([]);
  const composietAndersFotoRef = useRef(null);
  const [data, setData] = useState({
    // Contact
    projectnummer: "",
    geslacht: "", naam: "", datum: new Date().toISOString().split("T")[0],
    ingemetenDoor: laatsteInmeter(), gevondenVia: "",
    telefoon: "", mail: "", plaats: "", adres: "", postcode: "", opmerkingen: "",
    // Maatvoering
    hoogte: "", diepteBuiten: "", diepteBinnen: "", breedteBuiten: "", breedteBinnen: "",
    schetsMaatvoering: null,
    // Voorbereidingen
    bereikbaarheid: [], rijplaten: "",
    bouwtekeningen: "", vergunning: "", doorbraakMM: "", constructeur: "",
    // Foto's
    fotoAchterBuiten: null, fotoAchterBinnen: null, fotoKruipruimte: null, fotoBereikbaarheid: null,
    geenKruipruimte: false,
    // Wandafwerking
    binnenwand: "", stucwerk: "",
    // Gevelbekleding
    steenstrip: "", steenstripType: "", steenstripCode: "", steenstripVoegkleur: "", steenstripBovenKozijn: "", steenstripFoto: null,
    composiet: "", composietAnders: "", composietAndersFoto: null,
    keramaType: "", keramaKleur: "",
    houtType: "", houtKleur: "",
    gevelOpmerking: "",
    // Kozijn 1
    k1Type: "", k1Opties: [], k1Opmerking: "", k1Materiaal: "", k1RAL: "", k1Glas: "", k1Breedte: "", k1Hoogte: "",
    k1RaamType: "", k1HarmonicaDelen: "", k1HarmonicaRichting: "", k1Ventilatierooster: "",
    schetsKozijn1: null,
    // Kozijn 2
    k2Type: "", k2Opties: [], k2Opmerking: "", k2Materiaal: "", k2RAL: "", k2Glas: "", k2Breedte: "", k2Hoogte: "",
    k2RaamType: "", k2HarmonicaDelen: "", k2HarmonicaRichting: "", k2Ventilatierooster: "",
    schetsKozijn2: null,
    // Kozijn 3
    k3Type: "", k3Opties: [], k3Opmerking: "", k3Materiaal: "", k3RAL: "", k3Glas: "", k3Breedte: "", k3Hoogte: "",
    k3RaamType: "", k3HarmonicaDelen: "", k3HarmonicaRichting: "", k3Ventilatierooster: "",
    schetsKozijn3: null,
    // Dak
    dakbedekking: "", overstek: "", overstekMM: "", overstekRAL: "", dakrandAfwerking: "", dakrandKleur: "",
    lichtstraat: "", lichtstraatLengteMM: "", lichtstraatBreedteMM: "", lichtstraatKleur: "", lichtstraatDelenGlas: "",
    schetsLichtstraatPositie: null, dakOpmerking: "",
    // E-installaties
    eUitvoering: "", schakelMerk: "", schakelMerkAnders: "", schakelKleur: "",
    stopcontacten: [], stopcontactenAnders: "",
    stopAantalEnkel: "", stopAantalDubbel: "", stopAantalTripel: "", stopAantalAnders: "",
    verlichting: [], verlichtingSpotjesKleur: "",
    verAantalSpotjes: "", verAantalHanglamp: "", verAantalWandlampjes: "",
    hanglampOphangen: false, wandlampjesOphangen: false,
    schakelaars: [], hotelschakeling: false, hotelLampen: [],
    schAantalSchakelaar: "", schAantalDimmer: "", schAantalSensor: "",
    buitenVerlichting: [], buitenSpotjesKleur: "", buitenSpotjesRAL: "",
    buitenAantalSpotjes: "", buitenAantalWandlamp: "", buitenWandlampType: "",
    wcd: false, wcdAantal: "",
    warmteKoude: [], aircoUitvoering: "", aircoVermogen: "",
    eOpmerking: "",
    schetsEinstallatie: null, schetsInstallatieStaat: null,
    // W-installaties
    hwaMateriaal: "", bladvanger: false, vergaarbak: false,
    hwaAantal: "", buitenkraan: "",
    vloerverwarming: "", vloerM2: "", verdeler: "", fotoVerdeler: null, warmtebron: [],
    wOpmerking: "",
    // Extra foto's
    extraFoto1: null, extraFoto1Omschrijving: "", extraFoto2: null, extraFoto2Omschrijving: "",
    extraFoto3: null, extraFoto3Omschrijving: "", extraFoto4: null, extraFoto4Omschrijving: "",
  });
  // Lege beginstaat (met de datum van vandaag), om te kunnen vergelijken en resetten.
  const beginStaatRef = useRef(null);
  if (!beginStaatRef.current) beginStaatRef.current = data;

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));
  const buitenHeeft = (opt) => (data.buitenVerlichting || []).includes(opt);
  const zetBuiten = (opt, aan) => set("buitenVerlichting", aan ? [...(data.buitenVerlichting || []), opt] : (data.buitenVerlichting || []).filter(v => v !== opt));

  // --- Projectnummer: bestaande gegevens ophalen bij SharePoint (prefill bij 2e/3e opname) ---
  const [projectStatus, setProjectStatus] = useState({ loading: false, error: null, foundVersion: null, nextVersion: 1 });

  // Welk projectnummer het laatst is opgehaald, en of het formulier daaruit gevuld is.
  const opgehaaldNrRef = useRef("");
  const gevuldUitProjectRef = useRef(false);

  // Heeft de gebruiker al iets ingevuld naast projectnummer en datum?
  const formulierHeeftInvoer = () => Object.keys(beginStaatRef.current).some(k =>
    k !== "projectnummer" && k !== "datum" &&
    JSON.stringify(data[k]) !== JSON.stringify(beginStaatRef.current[k]));

  // --- Concept automatisch bewaren op dit apparaat (zie concept.js) ---
  const [conceptAanbod, setConceptAanbod] = useState(null); // gevonden concept bij opstarten
  const [conceptGecheckt, setConceptGecheckt] = useState(false);
  const gewijzigdRef = useRef(false); // onverstuurde wijzigingen?
  const eersteDataRef = useRef(true);
  const negeerWijzigingRef = useRef(false); // eerstvolgende data-wijziging niet als "onverstuurd" tellen

  useEffect(() => {
    conceptLaden().then((c) => {
      const heeftInvoer = c && c.data && Object.keys(beginStaatRef.current).some(k =>
        k !== "datum" && JSON.stringify(c.data[k]) !== JSON.stringify(beginStaatRef.current[k]));
      if (heeftInvoer) setConceptAanbod(c);
      setConceptGecheckt(true);
    });
  }, []);

  useEffect(() => {
    if (eersteDataRef.current) { eersteDataRef.current = false; return; }
    if (negeerWijzigingRef.current) { negeerWijzigingRef.current = false; return; }
    gewijzigdRef.current = true;
  }, [data]);

  // Eén seconde na de laatste wijziging bewaren (niet zolang de vraag
  // "doorgaan met concept?" nog openstaat, anders overschrijven we dat concept).
  useEffect(() => {
    if (!conceptGecheckt || conceptAanbod || !gewijzigdRef.current) return;
    const t = setTimeout(() => conceptBewaren(data, page), 1000);
    return () => clearTimeout(t);
  }, [data, page, conceptGecheckt, conceptAanbod]);

  useEffect(() => {
    const waarschuw = (e) => { if (gewijzigdRef.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", waarschuw);
    return () => window.removeEventListener("beforeunload", waarschuw);
  }, []);

  const conceptHervatten = () => {
    const c = conceptAanbod;
    setData({ ...beginStaatRef.current, ...c.data });
    opgehaaldNrRef.current = (c.data.projectnummer || "").trim();
    setPage(Math.min(c.page || 0, PAGES.length - 1));
    setConceptAanbod(null);
  };
  const conceptWeggooien = () => {
    if (!window.confirm("Weet je zeker dat je het bewaarde formulier wilt weggooien en opnieuw wilt beginnen?")) return;
    conceptWissen();
    setConceptAanbod(null);
  };

  const projectGegevensOphalen = async (nr) => {
    const projectnummer = (nr || "").trim();
    // Alleen ophalen als het nummer echt veranderd is (niet bij elk wegtikken uit het veld).
    if (projectnummer === opgehaaldNrRef.current) return;
    opgehaaldNrRef.current = projectnummer;
    if (!projectnummer) {
      setProjectStatus({ loading: false, error: null, foundVersion: null, nextVersion: 1 });
      return;
    }
    setProjectStatus(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/project-ophalen?projectnummer=${encodeURIComponent(projectnummer)}`);
      if (res.status === 404) {
        const info = await res.json().catch(() => ({}));
        // Was het formulier gevuld vanuit een ánder project? Dan die gegevens weghalen.
        if (gevuldUitProjectRef.current) {
          gevuldUitProjectRef.current = false;
          setData({ ...beginStaatRef.current, projectnummer });
        }
        setProjectStatus({ loading: false, foundVersion: null, nextVersion: 1,
          error: info.code === "GEEN_PROJECTMAP" ? `Let op: er is in SharePoint geen projectmap voor ${projectnummer} gevonden. Controleer het nummer of laat de verkoper de map eerst aanmaken — anders lukt het versturen straks niet.` : null });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Kon project niet ophalen");
      }
      const json = await res.json();
      if (formulierHeeftInvoer() && !window.confirm(`Voor project ${projectnummer} is versie V${json.versie} gevonden. Wil je de gegevens die je nu hebt ingevuld vervangen door die opgeslagen versie?`)) {
        setProjectStatus({ loading: false, error: null, foundVersion: json.versie, nextVersion: json.versie + 1 });
        return;
      }
      // Oude, niet meer gebruikte velden niet overnemen (losse W-tekening bestaat niet meer).
      // eslint-disable-next-line no-unused-vars
      const { schetsWinstallatie, ...opgeslagen } = json.data || {};
      // Schoon beginnen (geen restjes van een ander project) en de datum van vandaag houden.
      // Datum en inmeter horen bij dít bezoek, niet bij de opgeslagen versie.
      setData({ ...beginStaatRef.current, ...opgeslagen, projectnummer, datum: beginStaatRef.current.datum, ingemetenDoor: data.ingemetenDoor || beginStaatRef.current.ingemetenDoor });
      gevuldUitProjectRef.current = true;
      setProjectStatus({ loading: false, error: null, foundVersion: json.versie, nextVersion: json.versie + 1 });
    } catch {
      // Geen of slecht bereik, of SharePoint niet bereikbaar: begrijpelijke melding
      // i.p.v. een technische foutmelding. Invullen kan gewoon doorgaan.
      opgehaaldNrRef.current = ""; // bij opnieuw wegtikken nog een keer proberen
      setProjectStatus({ loading: false, foundVersion: null, nextVersion: 1,
        error: "Kon het project niet ophalen uit SharePoint (geen verbinding?). Je kunt gewoon verder met invullen; tik later nog eens in het projectnummer om het opnieuw te proberen." });
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
    return pdf(createElement(InmeetPdf, { data: schoneData(data), logoSrc: logoUrl })).toBlob();
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

  // Bestand opslaan op het apparaat (noodoplossing als versturen mislukt).
  const bewaarBestand = (blob, naam) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = naam;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const bestandsBasis = () => `Inmeetformulier_${(data.projectnummer || "zonder-nummer").trim()}_${data.datum || ""}`;
  const downloadPdf = async () => {
    try { bewaarBestand(await genereerPdfBlob(), `${bestandsBasis()}.pdf`); }
    catch (err) { setPdfStatus({ loading: false, error: err.message || "PDF genereren is mislukt" }); }
  };
  const downloadGegevens = () =>
    bewaarBestand(new Blob([JSON.stringify(schoneData(data))], { type: "application/json" }), `${bestandsBasis()}_gegevens.json`);

  // Na succesvol versturen: schoon beginnen voor de volgende klant.
  const nieuwFormulier = () => {
    if (!window.confirm("Nieuw formulier beginnen? Het huidige formulier is al opgeslagen in SharePoint.")) return;
    const vandaag = new Date().toISOString().slice(0, 10);
    negeerWijzigingRef.current = true;
    gewijzigdRef.current = false;
    setData({ ...beginStaatRef.current, datum: vandaag, ingemetenDoor: data.ingemetenDoor });
    opgehaaldNrRef.current = "";
    gevuldUitProjectRef.current = false;
    setProjectStatus({ loading: false, error: null, foundVersion: null, nextVersion: 1 });
    setSubmitStatus({ loading: false, error: null, done: false, versie: null });
    setFoutmeldingen([]);
    conceptWissen();
    setPage(0);
  };

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
        body: JSON.stringify({ projectnummer: data.projectnummer.trim(), data: schoneData(data), pdfDataUrl }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Opslaan is mislukt");
      setSubmitStatus({ loading: false, error: null, done: true, versie: body.versie });
      gewijzigdRef.current = false;
      conceptWissen();
      setProjectStatus(s => ({ ...s, foundVersion: body.versie, nextVersion: body.versie + 1 }));
    } catch (err) {
      setSubmitStatus({ loading: false, error: err.message || "PDF genereren of opslaan is mislukt", done: false, versie: null });
    }
  };

  // Let op: wordt als gewone functie aangeroepen ({KozijnPage(...)}), niet als
  // <KozijnPage />. Als component-binnen-App zou React de hele pagina bij elke
  // toetsaanslag opnieuw opbouwen, waardoor invoervelden hun focus verliezen.
  const KozijnPage = ({ prefix, num }) => {
    const type = data[`${prefix}Type`];
    // Alleen opties die bij het gekozen type horen (na wisselen van type blijven
    // opties van het vorige type anders onzichtbaar "hangen").
    const opties = kozijnOpties(data, prefix);
    const schuifpuiOpties = KOZIJN_OPTIES.Schuifpui;
    const openslaandOpties = KOZIJN_OPTIES["Openslaande deuren"];
    const loopdeurOpties = KOZIJN_OPTIES.Loopdeur;
    const vastGlasGekozen = kozijnVastGlas(data, prefix);

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
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Harmonica wand opties</p></div>
            <div style={styles.sectionBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Aantal delen:</div>
                  <RadioGroup name={`${prefix}harmonicaDelen`} options={["3-delig", "4-delig", "5-delig"]}
                    value={data[`${prefix}HarmonicaDelen`]} onChange={v => set(`${prefix}HarmonicaDelen`, v)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Openingsrichting:</div>
                  <RadioGroup name={`${prefix}harmonicaRichting`} options={["Links", "Rechts"]}
                    value={data[`${prefix}HarmonicaRichting`]} onChange={v => set(`${prefix}HarmonicaRichting`, v)} />
                </div>
              </div>
              <div style={styles.divider} />
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Opmerkingen:</div>
              <textarea style={styles.textarea} placeholder="Extra opmerkingen..." value={data[`${prefix}Opmerking`]}
                onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
            </div>
          </div>
        )}

        {type === "Raam" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Raam opties</p></div>
            <div style={styles.sectionBody}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Type raam:</div>
              <RadioGroup name={`${prefix}raamType`} options={["Vast glas", "Draaikiepraam", "Uitzetraam"]}
                value={data[`${prefix}RaamType`]} onChange={v => set(`${prefix}RaamType`, v)} />
              <div style={styles.divider} />
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Opmerkingen:</div>
              <textarea style={styles.textarea} placeholder="Extra opmerkingen..." value={data[`${prefix}Opmerking`]}
                onChange={e => set(`${prefix}Opmerking`, e.target.value)} />
            </div>
          </div>
        )}

        {vastGlasGekozen && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}><p style={{ ...styles.sectionTitle, color: GOLD }}>Ventilatierooster</p></div>
            <div style={styles.sectionBody}>
              <RadioGroup name={`${prefix}ventilatierooster`} options={["Ja", "Nee"]}
                value={data[`${prefix}Ventilatierooster`]} onChange={v => set(`${prefix}Ventilatierooster`, v)} />
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
                <RadioGroup name={`${prefix}glas`} options={["HR++", "HR+++"]}
                  value={data[`${prefix}Glas`]} onChange={v => set(`${prefix}Glas`, v)} />
              </div>
            </div>
            <div style={styles.divider} />
            <div style={styles.row}>
              <div style={styles.label}>Formaat:</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>Breedte:</span>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="0" value={data[`${prefix}Breedte`]}
                  onChange={e => set(`${prefix}Breedte`, alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={{ fontSize: 13 }}>Hoogte:</span>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="0" value={data[`${prefix}Hoogte`]}
                  onChange={e => set(`${prefix}Hoogte`, alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sd = schoneData(data); // opgeschoonde gegevens voor samenvatting en legenda
  const naarPagina = (i) => { setFoutmeldingen([]); setPage(i); };
  const mmTekst = (v) => (heeftWaarde(v) ? `${v} MM` : "");
  const pages = [
    // 0: Contact
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Contactgegevens</p></div>
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
            <div style={styles.label}>E-mail:</div>
            <input type="email" style={styles.input} value={data.mail} onChange={e => set("mail", e.target.value)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Datum:</div>
            <input type="date" style={styles.input} value={data.datum} onChange={e => set("datum", e.target.value)} />
            <div style={styles.label}>Ingemeten door:</div>
            <input style={styles.input} placeholder="Naam inmeter" value={data.ingemetenDoor}
              onChange={e => { set("ingemetenDoor", e.target.value); bewaarInmeter(e.target.value); }} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Hoe heeft u ons gevonden?</div>
            <input style={{ ...styles.input, flex: 1 }} placeholder="Bijv. Google, Instagram, via de buren, eerder klant geweest..."
              value={data.gevondenVia} onChange={e => set("gevondenVia", e.target.value)} />
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
            <input inputMode="numeric" style={styles.inputSmall} value={data.hoogte} onChange={e => set("hoogte", alleenCijfers(e.target.value))} />
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
            <span style={styles.hint}>P=0 van huidige vloer tot plafond huidige woning</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Diepte:</div>
            <div style={{ flex: 1 }}>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Buiten:</span>
                <input inputMode="numeric" style={styles.inputSmall} value={data.diepteBuiten} onChange={e => set("diepteBuiten", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
              </div>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Binnen:</span>
                <input inputMode="numeric" style={styles.inputSmall} value={data.diepteBinnen} onChange={e => set("diepteBinnen", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
              </div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Breedte:</div>
            <div style={{ flex: 1 }}>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Buiten:</span>
                <input inputMode="numeric" style={styles.inputSmall} value={data.breedteBuiten} onChange={e => set("breedteBuiten", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={styles.hint}>Relevant bij werken met erfgrens</span>
              </div>
              <div style={styles.row}>
                <span style={{ fontSize: 13, minWidth: 60 }}>Binnen:</span>
                <input inputMode="numeric" style={styles.inputSmall} value={data.breedteBinnen} onChange={e => set("breedteBinnen", alleenCijfers(e.target.value))} />
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
          <DrawingCanvas id="maatvoering" value={data.schetsMaatvoering} onChange={v => set("schetsMaatvoering", v)} grid square />
        </div>
      </div>
    </div>,

    // 3: Voorbereidingen
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Voorbereidingen</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Bereikbaarheid:</div>
            <CheckGroup options={["Kraan", "Bereikbaar"]} values={data.bereikbaarheid} onChange={v => set("bereikbaarheid", v)} />
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Rijplaten:</div>
            <RadioGroup name="rijplaten" options={["Benodigd", "N.V.T."]} value={data.rijplaten} onChange={v => set("rijplaten", v)} />
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
            <input inputMode="numeric" style={styles.inputSmall} placeholder="0" value={data.doorbraakMM} onChange={e => set("doorbraakMM", alleenCijfers(e.target.value))} />
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
              {!data.geenKruipruimte && (
                <PhotoUpload label="Kruipruimte" hint="Vloer op funderingsbalk" value={data.fotoKruipruimte} onChange={v => set("fotoKruipruimte", v)} />
              )}
              <label style={{ ...styles.checkLabel, marginTop: data.geenKruipruimte ? 0 : 10 }}>
                <input type="checkbox" style={{ accentColor: GOLD }} checked={!!data.geenKruipruimte}
                  onChange={e => set("geenKruipruimte", e.target.checked)} />
                Geen kruipruimte aanwezig
              </label>
            </div>
            <PhotoUpload label="Bereikbaarheid" hint="Doorgang naar de tuin" value={data.fotoBereikbaarheid} onChange={v => set("fotoBereikbaarheid", v)} />
          </div>
        </div>
      </div>
    </div>,

    // 5: Wandafwerking & Gevelbekleding
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Wandafwerking & Gevelbekleding</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, marginBottom: 10 }}>Binnenwandafwerking</div>
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

          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, marginBottom: 10 }}>Gevelbekleding</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Steenstrips</div>
          <a href={STEENSTRIP_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "10px 16px", borderRadius: 8, border: `2px solid ${GOLD}`, color: GOLD, fontWeight: 700, fontSize: 13, textDecoration: "none", marginBottom: 12 }}>
            Bekijk steenstrips bij Vandersanden ↗
          </a>
          <div style={{ ...styles.row, marginBottom: 6 }}>
            <div style={styles.label}>Formaat:</div>
            <RadioGroup name="steenstrip" options={STEENSTRIP_FORMATEN} value={data.steenstrip} onChange={v => set("steenstrip", v)} />
          </div>
          {STEENSTRIP_FORMATEN.includes(data.steenstrip) && (
            <div style={{ ...styles.subSection, marginBottom: 16 }}>
              <div style={{ ...styles.row, marginBottom: 10 }}>
                <div style={styles.label}>Type:</div>
                <input style={styles.input} placeholder="Type / omschrijving, bijv. Mano Rosso" value={data.steenstripType}
                  onChange={e => set("steenstripType", e.target.value)} />
              </div>
              <div style={{ ...styles.row, marginBottom: 10 }}>
                <div style={styles.label}>Code:</div>
                <input style={styles.input} placeholder="Code van Vandersanden (ter controle)" value={data.steenstripCode}
                  onChange={e => set("steenstripCode", e.target.value)} />
              </div>
              <div style={{ ...styles.row, marginBottom: 10 }}>
                <div style={styles.label}>Voegkleur:</div>
                <RadioGroup name="steenstripVoegkleur" options={["Lichtgrijs", "Middengrijs", "Donkergrijs"]} value={data.steenstripVoegkleur} onChange={v => set("steenstripVoegkleur", v)} />
              </div>
              <div style={{ ...styles.row, marginBottom: 4 }}>
                <div style={styles.label}>Boven het kozijn:</div>
                <RadioGroup name="steenstripBovenKozijn" options={["Verticale rollaag", "Alucarbon"]} value={data.steenstripBovenKozijn} onChange={v => set("steenstripBovenKozijn", v)} />
              </div>
              <div style={styles.hint}>Wanneer u een overstek heeft, kunt u niet kiezen voor een rollaag.</div>
              {data.overstek === "Ja" && data.steenstripBovenKozijn === "Verticale rollaag" && (
                <div style={{ fontSize: 12, color: "#c0392b", fontWeight: 600, marginTop: 6 }}>Let op: bij Dak & Lichtstraat is een overstek ingevuld. Kies dan Alucarbon.</div>
              )}
              <div style={{ marginTop: 14 }}>
                <PhotoUpload label="Foto bestaande gevel" hint="Zodat kantoor de steenstrip goed kan matchen" value={data.steenstripFoto} onChange={v => set("steenstripFoto", v)} />
              </div>
            </div>
          )}

          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Rhombus-smal profiel (Composiet)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[{ val: "Rustic Teak", foto: fotoCompositRusticTeak }, { val: "Compleet zwart", foto: fotoCompositComleetZwart }, { val: "Teak met zwart", foto: fotoCompositTeakZwart }].map(opt => (
              <div key={opt.val} style={styles.optionCard(data.composiet === opt.val)} onClick={() => set("composiet", opt.val)}>
                <div style={{ aspectRatio: "1 / 1", borderRadius: 6, marginBottom: 6, overflow: "hidden" }}>
                  <img src={opt.foto} alt={opt.val} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" readOnly checked={data.composiet === opt.val} style={{ accentColor: GOLD }} />
                  <span style={{ fontSize: 12 }}>{opt.val}</span>
                </div>
              </div>
            ))}
            <div style={styles.optionCard(data.composiet === "Anders")}>
              <div style={{ aspectRatio: "1 / 1", borderRadius: 6, marginBottom: 6, overflow: "hidden", cursor: "pointer" }}
                onClick={() => { set("composiet", "Anders"); composietAndersFotoRef.current?.click(); }}>
                {data.composietAndersFoto ? (
                  <img src={data.composietAndersFoto} alt="Anders" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", border: `2px dashed ${GOLD}`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontSize: 20 }}>📷</span>
                    <span style={{ fontSize: 11, color: GOLD }}>Foto toevoegen</span>
                  </div>
                )}
              </div>
              <input ref={composietAndersFotoRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) fotoInlezen(f).then(url => { set("composietAndersFoto", url); set("composiet", "Anders"); }); e.target.value = ""; }} />
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
            <div style={{ display: "flex", gap: 12 }}>
              <img src={fotoKerama} alt="Kerama" style={{ width: 84, height: 84, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Kerama <span style={{ color: GOLD, fontWeight: 400, fontSize: 11 }}>Luxe onderhoudsvrij</span></div>
                <input style={styles.input} placeholder="Type profiel:" value={data.keramaType} onChange={e => set("keramaType", e.target.value)} />
                <input style={{ ...styles.input, marginTop: 8 }} placeholder="Kleur:" value={data.keramaKleur} onChange={e => set("keramaKleur", e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <img src={fotoHoutThermisch} alt="Thermisch gemodificeerd hout" style={{ width: 84, height: 84, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Thermisch gemodificeerd hout</div>
                <input style={styles.input} placeholder="Type profiel:" value={data.houtType} onChange={e => set("houtType", e.target.value)} />
                <input style={{ ...styles.input, marginTop: 8 }} placeholder="Kleur:" value={data.houtKleur} onChange={e => set("houtKleur", e.target.value)} />
              </div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen</div>
          <textarea style={styles.textarea} value={data.gevelOpmerking} onChange={e => set("gevelOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 6: Kozijn 1
    KozijnPage({ prefix: "k1", num: 1 }),
    // 7: Kozijn 1 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 1 — Schets</p></div>
        <div style={styles.sectionBody}>
          <div style={{ ...styles.hint, marginBottom: 8, color: GOLD, fontWeight: 600 }}>Dit is het buitenaanzicht</div>
          <DrawingCanvas id="kozijn1" value={data.schetsKozijn1} onChange={v => set("schetsKozijn1", v)} grid gridCols={10} gridRows={4} aspectRatio="10 / 4" />
        </div>
      </div>
    </div>,
    // 8: Kozijn 2
    KozijnPage({ prefix: "k2", num: 2 }),
    // 9: Kozijn 2 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 2 — Schets</p></div>
        <div style={styles.sectionBody}>
          <div style={{ ...styles.hint, marginBottom: 8, color: GOLD, fontWeight: 600 }}>Dit is het buitenaanzicht</div>
          <DrawingCanvas id="kozijn2" value={data.schetsKozijn2} onChange={v => set("schetsKozijn2", v)} grid gridCols={10} gridRows={4} aspectRatio="10 / 4" />
        </div>
      </div>
    </div>,
    // 10: Kozijn 3
    KozijnPage({ prefix: "k3", num: 3 }),
    // 11: Kozijn 3 Schets
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Kozijn 3 — Schets</p></div>
        <div style={styles.sectionBody}>
          <div style={{ ...styles.hint, marginBottom: 8, color: GOLD, fontWeight: 600 }}>Dit is het buitenaanzicht</div>
          <DrawingCanvas id="kozijn3" value={data.schetsKozijn3} onChange={v => set("schetsKozijn3", v)} grid gridCols={10} gridRows={4} aspectRatio="10 / 4" />
        </div>
      </div>
    </div>,

    // 12: Dak & Lichtstraat
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Dakbedekking & Lichtstraat</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.row}>
            <div style={styles.label}>Dakbedekking:</div>
            <RadioGroup name="dak" options={["EPDM", "Sedum", "Bitumen"]} value={data.dakbedekking} onChange={v => set("dakbedekking", v)} />
          </div>
          <div style={styles.hint}>Bitumen: alleen mogelijk bij aansluiting op bestaand bitumen dak.</div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Dakrandafwerking:</div>
            <RadioGroup name="dakrand" options={["Modern zetwerk", "Kraal zink", "Zinken zetkap"]} value={data.dakrandAfwerking} onChange={v => set("dakrandAfwerking", v)} />
          </div>
          {data.dakrandAfwerking === "Modern zetwerk" && (
            <div style={styles.subSection}>
              <div style={styles.row}>
                <div style={styles.label}>Kleur RAL:</div>
                <input style={styles.input} placeholder="RAL kleurcode" value={data.dakrandKleur} onChange={e => set("dakrandKleur", e.target.value)} />
              </div>
            </div>
          )}
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Overstek:</div>
            <RadioGroup name="overstek" options={["N.V.T.", "Ja"]} value={data.overstek} onChange={v => set("overstek", v)} />
          </div>
          {data.overstek === "Ja" && (
            <div style={styles.subSection}>
              <div style={styles.row}>
                <div style={styles.label}>Diepte:</div>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="MM" value={data.overstekMM} onChange={e => set("overstekMM", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <div style={styles.label}>Kleur RAL:</div>
                <input style={styles.input} placeholder="RAL kleurcode" value={data.overstekRAL} onChange={e => set("overstekRAL", e.target.value)} />
              </div>
            </div>
          )}
          <div style={styles.divider} />
          <div style={styles.row}>
            <div style={styles.label}>Lichtstraat:</div>
            <label style={styles.radioLabel} onClick={() => set("lichtstraat", "N.V.T.")}>
              <input type="radio" readOnly checked={data.lichtstraat === "N.V.T."} style={{ accentColor: GOLD }} />
              N.V.T.
            </label>
            {[{ val: "Lessenaar", foto: fotoLichtstraatLessenaar }, { val: "Zadeldak", foto: fotoLichtstraatZadeldak }].map(opt => (
              <div key={opt.val} style={{ ...styles.optionCard(data.lichtstraat === opt.val), padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}
                onClick={() => set("lichtstraat", opt.val)}>
                <div style={{ width: 88, height: 88, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                  <img src={opt.foto} alt={opt.val} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" readOnly checked={data.lichtstraat === opt.val} style={{ accentColor: GOLD }} />
                  <span style={{ fontSize: 12 }}>{opt.val}</span>
                </div>
              </div>
            ))}
          </div>
          {(data.lichtstraat === "Lessenaar" || data.lichtstraat === "Zadeldak") && (
            <div style={styles.subSection}>
              <div style={styles.row}>
                <div style={styles.label}>Formaat:</div>
                <span style={{ fontSize: 13 }}>Lengte:</span>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="0" value={data.lichtstraatLengteMM} onChange={e => set("lichtstraatLengteMM", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
                <span style={{ fontSize: 13 }}>Breedte:</span>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="0" value={data.lichtstraatBreedteMM} onChange={e => set("lichtstraatBreedteMM", alleenCijfers(e.target.value))} />
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>MM</span>
              </div>
              <div style={styles.divider} />
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Kleur:</div>
              <RadioGroup name="lichtstraatKleur" options={["Wit", "Zwart", "Wit binnen / Zwart buiten"]}
                value={data.lichtstraatKleur} onChange={v => set("lichtstraatKleur", v)} />
              <div style={styles.divider} />
              <div style={styles.row}>
                <div style={styles.label}>Aantal delen glas:</div>
                <input style={styles.inputSmall} inputMode="numeric" placeholder="0" value={data.lichtstraatDelenGlas} onChange={e => set("lichtstraatDelenGlas", alleenCijfers(e.target.value))} />
              </div>
              <div style={styles.divider} />
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Positie lichtstraat op dak (schets):</div>
              <DrawingCanvas id="lichtstraatPositie" value={data.schetsLichtstraatPositie} onChange={v => set("schetsLichtstraatPositie", v)}
                grid square gridCols={20} gridRows={20} maxVh={40} />
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / extra's:</div>
          <textarea style={styles.textarea} value={data.dakOpmerking} onChange={e => set("dakOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 13: E-installaties
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>E-installaties</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 11, color: GOLD, marginBottom: 12, fontStyle: "italic" }}>Positie op tekening aangeven gekoppeld met letters. Schakelaar A → spotjes A</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Uitvoering</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[E_UITVOERING_COMPLEET, E_UITVOERING_LEIDINGWERK].map(opt => (
              <label key={opt} style={styles.radioLabel} onClick={() => set("eUitvoering", opt)}>
                <input type="radio" readOnly checked={data.eUitvoering === opt} style={{ accentColor: GOLD }} />
                {opt}
              </label>
            ))}
          </div>
          {data.eUitvoering === E_UITVOERING_LEIDINGWERK && (
            <div style={{ ...styles.hint, marginTop: 6 }}>
              Het afmonteren (schakelaars, stopcontacten, verlichting) gebeurt door de klant.<br />
              <strong>Let op: {E_GARANTIE_TEKST}</strong>
            </div>
          )}
          {data.eUitvoering !== E_UITVOERING_LEIDINGWERK && (
            <>
              <div style={styles.divider} />
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Merk/Type:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                {[{ val: "Gira 55", sub: "Standaard", foto: fotoGira55 }, { val: "Busch-Jaeger", sub: "Modern", foto: fotoBuschJaeger }].map(opt => (
                  <div key={opt.val} style={{ ...styles.optionCard(data.schakelMerk === opt.val), padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}
                    onClick={() => set("schakelMerk", opt.val)}>
                    <div style={{ width: 88, height: 88, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#fff" }}>
                      <img src={opt.foto} alt={opt.val} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="radio" readOnly checked={data.schakelMerk === opt.val} style={{ accentColor: GOLD }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{opt.val}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{opt.sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={styles.radioLabel} onClick={() => set("schakelMerk", "Anders")}>
                    <input type="radio" readOnly checked={data.schakelMerk === "Anders"} style={{ accentColor: GOLD }} />
                    Anders:
                  </label>
                  <input style={{ ...styles.input, width: 200 }} placeholder="Merk en type..." value={data.schakelMerkAnders}
                    onFocus={() => set("schakelMerk", "Anders")} onChange={e => set("schakelMerkAnders", e.target.value)} />
                </div>
              </div>
              <div style={{ ...styles.row, marginTop: 8 }}>
                <div style={styles.label}>Kleur:</div>
                <RadioGroup name="schakelKleur" options={["Wit", "Zwart"]} value={data.schakelKleur} onChange={v => set("schakelKleur", v)} />
              </div>
            </>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Stopcontacten</div>
          <CheckGroupAantal options={["Enkel", "Dubbel", "Tripel", "Anders"]} values={data.stopcontacten} onChange={v => set("stopcontacten", v)}
            aantallen={{ Enkel: data.stopAantalEnkel, Dubbel: data.stopAantalDubbel, Tripel: data.stopAantalTripel, Anders: data.stopAantalAnders }}
            onAantalChange={(opt, val) => set({ Enkel: "stopAantalEnkel", Dubbel: "stopAantalDubbel", Tripel: "stopAantalTripel", Anders: "stopAantalAnders" }[opt], val)}
            extra={opt => opt === "Anders" && (
              <input style={{ ...styles.input, marginTop: 6 }} placeholder="Omschrijving..." value={data.stopcontactenAnders}
                onChange={e => set("stopcontactenAnders", e.target.value)} />
            )} />
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Binnen verlichting</div>
          <div style={{ ...styles.hint, marginBottom: 8 }}>AddOn past altijd een ingestucte centraaldoos toe.</div>
          <CheckGroupAantal options={["Spotjes", "Hanglamp", "Wandlampjes"]} values={data.verlichting} onChange={v => set("verlichting", v)}
            aantallen={{ Spotjes: data.verAantalSpotjes, Hanglamp: data.verAantalHanglamp, Wandlampjes: data.verAantalWandlampjes }}
            onAantalChange={(opt, val) => set({ Spotjes: "verAantalSpotjes", Hanglamp: "verAantalHanglamp", Wandlampjes: "verAantalWandlampjes" }[opt], val)}
            extra={opt => {
              if (opt === "Spotjes") return (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: "#888", marginRight: 8 }}>Kleur:</span>
                  <RadioGroup name="verlichtingSpotjesKleur" options={["Wit", "Zwart"]} value={data.verlichtingSpotjesKleur} onChange={v => set("verlichtingSpotjesKleur", v)} />
                </div>
              );
              const lamp = { Hanglamp: { naam: "hanglamp", veld: "hanglampOphangen", label: "Hanglamp ophangen" },
                Wandlampjes: { naam: "wandlampjes", veld: "wandlampjesOphangen", label: "Wandlampjes ophangen" } }[opt];
              if (!lamp) return null;
              return (
                <div style={{ marginTop: 6 }}>
                  <div style={styles.hint}>AddOn levert alleen de aansluiting en levert/monteert geen {lamp.naam}, tenzij de klant deze zelf aanlevert.</div>
                  <label style={{ ...styles.checkLabel, marginTop: 6 }}>
                    <input type="checkbox" style={{ accentColor: GOLD }} checked={data[lamp.veld]} onChange={e => set(lamp.veld, e.target.checked)} /> {lamp.label}
                  </label>
                </div>
              );
            }} />
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Buiten E-installaties</div>
          {/* Spotjes */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={styles.checkLabel}>
                <input type="checkbox" style={{ accentColor: GOLD, width: 16, height: 16 }} checked={buitenHeeft("Spotjes")} onChange={e => zetBuiten("Spotjes", e.target.checked)} /> Spotjes
              </label>
              {buitenHeeft("Spotjes") && (
                <>
                  <span style={{ fontSize: 12, color: "#888" }}>Aantal:</span>
                  <input style={{ ...styles.inputSmall, width: 70 }} inputMode="numeric" placeholder="0" value={data.buitenAantalSpotjes} onChange={e => set("buitenAantalSpotjes", alleenCijfers(e.target.value))} />
                </>
              )}
            </div>
            {buitenHeeft("Spotjes") && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Kleur:</span>
                <RadioGroup name="buitenSpotjesKleur" options={["Wit", "Zwart", "Kleur van overstek"]} value={data.buitenSpotjesKleur} onChange={v => set("buitenSpotjesKleur", v)} />
                {data.buitenSpotjesKleur === "Kleur van overstek" && (
                  <input style={{ ...styles.inputSmall, width: 120 }} placeholder="RAL-code" value={data.buitenSpotjesRAL} onChange={e => set("buitenSpotjesRAL", e.target.value)} />
                )}
              </div>
            )}
          </div>
          {/* Wandlamp: aantal links, standaard opties rechts */}
          <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={styles.checkLabel}>
                <input type="checkbox" style={{ accentColor: GOLD, width: 16, height: 16 }} checked={buitenHeeft("Wandlamp")} onChange={e => zetBuiten("Wandlamp", e.target.checked)} /> Wandlamp
              </label>
              {buitenHeeft("Wandlamp") && (
                <>
                  <span style={{ fontSize: 12, color: "#888" }}>Aantal:</span>
                  <input style={{ ...styles.inputSmall, width: 70 }} inputMode="numeric" placeholder="0" value={data.buitenAantalWandlamp} onChange={e => set("buitenAantalWandlamp", alleenCijfers(e.target.value))} />
                </>
              )}
            </div>
            {buitenHeeft("Wandlamp") && (
              <div style={{ ...styles.subSection, marginTop: 0, flex: "1 1 280px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  {WANDLAMPEN.map(serie => (
                    <div key={serie.serie} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{serie.serie}</div>
                      {serie.opties.map(o => (
                        <label key={o.label} style={{ ...styles.radioLabel, display: "flex", marginBottom: 4 }} onClick={() => set("buitenWandlampType", o.label)}>
                          <input type="radio" readOnly checked={data.buitenWandlampType === o.label} style={{ accentColor: GOLD }} />
                          {o.kleur} <span style={{ color: "#888", fontSize: 11 }}>({o.code})</span>
                          {o.opmerking && <span style={{ ...styles.hint, marginLeft: 4 }}>{o.opmerking}</span>}
                        </label>
                      ))}
                    </div>
                  ))}
                  <label style={{ ...styles.radioLabel, display: "flex" }} onClick={() => set("buitenWandlampType", "Anders")}>
                    <input type="radio" readOnly checked={data.buitenWandlampType === "Anders"} style={{ accentColor: GOLD }} />
                    Anders
                  </label>
                  {data.buitenWandlampType === "Anders" && (
                    <div style={{ ...styles.hint, marginTop: 4 }}>De klant levert zelf wandlampjes aan en AddOn monteert deze.</div>
                  )}
                </div>
                {wandlampFoto(data.buitenWandlampType) && (
                  <img src={wandlampFoto(data.buitenWandlampType)} alt={data.buitenWandlampType}
                    style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0", flexShrink: 0 }} />
                )}
              </div>
            )}
          </div>
          {/* Buitenstopcontact (WCD) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={styles.checkLabel}>
                <input type="checkbox" style={{ accentColor: GOLD, width: 16, height: 16 }} checked={data.wcd} onChange={e => set("wcd", e.target.checked)} /> Buitenstopcontact
              </label>
              {data.wcd && <span style={{ ...styles.hint, fontStyle: "normal", fontWeight: 600 }}>{WCD_TYPE}</span>}
            </div>
            {data.wcd && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#888" }}>Aantal:</span>
                <RadioGroup name="wcdAantal" options={["1", "2"]} value={data.wcdAantal} onChange={v => set("wcdAantal", v)} />
              </div>
            )}
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Schakelaars</div>
          <CheckGroupAantal options={["Schakelaar", "Dimmer", "Sensor"]} values={data.schakelaars} onChange={v => set("schakelaars", v)}
            aantallen={{ Schakelaar: data.schAantalSchakelaar, Dimmer: data.schAantalDimmer, Sensor: data.schAantalSensor }}
            onAantalChange={(opt, val) => set({ Schakelaar: "schAantalSchakelaar", Dimmer: "schAantalDimmer", Sensor: "schAantalSensor" }[opt], val)} />
          <label style={styles.checkLabel}>
            <input type="checkbox" style={{ accentColor: GOLD, width: 16, height: 16 }} checked={data.hotelschakeling} onChange={e => set("hotelschakeling", e.target.checked)} /> Hotelschakeling gewenst
          </label>
          {data.hotelschakeling && (
            <div style={styles.subSection}>
              <div style={styles.hint}>AddOn past altijd een dubbele hotelschakeling toe.</div>
              <div style={{ fontSize: 12, color: "#888", margin: "10px 0 4px" }}>Welke verlichting krijgt een hotelschakeling?</div>
              <CheckGroup options={HOTEL_VERLICHTING} values={data.hotelLampen} onChange={v => set("hotelLampen", v)} />
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Warmte / Koude</div>
          <CheckGroup options={["Airco"]} values={data.warmteKoude} onChange={v => set("warmteKoude", v)} />
          {(data.warmteKoude || []).includes("Airco") && (
            <div style={styles.subSection}>
              <RadioGroup name="aircoUitvoering" options={["Alleen leidingwerk (voorbereiding)", "Airco"]} value={data.aircoUitvoering} onChange={v => set("aircoUitvoering", v)} />
              {data.aircoUitvoering === "Airco" && (
                <div style={{ ...styles.row, marginTop: 8 }}>
                  <div style={styles.label}>Vermogen:</div>
                  <RadioGroup name="aircoVermogen" options={["2,5 kW", "4,2 kW", "5 kW"]} value={data.aircoVermogen} onChange={v => set("aircoVermogen", v)} />
                </div>
              )}
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / extra's:</div>
          <textarea style={styles.textarea} value={data.eOpmerking} onChange={e => set("eOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 14: W-installaties
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>W-installaties</p></div>
        <div style={styles.sectionBody}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>HWA (Hemelwaterafvoer)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <RadioGroup name="hwa" options={["PVC", "Zink", "Zwart-zink"]} value={data.hwaMateriaal} onChange={v => set("hwaMateriaal", v)} />
            {data.hwaMateriaal && (
              <>
                <span style={{ fontSize: 12, color: "#888" }}>Aantal:</span>
                <input style={{ ...styles.inputSmall, width: 70 }} inputMode="numeric" placeholder="0" value={data.hwaAantal} onChange={e => set("hwaAantal", alleenCijfers(e.target.value))} />
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.bladvanger} onChange={e => set("bladvanger", e.target.checked)} /> Bladvanger</label>
            <label style={styles.checkLabel}><input type="checkbox" style={{ accentColor: GOLD }} checked={data.vergaarbak} onChange={e => set("vergaarbak", e.target.checked)} /> Vergaarbak</label>
          </div>
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Vorstvrije buitenkraan</div>
          <RadioGroup name="buitenkraan" options={["1", "N.V.T."]} value={data.buitenkraan} onChange={v => set("buitenkraan", v)} />
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Vloerverwarming</div>
          <RadioGroup name="vloerverwarming" options={["N.V.T.", "Aanbouw", "Gehele woning"]} value={data.vloerverwarming} onChange={v => set("vloerverwarming", v)} />
          {(data.vloerverwarming === "Aanbouw" || data.vloerverwarming === "Gehele woning") && (
            <div style={styles.subSection}>
              {data.vloerverwarming === "Gehele woning" && (
                <div style={{ ...styles.row, marginBottom: 8 }}>
                  <div style={styles.label}>Oppervlakte:</div>
                  <input style={styles.inputSmall} inputMode="decimal" placeholder="0" value={data.vloerM2} onChange={e => set("vloerM2", e.target.value.replace(/[^0-9.,]/g, ""))} />
                  <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>m²</span>
                </div>
              )}
              <div style={styles.row}>
                <div style={styles.label}>Verdeler:</div>
                <RadioGroup name="verdeler" options={["Verdeler aanwezig", "Verdeler ophangen"]} value={data.verdeler} onChange={v => set("verdeler", v)} />
              </div>
              {data.verdeler === "Verdeler aanwezig" && (
                <div style={{ marginTop: 10, maxWidth: 260 }}>
                  <PhotoUpload label="Foto bestaande verdeler" hint="Zodat we kunnen zien of de groepen er nog bij kunnen" value={data.fotoVerdeler} onChange={v => set("fotoVerdeler", v)} />
                </div>
              )}
              {data.verdeler === "Verdeler ophangen" && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Warmtebron:</div>
                  <CheckGroup options={["CV-ketel", "Warmtepomp", "Stadsverwarming"]} values={data.warmtebron} onChange={v => set("warmtebron", v)} />
                  <div style={{ ...styles.hint, marginTop: 8, fontWeight: 600 }}>{VERDELER_LET_OP}</div>
                </div>
              )}
            </div>
          )}
          <div style={styles.divider} />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Opmerkingen / extra's:</div>
          <textarea style={styles.textarea} value={data.wOpmerking} onChange={e => set("wOpmerking", e.target.value)} />
        </div>
      </div>
    </div>,

    // 15: Installatietekening (E + W op één tekening)
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Installatietekening</p></div>
        <div style={styles.sectionBody}>
          <div style={styles.hint}>E: hoogte en positie stopcontacten en afstand wand-verlichting aangeven. W: posities aangeven vanuit binnenmaat aanbouw.</div>
          <div style={{ marginTop: 10 }}>
            <InstallatieCanvas staat={data.schetsInstallatieStaat} fallbackAfbeelding={data.schetsEinstallatie}
              onChange={(png, staat) => setData(d => ({ ...d, schetsEinstallatie: png, schetsInstallatieStaat: staat }))} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Legenda</div>
            <div style={{ ...styles.hint, marginBottom: 8 }}>Wordt automatisch bijgewerkt: "Opgegeven" komt uit E- en W-installaties, "Getekend" telt de symbolen in de tekening.</div>
            {legendaRijen(sd).length === 0 ? (
              <div style={{ fontSize: 12, color: "#888" }}>Nog niets ingevuld bij E- of W-installaties en nog geen symbolen getekend.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 480 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#888" }}>
                      {["", "Omschrijving", "Kleur", "Type", "Opgegeven", "Getekend"].map(h => <th key={h} style={{ padding: "4px 8px", borderBottom: `1px solid ${GOLD}55`, fontWeight: 600, textAlign: h === "Opgegeven" || h === "Getekend" ? "right" : "left" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {legendaRijen(sd).map(r => {
                      const verschil = r.aantal !== r.getekend;
                      const td = { padding: "2px 8px", borderBottom: "1px solid #eee", background: verschil ? "#fdf1e0" : "transparent" };
                      return (
                        <tr key={r.sym}>
                          <td style={td}><SymboolIcoon symbool={symboolOpKey(r.sym)} grootte={24} /></td>
                          <td style={td}>{r.omschrijving}{r.detail && <div style={{ fontSize: 10, color: "#888" }}>{r.detail}</div>}</td>
                          <td style={td}>{r.kleur}</td>
                          <td style={td}>{r.type}</td>
                          <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.aantal}</td>
                          <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: verschil ? 700 : 400, color: verschil ? "#b9770e" : "inherit" }}>{r.getekend}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {legendaRijen(sd).some(r => r.aantal !== r.getekend) && (
                  <div style={{ fontSize: 11, color: "#b9770e", marginTop: 6 }}>Oranje: het aantal in de tekening wijkt af van wat bij E-/W-installaties is opgegeven.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,

    // 16: Extra foto's (optioneel, 4 stuks met omschrijving)
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}><p style={styles.sectionTitle}>Extra foto's</p></div>
        <div style={styles.sectionBody}>
          <div style={{ ...styles.hint, marginBottom: 12 }}>Optioneel: leg hier extra situaties vast die van belang zijn, met een korte omschrijving (bijv. meterkast, bestaande afvoer, scheur in de gevel).</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n}>
                <PhotoUpload label={`Extra foto ${n}`} value={data[`extraFoto${n}`]} onChange={v => set(`extraFoto${n}`, v)} />
                <input style={{ ...styles.input, marginTop: 8, width: "100%", boxSizing: "border-box" }} placeholder="Omschrijving (bijv. meterkast)"
                  value={data[`extraFoto${n}Omschrijving`]} onChange={e => set(`extraFoto${n}Omschrijving`, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // 17: Samenvatting
    <div>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Samenvatting — {sd.naam || "Klant"}</p>
        </div>
        <div style={styles.sectionBody}>
          {(() => {
            // Eindcontrole: wat ontbreekt er nog? Alleen een waarschuwing, je kunt
            // altijd versturen (zolang de validatie niet hard aanstaat).
            // Het installatieblok (pagina 16) meldt E en W samen; die splitsen we hier
            // weer uit naar hun eigen pagina (14 E-installaties, 15 W-installaties).
            const ontbreekt = PAGE_VALIDATORS.flatMap((v, i) => {
              const m = v ? v(data) : [];
              if (i !== 15) return [[i, m]];
              const deel = (prefix) => m.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
              return [[13, deel("E-installaties: ")], [14, deel("W-installaties: ")]];
            }).filter(([, m]) => m.length > 0);
            return ontbreekt.length === 0 ? (
              <div style={{ background: "#eaf6ec", border: "1.5px solid #2e7d32", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
                ✓ Alles is ingevuld.
              </div>
            ) : (
              <div style={{ background: "#fdf6e7", border: `1.5px solid ${GOLD}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Nog niet compleet — controleer vóór het versturen:</div>
                {ontbreekt.map(([i, m]) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4, flexWrap: "wrap" }}>
                    <button onClick={() => naarPagina(i)} style={{ ...styles.btnPrev, padding: "2px 10px", fontSize: 12 }}>{PAGES[i]} ›</button>
                    <span style={{ color: "#555" }}>{m.join(", ")}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {[
            ["Contact", 0, "opmerkingen", [["Projectnummer", sd.projectnummer], ["Naam", sd.naam], ["Aanhef", sd.geslacht], ["Datum", (sd.datum || "").split("-").reverse().join("-")], ["Ingemeten door", sd.ingemetenDoor], ["Gevonden via", sd.gevondenVia], ["Telefoon", sd.telefoon], ["E-mail", sd.mail], ["Adres", [sd.adres, [sd.postcode, sd.plaats].filter(Boolean).join(" ")].filter(Boolean).join(", ")]]],
            ["Maatvoering", 1, "", [["Hoogte", mmTekst(sd.hoogte)], ["Diepte buiten", mmTekst(sd.diepteBuiten)], ["Diepte binnen", mmTekst(sd.diepteBinnen)], ["Breedte buiten", mmTekst(sd.breedteBuiten)], ["Breedte binnen", mmTekst(sd.breedteBinnen)]]],
            ["Voorbereidingen", 3, "", [["Bereikbaarheid", (sd.bereikbaarheid || []).join(", ")], ["Rijplaten", sd.rijplaten], ["Bouwtekeningen", sd.bouwtekeningen], ["Vergunning", sd.vergunning], ["Doorbraak", mmTekst(sd.doorbraakMM)], ["Constructeur", sd.constructeur]]],
            ["Wandafwerking", 5, "", [["Binnenwand", sd.binnenwand], ["Stucwerk", sd.stucwerk]]],
            ["Gevelbekleding", 5, "gevelOpmerking", [["Steenstrips", sd.steenstrip], ["Type", sd.steenstripType], ["Code", sd.steenstripCode], ["Voegkleur", sd.steenstripVoegkleur], ["Boven het kozijn", sd.steenstripBovenKozijn], ["Composiet", sd.composiet === "Anders" ? sd.composietAnders : sd.composiet], ["Kerama type", sd.keramaType], ["Kerama kleur", sd.keramaKleur], ["Hout type", sd.houtType], ["Hout kleur", sd.houtKleur]]],
            ["Kozijn 1", 6, "k1Opmerking", [["Type", sd.k1Type], ["Opties", sd.k1Opties.join(", ")], ["Raamtype", sd.k1RaamType], ["Harmonica delen", sd.k1HarmonicaDelen], ["Harmonica richting", sd.k1HarmonicaRichting], ["Ventilatierooster", sd.k1Ventilatierooster], ["Materiaal", sd.k1Materiaal], ["RAL", sd.k1RAL], ["Glas", sd.k1Glas], ["Breedte", mmTekst(sd.k1Breedte)], ["Hoogte", mmTekst(sd.k1Hoogte)]]],
            ["Kozijn 2", 8, "k2Opmerking", [["Type", sd.k2Type], ["Opties", sd.k2Opties.join(", ")], ["Raamtype", sd.k2RaamType], ["Harmonica delen", sd.k2HarmonicaDelen], ["Harmonica richting", sd.k2HarmonicaRichting], ["Ventilatierooster", sd.k2Ventilatierooster], ["Materiaal", sd.k2Materiaal], ["RAL", sd.k2RAL], ["Glas", sd.k2Glas], ["Breedte", mmTekst(sd.k2Breedte)], ["Hoogte", mmTekst(sd.k2Hoogte)]]],
            ["Kozijn 3", 10, "k3Opmerking", [["Type", sd.k3Type], ["Opties", sd.k3Opties.join(", ")], ["Raamtype", sd.k3RaamType], ["Harmonica delen", sd.k3HarmonicaDelen], ["Harmonica richting", sd.k3HarmonicaRichting], ["Ventilatierooster", sd.k3Ventilatierooster], ["Materiaal", sd.k3Materiaal], ["RAL", sd.k3RAL], ["Glas", sd.k3Glas], ["Breedte", mmTekst(sd.k3Breedte)], ["Hoogte", mmTekst(sd.k3Hoogte)]]],
            ["Dak", 12, "dakOpmerking", [["Dakbedekking", sd.dakbedekking], ["Dakrand", sd.dakrandAfwerking], ["Dakrand RAL", sd.dakrandKleur], ["Overstek", sd.overstek === "Ja" ? ["Ja", mmTekst(sd.overstekMM), sd.overstekRAL && `RAL ${sd.overstekRAL}`].filter(Boolean).join(", ") : sd.overstek], ["Lichtstraat", sd.lichtstraat], ["Lichtstraat afmeting", (sd.lichtstraatLengteMM || sd.lichtstraatBreedteMM) ? `${sd.lichtstraatLengteMM} x ${sd.lichtstraatBreedteMM} MM` : ""], ["Lichtstraat kleur", sd.lichtstraatKleur], ["Lichtstraat delen glas", sd.lichtstraatDelenGlas]]],
            ["E-installaties", 13, "eOpmerking", [
              ["Uitvoering", sd.eUitvoering],
              ["Merk/Type", schakelmateriaalTekst(data)],
              ["Let op", sd.eUitvoering === E_UITVOERING_LEIDINGWERK ? E_GARANTIE_TEKST : ""],
              ["Stopcontacten", metAantal(sd.stopcontacten, { Enkel: sd.stopAantalEnkel, Dubbel: sd.stopAantalDubbel, Tripel: sd.stopAantalTripel, Anders: sd.stopAantalAnders })],
              ["Stopcontacten - Anders", sd.stopcontactenAnders],
              ["Verlichting", metAantal(sd.verlichting, { Spotjes: sd.verAantalSpotjes, Hanglamp: sd.verAantalHanglamp, Wandlampjes: sd.verAantalWandlampjes })],
              ["Verlichting Spotjes kleur", sd.verlichtingSpotjesKleur],
              ["Hanglamp ophangen", (sd.verlichting || []).includes("Hanglamp") ? (sd.hanglampOphangen ? "Ja (klant levert aan)" : "Nee") : ""],
              ["Wandlampjes ophangen", (sd.verlichting || []).includes("Wandlampjes") ? (sd.wandlampjesOphangen ? "Ja (klant levert aan)" : "Nee") : ""],
              ["Schakelaars", metAantal(sd.schakelaars, { Schakelaar: sd.schAantalSchakelaar, Dimmer: sd.schAantalDimmer, Sensor: sd.schAantalSensor })],
              ["Hotelschakeling", sd.hotelschakeling ? ["Dubbel", (sd.hotelLampen || []).join(", ")].filter(Boolean).join(" - ") : ""],
              ["Buiten verlichting", metAantal(sd.buitenVerlichting, { Spotjes: sd.buitenAantalSpotjes, Wandlamp: sd.buitenAantalWandlamp })],
              ["Buiten spotjes kleur", sd.buitenSpotjesKleur === "Kleur van overstek" ? `Kleur van overstek${sd.buitenSpotjesRAL ? ` (${sd.buitenSpotjesRAL})` : ""}` : sd.buitenSpotjesKleur],
              ["Wandlamp", sd.buitenWandlampType === "Anders" ? "Anders: klant levert zelf aan, AddOn monteert" : sd.buitenWandlampType],
              ["Buitenstopcontact", sd.wcd ? `Ja${sd.wcdAantal ? `, aantal ${sd.wcdAantal}` : ""} (Dubbel NIKO inbouw horizontaal zwart)` : ""],
              ["Airco", (sd.warmteKoude || []).includes("Airco") ? (sd.aircoUitvoering === "Airco" ? `Airco${sd.aircoVermogen ? ` ${sd.aircoVermogen}` : ""}` : sd.aircoUitvoering || "Ja") : ""],
            ]],
            ["W-installaties", 14, "wOpmerking", [
              ["HWA", sd.hwaMateriaal ? `${sd.hwaMateriaal}${sd.hwaAantal ? ` (${sd.hwaAantal}x)` : ""}` : ""],
              ["Bladvanger / vergaarbak", [sd.bladvanger && "Bladvanger", sd.vergaarbak && "Vergaarbak"].filter(Boolean).join(", ")],
              ["Vorstvrije buitenkraan", sd.buitenkraan],
              ["Vloerverwarming", sd.vloerverwarming === "Gehele woning" && sd.vloerM2 ? `${sd.vloerverwarming} (${sd.vloerM2} m²)` : sd.vloerverwarming],
              ["Verdeler", sd.vloerverwarming && sd.vloerverwarming !== "N.V.T." ? sd.verdeler : ""],
              ["Warmtebron", sd.vloerverwarming !== "N.V.T." && sd.verdeler === "Verdeler ophangen" ? (sd.warmtebron || []).join(", ") : ""],
            ]],
          ].filter(([title]) => !(title === "Kozijn 2" && !sd.k2Type) && !(title === "Kozijn 3" && !sd.k3Type))
           .map(([title, pagina, opmerkingVeld, rows]) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div onClick={() => naarPagina(pagina)} title={`Naar ${PAGES[pagina]}`}
                style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6, borderBottom: `1px solid ${GOLD}33`, paddingBottom: 4, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                <span>{title}</span><span style={{ fontWeight: 600, fontSize: 12 }}>Aanpassen ›</span>
              </div>
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#888", minWidth: 140 }}>{k}:</span>
                  <span style={{ color: BLACK, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {opmerkingVeld && heeftWaarde(sd[opmerkingVeld]) && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#888", minWidth: 140 }}>Opmerkingen:</span>
                  <span style={{ color: BLACK, fontWeight: 500, whiteSpace: "pre-wrap" }}>{sd[opmerkingVeld]}</span>
                </div>
              )}
            </div>
          ))}
          {SAMENVATTING_BEELDEN.some(([veld]) => sd[veld]) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, borderBottom: `1px solid ${GOLD}33`, paddingBottom: 4 }}>Foto's en tekeningen</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {SAMENVATTING_BEELDEN.filter(([veld]) => sd[veld]).map(([veld, standaardLabel, pagina]) => { const label = sd[`${veld}Omschrijving`] || standaardLabel; return (
                  <div key={veld} onClick={() => naarPagina(pagina)} style={{ cursor: "pointer" }} title={`Naar ${PAGES[pagina]}`}>
                    <img src={sd[veld]} alt={label} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0", display: "block", background: "white" }} />
                    <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{label}</div>
                  </div>
                ); })}
              </div>
            </div>
          )}
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
          {submitStatus.error && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: "#c0392b", fontSize: 13 }}>{submitStatus.error}</div>
              <div style={{ fontSize: 12, color: "#555", margin: "8px 0 6px" }}>Geen of slecht bereik? Het formulier blijft bewaard op dit apparaat. Je kunt het later opnieuw versturen, of nu een kopie downloaden:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button style={styles.btnPrev} onClick={downloadPdf}>📄 PDF downloaden</button>
                <button style={styles.btnPrev} onClick={downloadGegevens}>💾 Gegevens downloaden</button>
              </div>
            </div>
          )}
          {submitStatus.done && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: "#2e7d32", fontSize: 13 }}>Opgeslagen in SharePoint als versie V{submitStatus.versie}.</div>
              <button style={{ ...styles.btnNext, marginTop: 10 }} onClick={nieuwFormulier}>➕ Nieuw formulier</button>
            </div>
          )}
        </div>
      </div>
    </div>,
  ];

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <img src={logoUrl} alt="AddOn Aanbouw op Maat" style={styles.logoImg} />
        <div style={styles.pageTitle}>{PAGES[page]}</div>
        <div style={styles.progress}>
          {PAGES.map((naam, i) => (
            <div key={i} title={naam}
              onClick={() => { if (i <= verstePagina) { setFoutmeldingen([]); setPage(i); } }}
              style={{ padding: "6px 2px", margin: "-6px 0", cursor: i <= verstePagina ? "pointer" : "default" }}>
              <div style={styles.progressDot(i === page, i < page)} />
            </div>
          ))}
        </div>
      </div>
      <div style={styles.body}>
        {conceptAanbod && (
          <div style={{ background: "#fdf6e7", border: `1.5px solid ${GOLD}`, borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Er staat nog een niet-verstuurd formulier op dit apparaat</div>
            <div style={{ color: "#555", marginBottom: 10 }}>
              {conceptAanbod.data.projectnummer ? `Project ${conceptAanbod.data.projectnummer}` : "Zonder projectnummer"}
              {conceptAanbod.data.naam ? ` — ${conceptAanbod.data.naam}` : ""}
              {conceptAanbod.bewaardOp ? `, laatst bewaard op ${new Date(conceptAanbod.bewaardOp).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : ""}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={styles.btnNext} onClick={conceptHervatten}>Doorgaan met dit formulier</button>
              <button style={styles.btnPrev} onClick={conceptWeggooien}>Nieuw formulier beginnen</button>
            </div>
          </div>
        )}
        {foutmeldingen.length > 0 && (
          <div style={styles.foutBanner}>
            <div style={styles.foutBannerTitel}>Vul eerst het volgende in voor je verder kunt:</div>
            <div>{foutmeldingen.join(", ")}</div>
          </div>
        )}
        {INSTALLATIE_TABS.some(([i]) => i === page) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {INSTALLATIE_TABS.map(([i, label]) => (
              <button key={i} onClick={() => { setFoutmeldingen([]); setPage(i); }}
                style={{ ...styles.optionCard(i === page), padding: "8px 16px", fontSize: 13, fontWeight: 600, color: BLACK }}>
                {label}
              </button>
            ))}
          </div>
        )}
        {pages[page]}
      </div>
      <div style={styles.nav}>
        <button style={styles.btnPrev} onClick={() => { setFoutmeldingen([]); setPage(p => Math.max(0, p - 1)); }} disabled={page === 0}>
          ← Vorige
        </button>
        <span style={{ fontSize: 12, color: "#888", textAlign: "center", lineHeight: 1.4 }}>
          {page + 1} / {PAGES.length}
          {/* eslint-disable-next-line no-undef */}
          <span style={{ display: "block", fontSize: 9, color: "#bbb" }}>Versie {typeof __APP_VERSIE__ !== "undefined" ? __APP_VERSIE__ : "?"}</span>
        </span>
        {page < PAGES.length - 1 ? (
          <button
            style={styles.btnNext}
            onClick={() => {
              const validator = PAGE_VALIDATORS[page];
              const missend = (VALIDATIE_ACTIEF && validator) ? validator(data) : [];
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
        ) : <div style={{ width: 120 }} />}
      </div>
    </div>
  );
}
