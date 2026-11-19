/** OxoPedia · Secciones (crear, editar, ordenar, retirar) */

function accGuardarSeccion(p, u) {
  const nombre = String(p.nombre || '').trim();
  if (!nombre) throw err_('La sección necesita un nombre.');
  const color = /^#[0-9a-fA-F]{6}$/.test(p.color || '') ? p.color : '#49677a';
  const icono = /^ph-[a-z0-9-]+$/.test(p.icono || '') ? p.icono : 'ph-folder';

  return conBloqueo_(function () {
    Db.invalidar();
    const todas = Db.leer('Secciones');
    let padre = String(p.padre_id || '');
    if (padre) {
      const pa = todas.find(function (s) { return s.id === padre; });
      if (!pa || pa.padre_id) throw err_('La sección superior no es válida (solo se permite un nivel de subsecciones).');
      if (p.id && padre === p.id) throw err_('Una sección no puede ser su propia superior.');
    }
    if (p.id) {
      const actual = todas.find(function (s) { return s.id === p.id; });
      if (!actual) throw err_('La sección no existe.');
      if (padre && todas.some(function (s) { return s.padre_id === p.id; })) throw err_('Esta sección ya tiene subsecciones: no puede ser subsección de otra.');
      Db.actualizar('Secciones', p.id, { nombre: nombre, descripcion: String(p.descripcion || '').trim(), icono: icono, color: color, padre_id: padre });
    } else {
      Db.insertar('Secciones', {
        id: id_('sec'), slug: slugUnico_(slug_(nombre), todas.map(function (s) { return s.slug; })), nombre: nombre,
        descripcion: String(p.descripcion || '').trim(), icono: icono, color: color,
        orden: String(todas.reduce(function (m, s) { return Math.max(m, num_(s.orden, 0)); }, 0) + 1),
        padre_id: padre, activa: 'TRUE', creado_en: ahora_(), creado_por: u.email
      });
    }
    invalidarCatalogo_();
    return { ok: true };
  });
}

function accEliminarSeccion(p) {
  return conBloqueo_(function () {
    Db.invalidar();
    const sec = Db.leer('Secciones').find(function (s) { return s.id === p.id; });
    if (!sec) throw err_('La sección no existe.');
    const hijos = Db.leer('Secciones').filter(function (s) { return s.padre_id === p.id && s.activa !== 'FALSE'; });
    const arts = Db.leer('Articulos').filter(function (a) { return (a.seccion_id === p.id) && a.activo !== 'FALSE'; });
    if (hijos.length || arts.length) throw err_('Primero mueve o elimina sus artículos y subsecciones.');
    Db.actualizar('Secciones', p.id, { activa: 'FALSE' });
    invalidarCatalogo_();
    return { ok: true };
  });
}

function accOrdenarSecciones(p) {
  const ids = p.ids || [];
  return conBloqueo_(function () {
    ids.forEach(function (id, i) { Db.actualizar('Secciones', id, { orden: String(i + 1) }); });
    invalidarCatalogo_();
    return { ok: true };
  });
}
