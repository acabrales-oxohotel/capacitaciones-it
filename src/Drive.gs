/** OxoPedia · Drive: adjuntos descargables y copias de versión (las imágenes van a GitHub, ver GitHub.gs) */

function carpetaApp_() {
  try { return DriveApp.getFolderById(carpetaId_()); }
  catch (e) { throw err_('No se pudo abrir la carpeta de Drive de OxoPedia. Revisa CARPETA_ID y los permisos.', 'drive'); }
}

function subcarpeta_(nombre) {
  const base = carpetaApp_();
  const it = base.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : base.createFolder(nombre);
}

function validarArchivo_(p, maxMb) {
  if (!p.base64 || !p.nombre) throw err_('No se recibió el archivo.');
  const bytes = Math.floor(String(p.base64).length * 0.75);
  if (bytes > maxMb * 1024 * 1024) throw err_('El archivo supera el máximo permitido (' + maxMb + ' MB).');
  return bytes;
}

function nombreSeguro_(nombre) {
  const s = String(nombre || 'archivo').replace(/[\\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
  return s.slice(0, 120) || 'archivo';
}

function accSubirAdjunto(p, u) {
  const maxMb = num_(config_('max_upload_mb'), 10);
  const bytes = validarArchivo_(p, maxMb);
  const nombre = nombreSeguro_(p.nombre);
  const blob = Utilities.newBlob(Utilities.base64Decode(p.base64), p.mime || 'application/octet-stream', nombre);
  const archivo = subcarpeta_('adjuntos').createFile(blob);
  const rec = { id: id_('rec'), articulo_id: p.articulo_id || '', bloque_id: '', tipo: 'archivo', titulo: nombre, url: '',
    drive_id: archivo.getId(), mime: blob.getContentType(), tamano_kb: String(Math.ceil(bytes / 1024)),
    subido_por: u.email, subido_en: ahora_(), activo: 'TRUE' };
  conBloqueo_(function () { Db.insertar('Recursos', rec); });
  return { recurso_id: rec.id, nombre: nombre, tamano_kb: Number(rec.tamano_kb), mime: rec.mime };
}

function accDescargarAdjunto(p) {
  const r = Db.leer('Recursos').find(function (x) { return x.id === p.id && x.tipo === 'archivo' && x.activo !== 'FALSE'; });
  if (!r) throw err_('El archivo ya no está disponible.');
  const blob = DriveApp.getFileById(r.drive_id).getBlob();
  return { nombre: r.titulo, mime: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) };
}
