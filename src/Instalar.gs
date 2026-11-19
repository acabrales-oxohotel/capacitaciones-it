/**
 * OxoPedia · Inicialización.
 * Ejecuta instalar() UNA vez desde el editor de Apps Script (es seguro repetirla: no duplica nada).
 * Luego ejecuta diagnostico() para comprobar Sheets, Drive y GitHub.
 */

function instalar() {
  const ss = Db.libro();
  Object.keys(ESQUEMA).forEach(function (t) { prepararHoja_(ss, t); });
  quitarHojaVacia_(ss);
  sembrarConfig_();
  asegurarCarpetas_();
  asegurarAdmins_();
  sembrarEstructura();
  invalidarCatalogo_();
  console.log('✔ OxoPedia instalada. Siguiente paso: ejecuta diagnostico(), luego sembrarLote1() y despliega la app web.');
}

function prepararHoja_(ss, tabla) {
  const cols = ESQUEMA[tabla];
  let sh = ss.getSheetByName(tabla);
  if (!sh) sh = ss.insertSheet(tabla);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, cols.length).setNumberFormat('@').setValues([cols]);
  } else {
    const actual = sh.getRange(1, 1, 1, cols.length).getValues()[0].map(String);
    if (actual.join('|') !== cols.join('|')) {
      throw new Error('La hoja «' + tabla + '» ya existe con otras columnas. Renómbrala o bórrala y vuelve a ejecutar instalar().');
    }
  }
  if (sh.getMaxColumns() < cols.length) sh.insertColumnsAfter(sh.getMaxColumns(), cols.length - sh.getMaxColumns());
  sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
  sh.getRange(1, 1, 1, cols.length).setBackground('#49677a').setFontColor('#ffffff').setFontWeight('bold');
  sh.setFrozenRows(1);
  cols.forEach(function (c, i) { sh.setColumnWidth(i + 1, ANCHOS_[c] || 130); });
  if (tabla === 'Secciones' || tabla === 'Articulos') sh.setTabColor('#c19528');
}

function quitarHojaVacia_(ss) {
  ss.getSheets().forEach(function (sh) {
    if (ESQUEMA[sh.getName()]) return;
    if (/^(Hoja|Sheet) ?\d+$/i.test(sh.getName()) && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
}

function sembrarConfig_() {
  Db.invalidar('Configuracion');
  const existentes = Db.leer('Configuracion').map(function (c) { return c.clave; });
  CONFIG_INICIAL.forEach(function (c) {
    if (existentes.indexOf(c[0]) < 0) Db.insertar('Configuracion', { clave: c[0], valor: c[1], descripcion: c[2] });
  });
}

function asegurarCarpetas_() {
  subcarpeta_('adjuntos');
  subcarpeta_('_versiones');
}

function asegurarAdmins_() {
  const correos = [];
  const efectivo = Session.getEffectiveUser().getEmail();
  if (efectivo) correos.push(efectivo);
  prop_('ADMIN_CORREO').split(/[\s,;]+/).forEach(function (c) { if (c) correos.push(c); });
  Db.invalidar('Usuarios');
  correos.forEach(function (c) {
    const email = c.toLowerCase();
    const u = Db.leer('Usuarios').find(function (x) { return x.email === email; });
    if (!u) Db.insertar('Usuarios', { email: email, nombre: nombreDeCorreo_(email), rol: ROLES.ADMIN, activo: 'TRUE', ultimo_acceso: '', creado_en: ahora_(), creado_por: 'instalar' });
    else if (u.rol !== ROLES.ADMIN) Db.actualizar('Usuarios', email, { rol: ROLES.ADMIN, activo: 'TRUE' });
  });
}

/** Comprueba que todo está listo. Revisa el registro de ejecución. */
function diagnostico() {
  const ok = function (m) { console.log('✔ ' + m); };
  const mal = function (m) { console.warn('✖ ' + m); };
  try {
    const ss = Db.libro();
    const faltan = Object.keys(ESQUEMA).filter(function (t) { return !ss.getSheetByName(t); });
    faltan.length ? mal('Faltan hojas: ' + faltan.join(', ') + ' → ejecuta instalar()') : ok('Hojas de la base de datos: completas (' + ss.getName() + ')');
  } catch (e) { mal('No se pudo abrir la hoja de cálculo: ' + e.message); }
  try { ok('Carpeta de Drive: ' + carpetaApp_().getName()); } catch (e) { mal('Carpeta de Drive: ' + e.message); }
  try {
    const admins = Db.leer('Usuarios').filter(function (u) { return u.rol === ROLES.ADMIN; }).map(function (u) { return u.email; });
    admins.length ? ok('Administradores: ' + admins.join(', ')) : mal('No hay administradores → ejecuta instalar()');
  } catch (e) { mal('Usuarios: ' + e.message); }
  try {
    const g = gh_();
    const r = ghPeticion_(g, 'get', '', null);
    if (r.getResponseCode() === 200) {
      const info = jsonSeguro_(r.getContentText(), {});
      ok('GitHub: repositorio ' + g.repo + ' accesible (' + (info.private ? 'PRIVADO → usa imagenes_modo = proxy' : 'PÚBLICO → puedes usar imagenes_modo = cdn') + ')');
      if (info.permissions && info.permissions.push === false) mal('El token no tiene permiso de escritura (Contents: Read and write).');
    } else mal('GitHub respondió ' + r.getResponseCode() + ': revisa GITHUB_TOKEN y GITHUB_REPO');
  } catch (e) { mal('GitHub: ' + e.message); }
}
