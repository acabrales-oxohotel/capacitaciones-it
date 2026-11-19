/** OxoPedia · Artículos y bloques */

// ── Bloques: conversión entre árbol (editor) y filas planas (Sheets) ──

function aplanarBloques_(lista) {
  const filas = [];
  let orden = 0;
  const ahora = ahora_();
  function rec(arr, padre, nivel) {
    (arr || []).forEach(function (b) {
      const tipo = String(b.tipo || '');
      if (TIPOS_BLOQUE.indexOf(tipo) < 0) throw err_('Tipo de bloque no válido: ' + tipo);
      if (nivel > 0 && tipo === 'paso') throw err_('Un paso no puede ir dentro de otro paso.');
      const cfg = (b.config && typeof b.config === 'object') ? b.config : jsonSeguro_(b.config, {});
      const cfgTxt = JSON.stringify(cfg || {});
      if (cfgTxt.length > 8000) throw err_('Un bloque tiene demasiada configuración.');
      const contenido = String(b.contenido || '');
      if (contenido.length > 40000) throw err_('Un bloque supera los 40.000 caracteres: divídelo en dos.');
      const id = id_('b');
      filas.push({ id: id, padre_id: padre, orden: String(++orden), tipo: tipo, contenido: contenido,
        config_json: cfgTxt === '{}' ? '' : cfgTxt, actualizado_en: ahora });
      if (tipo === 'paso' && nivel === 0) rec(b.hijos, id, 1);
    });
  }
  rec(lista, '', 0);
  if (filas.length > 600) throw err_('El artículo supera los 600 bloques.');
  return filas;
}

function anidarBloques_(filas) {
  const ord = filas.slice().sort(porOrden_);
  const mapa = {};
  const raiz = [];
  ord.forEach(function (f) {
    mapa[f.id] = { id: f.id, tipo: f.tipo, contenido: f.contenido, config: jsonSeguro_(f.config_json, {}), hijos: [] };
  });
  ord.forEach(function (f) {
    if (f.padre_id && mapa[f.padre_id]) mapa[f.padre_id].hijos.push(mapa[f.id]); else raiz.push(mapa[f.id]);
  });
  return raiz;
}

function normalizarEtiquetas_(v) {
  const lista = Array.isArray(v) ? v : String(v || '').split(/[,;]+/);
  const vistas = {};
  return lista.map(function (t) { return String(t).trim().replace(/\s+/g, ' '); })
    .filter(function (t) { if (!t || vistas[t.toLowerCase()]) return false; vistas[t.toLowerCase()] = 1; return true; })
    .slice(0, 12).join(', ');
}

function construirIndice_(titulo, resumen, etiquetas, filas) {
  const partes = [titulo, resumen, etiquetas];
  filas.forEach(function (f) {
    const cfg = jsonSeguro_(f.config_json, {});
    if (f.tipo === 'separador') return;
    if (f.tipo === 'codigo') partes.push(f.contenido);
    else partes.push(textoPlano_(f.contenido));
    ['titulo', 'descripcion', 'alt', 'pie', 'nombre'].forEach(function (k) { if (cfg[k]) partes.push(textoPlano_(cfg[k])); });
  });
  return partes.join(' ').replace(/\s+/g, ' ').trim().slice(0, 30000);
}

// ── Lectura ──

function accArticulo(p) {
  const arts = Db.leer('Articulos').filter(function (a) { return a.activo !== 'FALSE'; });
  const a = arts.find(function (x) { return (p.id && x.id === p.id) || (p.slug && x.slug === p.slug); });
  if (!a) throw err_('No encontramos ese artículo. Puede haber sido movido o eliminado.', 'no_existe');
  const filas = Db.leer('Bloques').filter(function (b) { return b.articulo_id === a.id; });
  return { articulo: resumenArticulo_(a), bloques: anidarBloques_(filas) };
}

// ── Escritura ──

/**
 * Crea o actualiza un artículo con todos sus bloques.
 * opc.semilla = true: carga inicial (no sube la versión ni genera copia en Drive).
 */
