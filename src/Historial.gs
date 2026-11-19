/** OxoPedia · Historial de cambios y copias de versión (JSON en Drive) */

function registrarHistorial_(articuloId, usuario, accion, resumen, version, estadoAnt, estadoNuevo, snapshotId) {
  Db.insertar('Historial', {
    id: id_('his'), fecha: ahora_(), articulo_id: articuloId, usuario: usuario, accion: accion, resumen: resumen || '',
    version: String(version || ''), estado_anterior: estadoAnt || '', estado_nuevo: estadoNuevo || '', snapshot_file_id: snapshotId || ''
  });
}

function guardarSnapshot_(slug, version, meta, bloquesAnidados) {
  const carpeta = subcarpeta_('_versiones');
  const datos = { articulo: meta, version: version, bloques: bloquesAnidados };
  return carpeta.createFile(slug + '_v' + version + '.json', JSON.stringify(datos), MimeType.PLAIN_TEXT).getId();
}

function accHistorial(p) {
  return Db.leer('Historial').filter(function (h) { return h.articulo_id === p.articulo_id; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).slice(0, 100)
    .map(function (h) {
      return { id: h.id, fecha: h.fecha, usuario: h.usuario, accion: h.accion, resumen: h.resumen, version: num_(h.version, 1),
        estado_anterior: h.estado_anterior, estado_nuevo: h.estado_nuevo, tiene_copia: !!h.snapshot_file_id };
    });
}

function leerSnapshot_(historialId) {
  const h = Db.leer('Historial').find(function (x) { return x.id === historialId; });
  if (!h || !h.snapshot_file_id) throw err_('Esa entrada del historial no tiene copia guardada.');
  try {
    return { h: h, datos: JSON.parse(DriveApp.getFileById(h.snapshot_file_id).getBlob().getDataAsString()) };
  } catch (e) {
    throw err_('No se pudo leer la copia de esa versión (¿fue borrada de Drive?).');
  }
}

function accVerVersion(p) {
  const s = leerSnapshot_(p.id);
  return { articulo: s.datos.articulo, bloques: s.datos.bloques, version: s.datos.version };
}

function accRestaurarVersion(p, u) {
  const s = leerSnapshot_(p.id);
  const meta = Object.assign({}, s.datos.articulo, { id: s.h.articulo_id });
  return guardarArticulo_(meta, s.datos.bloques, 'Restaurada desde la versión ' + s.datos.version, u, { accion: 'restaurar' });
}
