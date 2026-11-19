/** OxoPedia · Administración: usuarios y configuración */

function accUsuarios() {
  return Db.leer('Usuarios').sort(function (a, b) { return a.email < b.email ? -1 : 1; });
}

function accGuardarUsuario(p, u) {
  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw err_('Escribe un correo válido.');
  const dominio = String(config_('dominio') || '').toLowerCase();
  if (dominio && !email.endsWith('@' + dominio)) throw err_('El correo debe ser @' + dominio + '.');
  const rol = p.rol === ROLES.ADMIN ? ROLES.ADMIN : ROLES.LECTOR;
  const activo = p.activo === false || p.activo === 'FALSE' ? 'FALSE' : 'TRUE';

  return conBloqueo_(function () {
    Db.invalidar('Usuarios');
    const todos = Db.leer('Usuarios');
    const actual = todos.find(function (x) { return x.email === email; });
    const quedanAdmins = todos.filter(function (x) { return x.rol === ROLES.ADMIN && x.activo !== 'FALSE' && x.email !== email; }).length;
    if ((rol !== ROLES.ADMIN || activo === 'FALSE') && quedanAdmins === 0) throw err_('Debe quedar al menos un administrador activo.');
    if (actual) {
      Db.actualizar('Usuarios', email, { nombre: String(p.nombre || actual.nombre).trim(), rol: rol, activo: activo });
    } else {
      Db.insertar('Usuarios', { email: email, nombre: String(p.nombre || nombreDeCorreo_(email)).trim(), rol: rol, activo: activo,
        ultimo_acceso: '', creado_en: ahora_(), creado_por: u.email });
    }
    return { ok: true };
  });
}

function accConfiguracion() {
  return Db.leer('Configuracion');
}

function accGuardarConfig(p) {
  const claves = CONFIG_INICIAL.map(function (c) { return c[0]; });
  if (claves.indexOf(p.clave) < 0) throw err_('Parámetro desconocido.');
  const valor = String(p.valor === undefined || p.valor === null ? '' : p.valor).trim();
  if (p.clave === 'imagenes_modo' && ['proxy', 'cdn'].indexOf(valor) < 0) throw err_('El modo de imágenes debe ser «proxy» o «cdn».');
  if (p.clave === 'auto_registro' && ['SI', 'NO'].indexOf(valor) < 0) throw err_('Usa SI o NO.');
  if (['dias_para_revisar', 'max_upload_mb'].indexOf(p.clave) >= 0 && !(num_(valor, -1) > 0)) throw err_('Debe ser un número mayor que cero.');
  return conBloqueo_(function () {
    Db.invalidar('Configuracion');
    const existe = Db.leer('Configuracion').some(function (c) { return c.clave === p.clave; });
    if (existe) Db.actualizar('Configuracion', p.clave, { valor: valor });
    else Db.insertar('Configuracion', { clave: p.clave, valor: valor, descripcion: (CONFIG_INICIAL.find(function (c) { return c[0] === p.clave; }) || [])[2] || '' });
    return { ok: true };
  });
}
