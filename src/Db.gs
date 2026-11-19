/**
 * OxoPedia · Acceso a Google Sheets.
 * Lectura memorizada dentro de cada ejecución; escrituras protegidas con bloqueo desde la capa de servicios.
 */
const Db = (function () {
  let _ss = null;
  let memo = {};

  function libro_() {
    if (!_ss) _ss = SpreadsheetApp.openById(sheetId_());
    return _ss;
  }

  function hoja_(tabla) {
    const sh = libro_().getSheetByName(tabla);
    if (!sh) throw new Error('Falta la hoja «' + tabla + '». Ejecuta instalar() desde el editor de Apps Script.');
    return sh;
  }

  function aObj_(cols, fila) {
    const o = {};
    for (let i = 0; i < cols.length; i++) o[cols[i]] = fila[i] === null || fila[i] === undefined ? '' : String(fila[i]);
    return o;
  }

  function aFila_(cols, obj) {
    return cols.map(function (c) { return obj[c] === null || obj[c] === undefined ? '' : String(obj[c]); });
  }

  /** Todas las filas de una hoja como objetos (copias; se pueden modificar sin riesgo). */
  function leer(tabla) {
    if (!memo[tabla]) {
      const cols = ESQUEMA[tabla];
      const sh = hoja_(tabla);
      const n = sh.getLastRow();
      memo[tabla] = n < 2 ? [] : sh.getRange(2, 1, n - 1, cols.length).getValues()
        .filter(function (f) { return f[0] !== ''; })
        .map(function (f) { return aObj_(cols, f); });
    }
    return memo[tabla].map(function (o) { return Object.assign({}, o); });
  }

  function invalidar(tabla) {
    if (tabla) delete memo[tabla]; else memo = {};
  }

  function insertar(tabla, obj) {
    const cols = ESQUEMA[tabla];
    const sh = hoja_(tabla);
    const fila = sh.getLastRow() + 1;
    const rg = sh.getRange(fila, 1, 1, cols.length);
    rg.setNumberFormat('@');
    rg.setValues([aFila_(cols, obj)]);
    invalidar(tabla);
    return obj;
  }

  /** Actualiza campos de la fila cuya primera columna vale `clave`. */
  function actualizar(tabla, clave, parche) {
    const cols = ESQUEMA[tabla];
    const sh = hoja_(tabla);
    const n = sh.getLastRow();
    if (n < 2) throw new Error('Registro no encontrado en ' + tabla);
    const claves = sh.getRange(2, 1, n - 1, 1).getValues();
    for (let i = 0; i < claves.length; i++) {
      if (String(claves[i][0]) === String(clave)) {
        const rg = sh.getRange(i + 2, 1, 1, cols.length);
        const actual = aObj_(cols, rg.getValues()[0]);
        const nuevo = Object.assign(actual, parche);
        rg.setNumberFormat('@');
        rg.setValues([aFila_(cols, nuevo)]);
        invalidar(tabla);
        return nuevo;
      }
    }
    throw new Error('Registro «' + clave + '» no encontrado en ' + tabla);
  }

  /** Elimina las filas que cumplan `borrar(obj)` y agrega `nuevas` (lista de objetos). */
  function reemplazar(tabla, borrar, nuevas) {
    const cols = ESQUEMA[tabla];
    const sh = hoja_(tabla);
    const n = sh.getLastRow();
    const conservar = [];
    if (n > 1) {
      sh.getRange(2, 1, n - 1, cols.length).getValues().forEach(function (f) {
        if (f[0] === '') return;
        if (!borrar(aObj_(cols, f))) conservar.push(f.map(function (v) { return String(v); }));
      });
    }
    const todo = conservar.concat((nuevas || []).map(function (o) { return aFila_(cols, o); }));
    if (todo.length) {
      const rg = sh.getRange(2, 1, todo.length, cols.length);
      rg.setNumberFormat('@');
      rg.setValues(todo);
    }
    const sobran = (n - 1) - todo.length;
    if (sobran > 0) sh.getRange(todo.length + 2, 1, sobran, cols.length).clearContent();
    invalidar(tabla);
  }

  return { leer: leer, insertar: insertar, actualizar: actualizar, reemplazar: reemplazar, invalidar: invalidar, libro: libro_, hoja: hoja_ };
})();
