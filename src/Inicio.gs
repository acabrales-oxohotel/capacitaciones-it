/** OxoPedia · Arranque de la app (catálogo de secciones y artículos) y buscador */

function resumenArticulo_(a) {
  return {
    id: a.id, seccion_id: a.seccion_id, slug: a.slug, titulo: a.titulo, resumen: a.resumen,
    etiquetas: a.etiquetas, responsable_email: a.responsable_email, estado: a.estado,
    fecha_creacion: a.fecha_creacion, fecha_revision: a.fecha_revision, validado_por: a.validado_por,
    version: num_(a.version, 1), orden: num_(a.orden, 9999), destacado: a.destacado === 'TRUE',
    tiempo_lectura_min: num_(a.tiempo_lectura_min, 1), actualizado_en: a.actualizado_en, actualizado_por: a.actualizado_por
  };
}

function resumenSeccion_(s) {
  return { id: s.id, slug: s.slug, nombre: s.nombre, descripcion: s.descripcion, icono: s.icono,
    color: s.color, orden: num_(s.orden, 9999), padre_id: s.padre_id };
}

function catalogo_() {
  let c = cacheGet_('catalogo');
  if (c) return c;
  c = {
    secciones: Db.leer('Secciones').filter(function (s) { return s.activa !== 'FALSE'; }).sort(porOrden_).map(resumenSeccion_),
    articulos: Db.leer('Articulos').filter(function (a) { return a.activo !== 'FALSE'; }).map(resumenArticulo_)
  };
  cachePut_('catalogo', c, 1800);
  return c;
}

function accArranque(p, u) {
  const c = catalogo_();
  const repo = prop_('GITHUB_REPO') || DEFECTOS.GITHUB_REPO;
  const rama = prop_('GITHUB_RAMA') || DEFECTOS.GITHUB_RAMA;
  let urlApp = '';
  try { urlApp = ScriptApp.getService().getUrl(); } catch (e) { /* sin URL */ }
  return {
    usuario: { email: u.email, nombre: u.nombre, rol: u.rol },
    config: {
      nombre_app: config_('nombre_app') || APP.NOMBRE,
      logo_url: config_('logo_url'),
      dias_para_revisar: num_(config_('dias_para_revisar'), 180),
      max_upload_mb: num_(config_('max_upload_mb'), 10),
      imagenes_modo: config_('imagenes_modo') === 'cdn' ? 'cdn' : 'proxy',
      cdn_base: 'https://cdn.jsdelivr.net/gh/' + repo + '@' + rama + '/',
      url_app: urlApp,
      version: APP.VERSION
    },
    secciones: c.secciones,
    articulos: c.articulos
  };
}

/** Texto indexado de cada artículo para el buscador (se filtra en el navegador). */
function accIndice() {
  let idx = cacheGet_('indice');
  if (idx) return idx;
  idx = Db.leer('Articulos').filter(function (a) { return a.activo !== 'FALSE'; })
    .map(function (a) { return { id: a.id, t: a.indice_busqueda }; });
  cachePut_('indice', idx, 1800);
  return idx;
}