function guardarArticulo_(meta, bloques, nota, u, opc) {
  opc = opc || {};
  const titulo = String(meta.titulo || '').trim();
  if (!titulo) throw err_('El artículo necesita un título.');
  const filasB = aplanarBloques_(bloques);

  return conBloqueo_(function () {
    Db.invalidar();
    const secciones = Db.leer('Secciones');
    const sec = secciones.find(function (s) { return s.id === meta.seccion_id && s.activa !== 'FALSE'; });
    if (!sec) throw err_('Elige una sección válida.');
    const todos = Db.leer('Articulos');
    let art = meta.id ? todos.find(function (a) { return a.id === meta.id; }) : null;
    if (meta.id && !art) throw err_('El artículo no existe.');

    const ahora = ahora_();
    const etiquetas = normalizarEtiquetas_(meta.etiquetas);
    const resumen = String(meta.resumen || '').trim().slice(0, 500);
    const indice = construirIndice_(titulo, resumen, etiquetas, filasB);
    const minutos = Math.max(1, Math.round(indice.split(' ').length / 180));
    const estado = ESTADOS.indexOf(meta.estado) >= 0 ? meta.estado : (art ? art.estado : 'Borrador');
    const responsable = String(meta.responsable_email || (art ? art.responsable_email : (opc.semilla ? '' : u.email)) || '').trim().toLowerCase();
    let accion, version, estadoAnt = '';

    if (!art) {
      const enSeccion = todos.filter(function (a) { return a.seccion_id === sec.id; });
      art = {
        id: id_('art'), seccion_id: sec.id, slug: slugUnico_(slug_(meta.slug || titulo), todos.map(function (a) { return a.slug; })),
        titulo: titulo, resumen: resumen, etiquetas: etiquetas, responsable_email: responsable, estado: estado,
        fecha_creacion: ahora, fecha_revision: estado === 'Validado' ? ahora : '', validado_por: estado === 'Validado' ? u.email : '',
        version: '1', orden: String(enSeccion.reduce(function (m, a) { return Math.max(m, num_(a.orden, 0)); }, 0) + 1),
        destacado: 'FALSE', tiempo_lectura_min: String(minutos), indice_busqueda: indice, activo: 'TRUE',
        actualizado_en: ahora, actualizado_por: u.email
      };
      Db.insertar('Articulos', art);
      accion = opc.semilla ? 'semilla' : 'crear';
      version = 1;
    } else {
      // Edición simultánea: si alguien guardó (o cambió el estado) después de que esta persona abrió el artículo, se avisa antes de pisarlo.
      if (!opc.semilla && !opc.forzar && opc.baseActualizado && String(art.actualizado_en) !== String(opc.baseActualizado)) {
        throw err_('CONFLICTO|' + nombreDeCorreo_(art.actualizado_por || 'alguien') + '|' + art.actualizado_en + '|' + num_(art.version, 1));
      }
      estadoAnt = art.estado;
      version = opc.semilla ? num_(art.version, 1) : num_(art.version, 1) + 1;
      const parche = {
        seccion_id: sec.id, titulo: titulo, resumen: resumen, etiquetas: etiquetas, responsable_email: responsable,
        estado: estado, version: String(version), tiempo_lectura_min: String(minutos), indice_busqueda: indice,
        actualizado_en: ahora, actualizado_por: u.email
      };
      if (estado === 'Validado' && estadoAnt !== 'Validado') { parche.fecha_revision = ahora; parche.validado_por = u.email; }
      if (estado !== 'Validado') parche.validado_por = '';
      if (meta.seccion_id && meta.seccion_id !== art.seccion_id) {
        const destino = todos.filter(function (a) { return a.seccion_id === sec.id; });
        parche.orden = String(destino.reduce(function (m, a) { return Math.max(m, num_(a.orden, 0)); }, 0) + 1);
      }
      Db.actualizar('Articulos', art.id, parche);
      accion = opc.semilla ? 'semilla' : (opc.accion || 'editar');
    }

    // Bloques
    filasB.forEach(function (f) { f.articulo_id = art.id; });
    Db.reemplazar('Bloques', function (b) { return b.articulo_id === art.id; }, filasB);

    // Recursos de tipo enlace (los archivos subidos se registran al subirlos)
    const recursos = [];
    filasB.forEach(function (f) {
      if (f.tipo !== 'enlace') return;
      const c = jsonSeguro_(f.config_json, {});
      if (!c.url) return;
      const esDrive = /^https:\/\/(drive|docs)\.google\.com\//.test(c.url);
      const esCarpeta = /\/folders\//.test(c.url);
      recursos.push({ id: id_('rec'), articulo_id: art.id, bloque_id: f.id,
        tipo: esDrive ? (esCarpeta ? 'drive_carpeta' : 'drive_archivo') : 'enlace',
        titulo: c.titulo || c.url, url: c.url, drive_id: '', mime: '', tamano_kb: '', subido_por: u.email, subido_en: ahora, activo: 'TRUE' });
    });
    Db.reemplazar('Recursos', function (r) { return r.articulo_id === art.id && ['enlace', 'drive_carpeta', 'drive_archivo'].indexOf(r.tipo) >= 0; }, recursos);

    // Historial + copia de la versión en Drive
    let snapId = '';
    if (!opc.semilla) {
      try { snapId = guardarSnapshot_(art.slug, version, { titulo: titulo, resumen: resumen, etiquetas: etiquetas,
        seccion_id: sec.id, responsable_email: responsable, estado: estado }, anidarBloques_(filasB)); }
      catch (e) { console.error('No se pudo guardar la copia de la versión: ' + e); }
    }
    registrarHistorial_(art.id, opc.semilla ? 'semilla' : u.email, accion, nota || (accion === 'crear' ? 'Artículo creado' : ''), version, estadoAnt, estado, snapId);
    invalidarCatalogo_();
    return { id: art.id, slug: art.slug, version: version, estado: estado };
  });
}

