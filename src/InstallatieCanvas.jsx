// Tekenvak voor de installatietekening (E + W).
//
// Werkt met twee lagen:
// - onderlaag ("basis"): wat met de pen getekend wordt (wanden e.d.), als afbeelding;
// - bovenlaag ("objecten"): geplaatste symbolen (met optionele letter A-E) en
//   maatlijnen (horizontaal of verticaal, met tekst). Die blijven los
//   aanklikbaar: letter kiezen, verplaatsen, verwijderen, tekst wijzigen.
// Bij elke wijziging wordt er één platte afbeelding (PNG) van gemaakt voor de
// PDF/SharePoint, plus de losse "staat" ({ basis, objecten }) zodat de tekening
// later weer bewerkbaar is. Posities worden opgeslagen als fractie (0..1) van
// de breedte/hoogte, zodat de tekening op elk schermformaat gelijk blijft.

import { useEffect, useRef, useState } from "react";
import { SYMBOLEN, tekenSymbool, symboolOpKey } from "./symbolen";

const GOLD = "#B69148";
const BLACK = "#1a1a1a";
const LETTERS = ["A", "B", "C", "D", "E"];
const SYM_GROOTTE = 34;
const RAAK_AFSTAND = 20; // px: binnen deze afstand "raak" je een symbool
const MAX_UNDO = 20;
const KLEUREN = ["#1a1a1a", "#B69148", "#e74c3c", "#2980b9"];

let teller = 0;
const nieuwId = () => `o${Date.now().toString(36)}${(teller++).toString(36)}`;

const knop = (actief) => ({ background: actief ? GOLD : "white", color: actief ? "white" : GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 });
const menuKnop = (actief) => ({ minWidth: 34, padding: "6px 8px", borderRadius: 6, border: `1.5px solid ${GOLD}`, background: actief ? GOLD : "white", color: actief ? "white" : BLACK, fontWeight: 700, fontSize: 13, cursor: "pointer" });

