// Automatisch bewaren van het formulier als "concept" op het apparaat zelf
// (IndexedDB, want foto's en tekeningen passen niet in localStorage).
// Zo gaat er niets verloren bij een per ongeluk ververste pagina, een
// afgesloten tabblad of een iPad die de pagina opnieuw laadt.

const DB_NAAM = "addon-inmeet";
const STORE = "concept";
const SLEUTEL = "huidig";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAAM, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function metStore(modus, actie) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modus);
    const req = actie(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req && req.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// { data, page, bewaardOp } of null
export async function conceptLaden() {
  try { return (await metStore("readonly", (s) => s.get(SLEUTEL))) || null; } catch { return null; }
}

export async function conceptBewaren(data, page) {
  try { await metStore("readwrite", (s) => s.put({ data, page, bewaardOp: new Date().toISOString() }, SLEUTEL)); } catch { /* opslag vol of niet beschikbaar: niet fataal */ }
}

export async function conceptWissen() {
  try { await metStore("readwrite", (s) => s.delete(SLEUTEL)); } catch { /* niet fataal */ }
}
