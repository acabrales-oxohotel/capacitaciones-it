/** OxoPedia · Utilidades generales */

/** Error «esperado»: su mensaje se muestra tal cual al usuario. */
function err_(mensaje, codigo) {
  const e = new Error(mensaje);
  e.esperado = true;
  e.codigo = codigo || 'error';
  return e;
}

function ahora_() {
  return Utilities.formatDate(new Date(), APP.ZONA, 'yyyy-MM-dd HH:mm:ss');
}

function id_(prefijo) {
  return prefijo + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
}

function slug_(texto) {
  const s = String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return s || 'sin-titulo';
}

function slugUnico_(base, existentes) {
  let s = base, i = 2;
  while (existentes.indexOf(s) >= 0) { s = base + '-' + i; i++; }
  return s;
}

function num_(v, def) {
  const n = Number(v);
  return isFinite(n) && String(v) !== '' ? n : (def === undefined ? 0 : def);
}

function jsonSeguro_(txt, def) {
  try { return txt ? JSON.parse(txt) : def; } catch (e) { return def; }
}

function porOrden_(a, b) {
  return num_(a.orden, 9999) - num_(b.orden, 9999);
}

function conBloqueo_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/** Texto plano (sin marcas de formato) para el buscador. */
function textoPlano_(md) {
  return String(md || '').replace(/\[COMPLETAR:[^\]]*\]/g, ' ').replace(/[`*_#>|\[\]\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Caché en trozos (CacheService limita cada valor a 100 KB) ──
const TROZO_ = 30000;

function cacheGet_(clave) {
  const c = CacheService.getScriptCache();
  const n = Number(c.get(clave + ':n'));
  if (!n) return null;
  const claves = [];
  for (let i = 0; i < n; i++) claves.push(clave + ':' + i);
  const partes = c.getAll(claves);
  let s = '';
  for (let i = 0; i < n; i++) {
    const p = partes[clave + ':' + i];
    if (p === undefined || p === null) return null;
    s += p;
  }
  return jsonSeguro_(s, null);
}

function cachePut_(clave, obj, segundos) {
  const s = JSON.stringify(obj);
  const mapa = {};
  let n = 0;
  for (let i = 0; i < s.length; i += TROZO_) mapa[clave + ':' + (n++)] = s.slice(i, i + TROZO_);
  mapa[clave + ':n'] = String(n);
  try { CacheService.getScriptCache().putAll(mapa, segundos || 1800); } catch (e) { console.warn('Caché no disponible: ' + e); }
}

function cacheDel_(clave) {
  const c = CacheService.getScriptCache();
  const n = Number(c.get(clave + ':n')) || 0;
  const claves = [clave + ':n'];
  for (let i = 0; i < n; i++) claves.push(clave + ':' + i);
  c.removeAll(claves);
}

function invalidarCatalogo_() {
  cacheDel_('catalogo');
  cacheDel_('indice');
}
