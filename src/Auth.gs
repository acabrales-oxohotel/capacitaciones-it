/**
 * OxoPedia · Identidad y roles.
 * La app se ejecuta como quien la despliega (acceso: solo el dominio). La identidad de quien consulta
 * se toma de Session.getActiveUser() y se cruza con la hoja «Usuarios».
 */

function nombreDeCorreo_(email) {
  return String(email).split('@')[0].split(/[._-]+/).map(function (p) {
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : '';
  }).join(' ');
}

/** Devuelve el usuario en sesión (lo registra como Lector si es la primera vez). */
function usuario_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) throw err_('No pudimos identificar tu cuenta. Abre OxoPedia con tu correo corporativo.', 'sin_sesion');
  const dominio = String(config_('dominio') || '').toLowerCase();
  if (dominio && !email.endsWith('@' + dominio)) throw err_('Esta plataforma es solo para cuentas @' + dominio + '.', 'dominio');

  let u = Db.leer('Usuarios').find(function (x) { return x.email === email; });
  if (!u) {
    if (config_('auto_registro') !== 'SI') throw err_('Tu cuenta aún no tiene acceso. Solicítalo al área de TI.', 'sin_acceso');
    u = { email: email, nombre: nombreDeCorreo_(email), rol: ROLES.LECTOR, activo: 'TRUE',
      ultimo_acceso: ahora_(), creado_en: ahora_(), creado_por: 'auto' };
    conBloqueo_(function () { Db.insertar('Usuarios', u); });
    return u;
  }
  if (u.activo === 'FALSE') throw err_('Tu acceso está desactivado. Habla con el área de TI.', 'inactivo');
  const hoy = ahora_().slice(0, 10);
  if (String(u.ultimo_acceso).slice(0, 10) !== hoy) {
    u.ultimo_acceso = ahora_();
    try { Db.actualizar('Usuarios', email, { ultimo_acceso: u.ultimo_acceso }); } catch (e) { /* no crítico */ }
  }
  return u;
}

function esAdmin_(u) { return u && u.rol === ROLES.ADMIN; }

function exigirAdmin_(u) {
  if (!esAdmin_(u)) throw err_('Solo los administradores pueden hacer esto.', 'permiso');
}
