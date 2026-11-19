/**
 * OxoPedia · Punto de entrada.
 *  - doGet  → sirve la aplicación (acepta ?a=slug-del-articulo o ?s=slug-de-la-seccion para enlaces directos).
 *  - api()  → única función que llama el frontend; valida sesión y rol en cada llamada.
 */

function doGet(e) {
  const p = (e && e.parameter) || {};
  const t = HtmlService.createTemplateFromFile('Index');
  t.version = APP.VERSION;
  t.rutaInicial = p.a ? '#/a/' + encodeURIComponent(p.a) : (p.s ? '#/s/' + encodeURIComponent(p.s) : '');
  const salida = t.evaluate()
    .setTitle(APP.NOMBRE + ' · Conocimiento de TI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  // Favicon (pestaña del navegador): URL pública con el icono. Se puede cambiar con la propiedad de script FAVICON_URL.
  try { salida.setFaviconUrl(prop_('FAVICON_URL') || DEFECTOS.FAVICON_URL); } catch (err) { /* sin favicon */ }
  return salida;
}

function include_(nombre) {
  return HtmlService.createHtmlOutputFromFile(nombre).getContent();
}

/** Tabla de acciones. Las funciones se resuelven al llamarlas (los archivos se cargan en cualquier orden). */
const ACCIONES = {
  arranque:           { rol: 'lector', f: function (p, u) { return accArranque(p, u); } },
  indice:             { rol: 'lector', f: function (p, u) { return accIndice(p, u); } },
  articulo:           { rol: 'lector', f: function (p, u) { return accArticulo(p, u); } },
  historial:          { rol: 'lector', f: function (p, u) { return accHistorial(p, u); } },
  imagen:             { rol: 'lector', f: function (p, u) { return accImagen(p, u); } },
  descargarAdjunto:   { rol: 'lector', f: function (p, u) { return accDescargarAdjunto(p, u); } },

  guardarArticulo:    { rol: 'admin', f: function (p, u) { return accGuardarArticulo(p, u); } },
  cambiarEstado:      { rol: 'admin', f: function (p, u) { return accCambiarEstado(p, u); } },
  marcarRevisado:     { rol: 'admin', f: function (p, u) { return accMarcarRevisado(p, u); } },
  eliminarArticulo:   { rol: 'admin', f: function (p, u) { return accEliminarArticulo(p, u); } },
  ordenarArticulos:   { rol: 'admin', f: function (p, u) { return accOrdenarArticulos(p, u); } },
  verVersion:         { rol: 'admin', f: function (p, u) { return accVerVersion(p, u); } },
  restaurarVersion:   { rol: 'admin', f: function (p, u) { return accRestaurarVersion(p, u); } },
  guardarSeccion:     { rol: 'admin', f: function (p, u) { return accGuardarSeccion(p, u); } },
  eliminarSeccion:    { rol: 'admin', f: function (p, u) { return accEliminarSeccion(p, u); } },
  ordenarSecciones:   { rol: 'admin', f: function (p, u) { return accOrdenarSecciones(p, u); } },
  subirImagen:        { rol: 'admin', f: function (p, u) { return accSubirImagen(p, u); } },
  subirAdjunto:       { rol: 'admin', f: function (p, u) { return accSubirAdjunto(p, u); } },
  usuarios:           { rol: 'admin', f: function (p, u) { return accUsuarios(p, u); } },
  guardarUsuario:     { rol: 'admin', f: function (p, u) { return accGuardarUsuario(p, u); } },
  configuracion:      { rol: 'admin', f: function (p, u) { return accConfiguracion(p, u); } },
  guardarConfig:      { rol: 'admin', f: function (p, u) { return accGuardarConfig(p, u); } }
};

function api(accion, payload) {
  try {
    const a = ACCIONES[accion];
    if (!a) throw err_('Acción desconocida.', 'accion');
    const u = usuario_();
    if (a.rol === 'admin') exigirAdmin_(u);
    return { ok: true, data: a.f(payload || {}, u) };
  } catch (e) {
    if (e && e.esperado) return { ok: false, error: e.message, codigo: e.codigo };
    const cod = Utilities.getUuid().slice(0, 6);
    console.error('[' + cod + '] ' + accion + ': ' + (e && e.stack ? e.stack : e));
    return { ok: false, error: 'Algo salió mal (código ' + cod + '). Avisa al área de TI indicando este código.', codigo: 'interno' };
  }
}