function accGuardarArticulo(p, u) {
  if (!p.articulo) throw err_('Faltan los datos del artículo.');
  return guardarArticulo_(p.articulo, p.bloques || [], String(p.nota || '').slice(0, 300), u,
    { baseActualizado: p.baseActualizado || '', forzar: p.forzar === true });
}

function accCambiarEstado(p, u) {
  if (ESTADOS.indexOf(p.estado) < 0) throw err_('Estado no válido.');
  return conBloqueo_(function () {
    Db.invalidar();
    const a = Db.leer('Articulos').find(function (x) { return x.id === p.id; });
    if (!a) throw err_('El artículo no existe.');
    if (a.estado === p.estado) return { ok: true };
    const ahora = ahora_();
    const parche = { estado: p.estado, actualizado_en: ahora, actualizado_por: u.email };
    if (p.estado === 'Validado') { parche.fecha_revision = ahora; parche.validado_por = u.email; } else { parche.validado_por = ''; }
    Db.actualizar('Articulos', a.id, parche);
    registrarHistorial_(a.id, u.email, 'estado', String(p.nota || '').slice(0, 300), num_(a.version, 1), a.estado, p.estado, '');
    invalidarCatalogo_();
    return { ok: true };
  });
}

function accMarcarRevisado(p, u) {
  return conBloqueo_(function () {
    Db.invalidar();
    const a = Db.leer('Articulos').find(function (x) { return x.id === p.id; });
    if (!a) throw err_('El artículo no existe.');
    const ahora = ahora_();
    Db.actualizar('Articulos', a.id, { fecha_revision: ahora, actualizado_en: ahora, actualizado_por: u.email });
    registrarHistorial_(a.id, u.email, 'revisar', 'Revisado: el contenido sigue vigente', num_(a.version, 1), a.estado, a.estado, '');
    invalidarCatalogo_();
    return { ok: true };
  });
}

function accEliminarArticulo(p, u) {
  return conBloqueo_(function () {
    Db.invalidar();
    const a = Db.leer('Articulos').find(function (x) { return x.id === p.id; });
    if (!a) throw err_('El artículo no existe.');
    Db.actualizar('Articulos', a.id, { activo: 'FALSE', actualizado_en: ahora_(), actualizado_por: u.email });
    registrarHistorial_(a.id, u.email, 'eliminar', 'Artículo retirado (se conserva en la hoja con activo = FALSE)', num_(a.version, 1), a.estado, a.estado, '');
    invalidarCatalogo_();
    return { ok: true };
  });
}

function accOrdenarArticulos(p) {
  return conBloqueo_(function () {
    (p.ids || []).forEach(function (id, i) { Db.actualizar('Articulos', id, { orden: String(i + 1) }); });
    invalidarCatalogo_();
    return { ok: true };
  });
}
