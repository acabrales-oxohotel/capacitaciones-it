/**
 * OxoPedia · Imágenes en GitHub.
 * Las capturas se guardan como archivos en la carpeta media/ del repositorio (commit vía API de GitHub).
 *  - Modo «proxy» (por defecto, repositorio privado): la app las lee con el token y las entrega al navegador.
 *  - Modo «cdn» (repositorio público): el navegador las pide directo a jsDelivr (más rápido, pero públicas).
 * Requiere la propiedad del script GITHUB_TOKEN (token fine-grained con permiso «Contents: Read and write» sobre el repo).
 */

const MIME_IMG_ = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif' };
const EXT_MIME_ = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif' };

function gh_() {
  const token = prop_('GITHUB_TOKEN');
  if (!token) throw err_('Falta configurar GITHUB_TOKEN en las propiedades del script (ver README, sección «Imágenes en GitHub»).', 'sin_token');
  return { token: token, repo: prop_('GITHUB_REPO') || DEFECTOS.GITHUB_REPO, rama: prop_('GITHUB_RAMA') || DEFECTOS.GITHUB_RAMA };
}

function ghPeticion_(g, metodo, ruta, cuerpo, aceptar) {
  const r = UrlFetchApp.fetch('https://api.github.com/repos/' + g.repo + ruta, {
    method: metodo,
    headers: { Authorization: 'Bearer ' + g.token, Accept: aceptar || 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    contentType: 'application/json',
    payload: cuerpo ? JSON.stringify(cuerpo) : undefined,
    muteHttpExceptions: true
  });
  return r;
}

function rutaImagenValida_(ruta) {
  return /^media\/[A-Za-z0-9_\-\/.]+$/.test(ruta || '') && ruta.indexOf('..') < 0;
}

function accSubirImagen(p, u) {
  const maxMb = num_(config_('max_upload_mb'), 10);
  validarArchivo_(p, maxMb);
  const ext = MIME_IMG_[p.mime];
  if (!ext) throw err_('Formato de imagen no permitido. Usa PNG, JPG, WebP o GIF.');
  const g = gh_();
  const base = slug_(String(p.nombre || 'captura').replace(/\.[^.]+$/, '')).slice(0, 40);
  const carpeta = /^[A-Za-z0-9_-]+$/.test(p.articulo_id || '') ? p.articulo_id : 'general';
  const ruta = 'media/' + carpeta + '/' + Utilities.formatDate(new Date(), APP.ZONA, 'yyyyMMdd-HHmmss') + '-' + base + '.' + ext;

  const r = ghPeticion_(g, 'put', '/contents/' + ruta, {
    message: 'OxoPedia: imagen ' + base + ' (' + u.nombre + ')', content: p.base64, branch: g.rama
  });
  const codigo = r.getResponseCode();
  if (codigo !== 200 && codigo !== 201) {
    const detalle = (jsonSeguro_(r.getContentText(), {}).message) || ('HTTP ' + codigo);
    console.error('GitHub subir imagen: ' + codigo + ' ' + r.getContentText());
    throw err_('GitHub rechazó la imagen: ' + detalle + (codigo === 401 || codigo === 403 || codigo === 404 ? ' (revisa GITHUB_TOKEN y sus permisos sobre el repositorio)' : ''), 'github');
  }
  const rec = { id: id_('rec'), articulo_id: p.articulo_id || '', bloque_id: '', tipo: 'imagen', titulo: base, url: ruta,
    drive_id: '', mime: p.mime, tamano_kb: String(Math.ceil(String(p.base64).length * 0.75 / 1024)),
    subido_por: u.email, subido_en: ahora_(), activo: 'TRUE' };
  conBloqueo_(function () { Db.insertar('Recursos', rec); });
  return { ruta: ruta, recurso_id: rec.id };
}

/** Modo «proxy»: lee la imagen del repositorio y la devuelve en base64 (con caché cuando es pequeña). */
function accImagen(p) {
  const ruta = String(p.ruta || '');
  if (!rutaImagenValida_(ruta)) throw err_('Ruta de imagen no válida.');
  const cache = CacheService.getScriptCache();
  const hit = cache.get('img:' + ruta);
  if (hit) return jsonSeguro_(hit, null);

  const g = gh_();
  const r = ghPeticion_(g, 'get', '/contents/' + ruta + '?ref=' + encodeURIComponent(g.rama), null, 'application/vnd.github.raw+json');
  if (r.getResponseCode() !== 200) throw err_('No se pudo cargar la imagen (' + r.getResponseCode() + ').', 'imagen');
  const ext = ruta.split('.').pop().toLowerCase();
  const res = { mime: EXT_MIME_[ext] || 'image/png', base64: Utilities.base64Encode(r.getContent()) };
  if (res.base64.length < 90000) { try { cache.put('img:' + ruta, JSON.stringify(res), 21600); } catch (e) { /* sin caché */ } }
  return res;
}