// Klein SVG-plaatje van een tekensymbool, voor de knoppen en de legenda.
export function SymboolIcoon({ symbool, grootte = 26, kleur = BLACK }) {
  return (
    <svg width={grootte} height={grootte} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      {symbool.paden.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={kleur} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {symbool.tekst && (
        <text x="20" y="21" textAnchor="middle" dominantBaseline="middle" fontSize={symbool.tekst.length > 1 ? 11 : 13} fontWeight="700" fill={kleur} fontFamily="sans-serif">{symbool.tekst}</text>
      )}
    </svg>
  );
}

// Afstand van punt p tot lijnstuk a-b.
function afstandTotLijn(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export default function InstallatieCanvas({ staat, fallbackAfbeelding, onChange, gridCols = 15, gridRows = 15, maxVh = 70 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const basisRef = useRef(null); // offscreen canvas met de pen-laag
  const maatRef = useRef({ w: 0, h: 0, dpr: 1 });
  const objRef = useRef([]);
  const historyRef = useRef([]);
  const interactieRef = useRef(null);
  const voorbeeldRef = useRef(null); // maatlijn die nu getrokken wordt
  const laatsteStaatRef = useRef(null);

  const [, setVersie] = useState(0);
  const verversUI = () => setVersie((v) => v + 1);
  const [tool, setTool] = useState("pen");
  const [kleur, setKleur] = useState(BLACK);
  const [menu, setMenu] = useState(null); // { soort: "sym" | "maat", id }
  const [maatTekst, setMaatTekst] = useState("");
  const [kanOngedaan, setKanOngedaan] = useState(false);
  const [sleep, setSleep] = useState(null); // { symbool, x, y } tijdens slepen vanuit de knoppen

  // --- tekenen ------------------------------------------------------------

  const tekenGrid = (ctx, w, h) => {
    ctx.save();
    ctx.strokeStyle = "#e5ddc8";
    ctx.lineWidth = 1;
    for (let i = 1; i < gridCols; i++) { const x = (w / gridCols) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let i = 1; i < gridRows; i++) { const y = (h / gridRows) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();
  };

  const tekenMaatlijn = (ctx, a, b, tekst, kleurLijn) => {
    const horizontaal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    ctx.save();
    ctx.strokeStyle = kleurLijn;
    ctx.fillStyle = kleurLijn;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    // eindstreepjes haaks op de lijn
    ctx.beginPath();
    [a, b].forEach((p) => {
      if (horizontaal) { ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6); }
      else { ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y); }
    });
    ctx.stroke();
    if (tekst) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const tw = ctx.measureText(tekst).width + 8;
      ctx.translate(mx, my);
      if (!horizontaal) ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "white";
      ctx.fillRect(-tw / 2, -19, tw, 15);
      ctx.fillStyle = kleurLijn;
      ctx.fillText(tekst, 0, -11);
    }
    ctx.restore();
  };

  // Tekent alles op een context. Met `selectie` ook de markering van het
  // geselecteerde object en de maatlijn in wording (alleen op het scherm).
  const tekenAlles = (ctx, selectie) => {
    const { w, h } = maatRef.current;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    tekenGrid(ctx, w, h);
    if (basisRef.current) ctx.drawImage(basisRef.current, 0, 0, w, h);
    objRef.current.forEach((o) => {
      const geselecteerd = selectie && menu && menu.id === o.id;
      if (o.type === "sym") {
        const s = symboolOpKey(o.key);
        if (!s) return;
        const x = o.x * w, y = o.y * h;
        if (geselecteerd) {
          ctx.save(); ctx.strokeStyle = GOLD; ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, 23, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        tekenSymbool(ctx, s, x, y, SYM_GROOTTE);
        if (o.letter) {
          ctx.save();
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.lineWidth = 4; ctx.strokeStyle = "white";
          ctx.strokeText(o.letter, x + 19, y - 16);
          ctx.fillStyle = "#c0392b";
          ctx.fillText(o.letter, x + 19, y - 16);
          ctx.restore();
        }
      } else if (o.type === "maat") {
        tekenMaatlijn(ctx, { x: o.x1 * w, y: o.y1 * h }, { x: o.x2 * w, y: o.y2 * h }, o.tekst, geselecteerd ? GOLD : "#2463a8");
      }
    });
    if (selectie && voorbeeldRef.current) {
      const { a, b } = voorbeeldRef.current;
      tekenMaatlijn(ctx, a, b, "", GOLD);
    }
  };

  const teken = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { dpr } = maatRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tekenAlles(ctx, true);
  };

  const exporteer = () => {
    const { w, h, dpr } = maatRef.current;
    if (!w || !onChange) return;
    const uit = document.createElement("canvas");
    uit.width = w * dpr; uit.height = h * dpr;
    const ctx = uit.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tekenAlles(ctx, false);
    const nieuweStaat = { basis: basisRef.current.toDataURL("image/png"), objecten: objRef.current.map((o) => ({ ...o })) };
    laatsteStaatRef.current = nieuweStaat;
    onChange(uit.toDataURL("image/png"), nieuweStaat);
  };

  // --- laden / opzetten ---------------------------------------------------

  const laadBasis = (src, klaar) => {
    const { w, h, dpr } = maatRef.current;
    const ctx = basisRef.current.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!src) { klaar && klaar(); return; }
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, w, h); klaar && klaar(); };
    img.src = src;
  };

  const laadStaat = (s) => {
    objRef.current = (s?.objecten || []).map((o) => ({ ...o }));
    laadBasis(s?.basis || null, () => { teken(); verversUI(); });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    maatRef.current = { w, h, dpr };
    canvas.width = w * dpr; canvas.height = h * dpr;
    const basis = document.createElement("canvas");
    basis.width = w * dpr; basis.height = h * dpr;
    basisRef.current = basis;
    if (staat) { laatsteStaatRef.current = staat; laadStaat(staat); }
    else if (fallbackAfbeelding) { objRef.current = []; laadBasis(fallbackAfbeelding, teken); }
    else teken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Staat die later binnenkomt (bijv. vorige versie uit SharePoint) alsnog laden.
  useEffect(() => {
    if (!basisRef.current || !staat || staat === laatsteStaatRef.current) return;
    laatsteStaatRef.current = staat;
    laadStaat(staat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staat]);

  useEffect(() => { teken(); }); // na elke render (bv. menu open/dicht) opnieuw tekenen

  // --- ongedaan maken -----------------------------------------------------

  const bewaarVoorUndo = () => {
    historyRef.current.push({ basis: basisRef.current.toDataURL("image/png"), objecten: objRef.current.map((o) => ({ ...o })) });
    if (historyRef.current.length > MAX_UNDO) historyRef.current.shift();
    setKanOngedaan(true);
  };

  const ongedaanMaken = () => {
    const vorige = historyRef.current.pop();
    setKanOngedaan(historyRef.current.length > 0);
    if (!vorige) return;
    setMenu(null);
    objRef.current = vorige.objecten;
    laadBasis(vorige.basis, () => { teken(); exporteer(); verversUI(); });
  };

  const wissen = () => {
    bewaarVoorUndo();
    setMenu(null);
    objRef.current = [];
    laadBasis(null, () => { teken(); exporteer(); });
  };

  // --- aanwijzen ----------------------------------------------------------

  const positie = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const { w, h } = maatRef.current;
    return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
  };

  const raakSymbool = (p) => {
    const { w, h } = maatRef.current;
    let beste = null, bestAfstand = RAAK_AFSTAND;
    objRef.current.forEach((o) => {
      if (o.type !== "sym") return;
      const d = Math.hypot(o.x * w - p.x, o.y * h - p.y);
      if (d <= bestAfstand) { beste = o; bestAfstand = d; }
    });
    return beste;
  };

  const raakMaatlijn = (p) => {
    const { w, h } = maatRef.current;
    return objRef.current.find((o) => o.type === "maat" &&
      afstandTotLijn(p, { x: o.x1 * w, y: o.y1 * h }, { x: o.x2 * w, y: o.y2 * h }) <= 12) || null;
  };

  const rechtTrekken = (a, p) => (Math.abs(p.x - a.x) >= Math.abs(p.y - a.y) ? { x: p.x, y: a.y } : { x: a.x, y: p.y });

  const openMaatMenu = (o) => { setMaatTekst(o.tekst || ""); setMenu({ soort: "maat", id: o.id }); };

  const pointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    const p = positie(e);
    setMenu(null);
    if (tool === "maat") {
      const s = raakSymbool(p);
      const { w, h } = maatRef.current;
      const start = s ? { x: s.x * w, y: s.y * h } : p;
      interactieRef.current = { soort: "maat", start };
      voorbeeldRef.current = { a: start, b: start };
      return;
    }
    if (tool === "pen") {
      const s = raakSymbool(p);
      if (s) { interactieRef.current = { soort: "sym", id: s.id, start: p, orig: { x: s.x, y: s.y }, bewogen: false }; return; }
      const m = raakMaatlijn(p);
      if (m) { interactieRef.current = { soort: "maatklik", id: m.id }; return; }
    }
    bewaarVoorUndo();
    interactieRef.current = { soort: "teken", laatste: p };
  };

  const pointerMove = (e) => {
    const i = interactieRef.current;
    if (!i) return;
    e.preventDefault();
    const p = positie(e);
    const { w, h, dpr } = maatRef.current;
    if (i.soort === "teken") {
      const ctx = basisRef.current.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = kleur;
      ctx.lineWidth = tool === "eraser" ? 20 : 2;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(i.laatste.x, i.laatste.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      i.laatste = p;
      teken();
    } else if (i.soort === "sym") {
      if (!i.bewogen && Math.hypot(p.x - i.start.x, p.y - i.start.y) > 6) { bewaarVoorUndo(); i.bewogen = true; }
      if (i.bewogen) {
        const o = objRef.current.find((x) => x.id === i.id);
        o.x = Math.min(1, Math.max(0, i.orig.x + (p.x - i.start.x) / w));
        o.y = Math.min(1, Math.max(0, i.orig.y + (p.y - i.start.y) / h));
        teken();
      }
    } else if (i.soort === "maat") {
      voorbeeldRef.current = { a: i.start, b: rechtTrekken(i.start, p) };
      teken();
    }
  };

  const pointerUp = () => {
    const i = interactieRef.current;
    interactieRef.current = null;
    if (!i) return;
    const { w, h } = maatRef.current;
    if (i.soort === "teken") exporteer();
    else if (i.soort === "sym") {
      if (i.bewogen) exporteer();
      else setMenu({ soort: "sym", id: i.id });
    } else if (i.soort === "maatklik") {
      const o = objRef.current.find((x) => x.id === i.id);
      if (o) openMaatMenu(o);
    } else if (i.soort === "maat") {
      const v = voorbeeldRef.current;
      voorbeeldRef.current = null;
      if (v && Math.hypot(v.b.x - v.a.x, v.b.y - v.a.y) > 12) {
        bewaarVoorUndo();
        const o = { id: nieuwId(), type: "maat", x1: v.a.x / w, y1: v.a.y / h, x2: v.b.x / w, y2: v.b.y / h, tekst: "" };
        objRef.current = [...objRef.current, o];
        exporteer();
        openMaatMenu(o);
      } else teken();
    }
  };

  // --- menu-acties --------------------------------------------------------

  const wijzigObject = (id, wijziging) => {
    bewaarVoorUndo();
    objRef.current = objRef.current.map((o) => (o.id === id ? { ...o, ...wijziging } : o));
    exporteer();
  };
  const verwijderObject = (id) => {
    bewaarVoorUndo();
    objRef.current = objRef.current.filter((o) => o.id !== id);
    setMenu(null);
    exporteer();
  };
  const maatOpslaan = () => {
    const o = objRef.current.find((x) => x.id === menu.id);
    if (o && (o.tekst || "") !== maatTekst.trim()) wijzigObject(menu.id, { tekst: maatTekst.trim() });
    setMenu(null);
  };

  // --- slepen vanuit de symboolknoppen ------------------------------------

  const startSleep = (symbool) => (e) => {
    e.preventDefault();
    setMenu(null);
    setSleep({ symbool, x: e.clientX, y: e.clientY });
    const verplaats = (ev) => setSleep({ symbool, x: ev.clientX, y: ev.clientY });
    const loslaten = (ev) => {
      window.removeEventListener("pointermove", verplaats);
      window.removeEventListener("pointerup", loslaten);
      setSleep(null);
      const r = canvasRef.current.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      bewaarVoorUndo();
      objRef.current = [...objRef.current, { id: nieuwId(), type: "sym", key: symbool.key, x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height, letter: "" }];
      exporteer();
      verversUI();
    };
    window.addEventListener("pointermove", verplaats);
    window.addEventListener("pointerup", loslaten);
  };

  // --- weergave -----------------------------------------------------------

  const menuObject = menu && objRef.current.find((o) => o.id === menu.id);
  let menuStijl = null;
  if (menuObject) {
    const fx = menuObject.type === "sym" ? menuObject.x : (menuObject.x1 + menuObject.x2) / 2;
    const fy = menuObject.type === "sym" ? menuObject.y : (menuObject.y1 + menuObject.y2) / 2;
    menuStijl = {
      position: "absolute", zIndex: 5, background: "white", border: `1.5px solid ${GOLD}`, borderRadius: 8,
      boxShadow: "0 4px 14px rgba(0,0,0,0.15)", padding: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
      left: `clamp(4px, calc(${fx * 100}% - 120px), calc(100% - 250px))`,
      ...(fy > 0.7 ? { bottom: `calc(${(1 - fy) * 100}% + 28px)` } : { top: `calc(${fy * 100}% + 28px)` }),
      width: 240,
    };
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {SYMBOLEN.map((s) => (
          <div key={s.key} onPointerDown={startSleep(s)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: `1px solid ${GOLD}55`, borderRadius: 8, background: "#fdfcf8", cursor: "grab", touchAction: "none", userSelect: "none" }}>
            <SymboolIcoon symbool={s} />
            <span style={{ fontSize: 11, color: "#666" }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: GOLD, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
        Sleep een symbool naar de tekening. Tik op een geplaatst symbool om er een letter (A–E) bij te zetten of het te verwijderen; sleep het om te verplaatsen.
        Met <b>Maatlijn</b> trek je (vanuit een symbool) een rechte lijn en vul je de maat in.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button style={knop(tool === "pen")} onClick={() => setTool("pen")}>✏️ Pen</button>
        <button style={knop(tool === "eraser")} onClick={() => setTool("eraser")}>⬜ Gum</button>
        <button style={knop(tool === "maat")} onClick={() => setTool("maat")}>📏 Maatlijn</button>
        {KLEUREN.map((c) => (
          <div key={c} onClick={() => { setTool("pen"); setKleur(c); }}
            style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: kleur === c && tool === "pen" ? "3px solid #333" : "2px solid #eee" }} />
        ))}
        <button style={{ ...knop(false), opacity: kanOngedaan ? 1 : 0.4, cursor: kanOngedaan ? "pointer" : "default" }} onClick={ongedaanMaken} disabled={!kanOngedaan}>↩️ Ongedaan maken</button>
        <button style={knop(false)} onClick={wissen}>🗑️ Wissen</button>
      </div>
      <div ref={wrapRef} style={{ position: "relative", width: `min(100%, ${maxVh}vh)`, aspectRatio: "1 / 1", margin: "0 auto" }}>
        <canvas ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block", border: `2px solid ${GOLD}`, borderRadius: 8, touchAction: "none", cursor: tool === "maat" ? "crosshair" : "default", boxSizing: "border-box", background: "white" }}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
        {menuObject && menuObject.type === "sym" && (
          <div style={menuStijl}>
            <span style={{ fontSize: 12, color: "#666", width: "100%" }}>{symboolOpKey(menuObject.key)?.label} — letter:</span>
            {LETTERS.map((l) => (
              <button key={l} style={menuKnop(menuObject.letter === l)} onClick={() => { wijzigObject(menuObject.id, { letter: l }); setMenu(null); }}>{l}</button>
            ))}
            <button style={menuKnop(!menuObject.letter)} onClick={() => { wijzigObject(menuObject.id, { letter: "" }); setMenu(null); }}>–</button>
            <button style={{ ...menuKnop(false), color: "#c0392b", borderColor: "#c0392b" }} onClick={() => verwijderObject(menuObject.id)}>Verwijderen</button>
            <button style={menuKnop(false)} onClick={() => setMenu(null)}>✕</button>
          </div>
        )}
        {menuObject && menuObject.type === "maat" && (
          <div style={menuStijl}>
            <span style={{ fontSize: 12, color: "#666", width: "100%" }}>Maat / tekst bij de lijn:</span>
            <input autoFocus value={maatTekst} onChange={(e) => setMaatTekst(e.target.value)} placeholder="bijv. 1200 mm"
              onKeyDown={(e) => { if (e.key === "Enter") maatOpslaan(); }}
              style={{ flex: 1, minWidth: 0, padding: "6px 8px", border: "1.5px solid #ddd", borderRadius: 6, fontSize: 13 }} />
            <button style={menuKnop(true)} onClick={maatOpslaan}>OK</button>
            <button style={{ ...menuKnop(false), color: "#c0392b", borderColor: "#c0392b" }} onClick={() => verwijderObject(menuObject.id)}>Verwijderen</button>
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: GOLD, fontStyle: "italic", marginTop: 6, textAlign: "center" }}>Elk vakje = 1 x 1 meter (grid van {gridCols} x {gridRows} m)</div>
      {sleep && (
        <div style={{ position: "fixed", left: sleep.x, top: sleep.y, transform: "translate(-50%, -50%)", pointerEvents: "none", background: "#ffffffcc", borderRadius: 6, zIndex: 9999 }}>
          <SymboolIcoon symbool={sleep.symbool} grootte={34} kleur={GOLD} />
        </div>
      )}
    </div>
  );
}
