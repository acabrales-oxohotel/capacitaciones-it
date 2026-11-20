/**
 * OxoPedia · Mejora de redacción y estructura del artículo del biométrico de la oficina corporativa.
 * Uso: ejecutar UNA VEZ mejorarArticuloBiometrico() desde el editor de Apps Script.
 *  - Reescribe el texto en un tono formal y claro, y lo divide en secciones.
 *  - Conserva las 9 capturas ya subidas (se buscan por su ruta en el artículo actual).
 *  - Se guarda como una versión nueva: el texto anterior queda en el Historial.
 *  - No incluye datos personales de empleados ni claves de administración.
 */

const ID_ARTICULO_BIOMETRICO_ = 'art7266444b';

function mejorarArticuloBiometrico() {
  const art = Db.leer('Articulos').find(function (a) { return a.id === ID_ARTICULO_BIOMETRICO_; });
  if (!art) throw new Error('No se encontró el artículo del biométrico (' + ID_ARTICULO_BIOMETRICO_ + ').');

  const imagenes = [];
  (function recorrer(lista) {
    (lista || []).forEach(function (b) { if (b.tipo === 'imagen' && b.config && b.config.ruta) imagenes.push(b.config); recorrer(b.hijos); });
  })(anidarBloques_(Db.leer('Bloques').filter(function (b) { return b.articulo_id === art.id; })));

  const img = function (clave, alt, pie) {
    const c = imagenes.find(function (x) { return String(x.ruta).indexOf(clave) >= 0; });
    if (!c) throw new Error('No se encontró la imagen «' + clave + '» en el artículo. Revise que no se haya eliminado.');
    return { tipo: 'imagen', contenido: '', config: { ruta: c.ruta, recurso_id: c.recurso_id || '', alt: alt, pie: pie } };
  };

  const bloques = [
    B.texto('El **biométrico** de la entrada de la oficina corporativa controla el acceso mediante **reconocimiento facial**. Cada persona autorizada debe estar registrada en el equipo con un identificador, un nombre, un nivel de privilegios y la lectura de su rostro. Este instructivo explica, paso a paso, cómo **registrar un usuario nuevo** directamente desde la pantalla del dispositivo.'),
    B.alerta('advertencia', 'El rostro es un **dato personal sensible**. Registre únicamente a las personas autorizadas por la administración, informe a la persona para qué se usa su información y no comparta capturas de pantalla donde aparezcan datos de empleados.'),

    B.titulo('Antes de comenzar', 2),
    B.checklist([
      'La persona a registrar fue **autorizada** para el acceso y se encuentra presente frente al equipo.',
      'Se conoce su **número de identificación** (normalmente, la cédula) y su **nombre completo**.',
      'Se definió el **nivel de privilegios** que tendrá: Usuario normal o Administrador.',
      'La persona puede retirar gorra, tapabocas o cualquier accesorio que cubra el rostro.'
    ]),

    B.titulo('1. Ingresar al menú de usuarios', 2),
    B.paso('Con el biométrico en reposo se muestran la **hora** y la **fecha**. En la parte inferior hay dos íconos pequeños: toque el de la **derecha**, que tiene forma de tres líneas horizontales (**≡**), para abrir el menú del equipo.', [
      img('zk-paso1-inicio', 'Pantalla de inicio del biométrico con la hora, la fecha y el ícono del menú', 'Pantalla de inicio: el ícono del menú (≡) está en la parte inferior derecha.')
    ]),
    B.paso('En el **menú principal** se muestran varios íconos de colores, cada uno correspondiente a una opción. Para este procedimiento solo se necesita la primera, **Usuarios** (la figura de una persona de color azul). Tóquela.', [
      img('zk-paso2-menu-principal', 'Menú principal del biométrico con la opción Usuarios señalada', 'Menú principal: seleccione «Usuarios».')
    ]),
    B.paso('En la lista de opciones de usuarios, seleccione la primera: **Nuevo usuario**. Con ella se indica al equipo que se va a registrar a una persona que aún no existe en el sistema.', [
      img('zk-paso3-usuarios', 'Menú de usuarios con la opción Nuevo usuario señalada', 'Menú de usuarios: seleccione «Nuevo usuario».')
    ]),

    B.titulo('2. Registrar los datos del usuario', 2),
    B.paso('Se abre un formulario con los datos de la persona. Para completar cada campo, toque la fila correspondiente. Los campos que se utilizan son:', [
      img('zk-paso4-nuevo-usuario', 'Formulario de nuevo usuario con los campos ID de usuario, Nombre, Privilegios y Rostro', 'Formulario de nuevo usuario.')
    ]),
    B.texto('- **ID de usuario:** número que identifica a la persona.\n- **Nombre:** nombre de la persona.\n- **Privilegios de usuario:** tipo de acceso que tendrá en el equipo.\n- **Rostro:** registro de la cara de la persona.'),
    B.paso('**ID de usuario.** Toque la fila y escriba el número de identificación de la persona, que normalmente es su cédula, en el teclado numérico que aparece. Verifique en la parte superior de la pantalla que el número quede correcto. Si se equivoca, toque la flecha con una **X** para borrar. Cuando esté bien, toque el botón verde **OK**.', [
      img('zk-paso5-id-usuario', 'Teclado numérico para escribir el ID de usuario', 'Teclado numérico: ingreso del ID de usuario.')
    ]),
    B.paso('**Nombre.** Toque la fila, escriba el **nombre completo** de la persona con el teclado de letras que aparece y toque el botón verde **OK**.', [
      img('zk-paso6-nombre', 'Teclado de letras para escribir el nombre del usuario', 'Teclado de letras: ingreso del nombre.')
    ]),
    B.paso('**Privilegios de usuario.** Seleccione una de las dos opciones disponibles:', [
      img('zk-paso7-privilegios', 'Pantalla de selección de privilegios con las opciones Usuario normal y Administrador', 'Selección del nivel de privilegios.')
    ]),
    B.tabla([
      ['Opción', 'Cuándo usarla'],
      ['Usuario normal', 'Para el personal en general. Solo permite registrar la entrada y la salida. Es la opción que se utiliza en casi todos los casos.'],
      ['Administrador', 'Solo para quien deba gestionar el equipo: permite ingresar al menú y agregar o eliminar usuarios. Asígnela únicamente a quien tenga esa responsabilidad.']
    ]),

    B.titulo('3. Registrar el rostro', 2),
    B.paso('Este es el paso más importante: el biométrico debe «aprender» el rostro de la persona. Toque la fila **Rostro** y pídale que siga estas indicaciones:', [
      img('zk-paso8-registrar-rostro', 'Pantalla de registro del rostro con el marco de la cámara', 'Registro del rostro frente a la cámara.')
    ]),
    B.texto('- Colocarse **de frente** al equipo, mirando a la cámara.\n- Mantener el **rostro completo dentro del marco** de la pantalla, sin gorra, tapabocas ni otro elemento que lo cubra.\n- Permanecer **sin moverse** mientras el equipo realiza la lectura. Mientras no la detecta, la pantalla muestra «No se detecta el rostro»; es un comportamiento normal.\n- Esperar a que el mensaje desaparezca: indica que el rostro fue reconocido y el registro se guardó.'),

    B.titulo('4. Verificar el registro', 2),
    B.paso('Regrese al menú **Usuarios** y abra la lista de **todos los usuarios**. Confirme que la persona aparece con el nombre y el identificador correctos.', [
      img('zk-paso9-todos-los-usuarios', 'Listado de todos los usuarios registrados en el biométrico', 'Listado de usuarios: la persona registrada debe aparecer aquí.')
    ]),
    B.paso('Como prueba final, pida a la persona que se ubique frente al biométrico para verificar que la reconozca.'),

    B.titulo('Solución de problemas', 2),
    B.desplegable('El equipo indica «No se detecta el rostro» y no avanza', 'Verifique que la persona esté de frente, con el rostro completo dentro del marco y sin accesorios que lo cubran. Revise también que haya buena iluminación y que no se mueva durante la lectura.'),
    B.desplegable('Escribí mal el ID o el nombre', 'En el teclado, toque la flecha con una **X** para borrar y vuelva a escribir antes de confirmar con **OK**. Si ya se guardó, ingrese nuevamente a la fila correspondiente en el formulario del usuario y corríjalo.'),
    B.desplegable('No aparece el menú de usuarios', 'Es posible que el equipo requiera privilegios de administrador para ingresar al menú. Solicite el apoyo de un administrador del biométrico [COMPLETAR: contacto].')
  ];

  const meta = {
    id: art.id, seccion_id: art.seccion_id,
    titulo: 'Registro de usuarios en el biométrico de la entrada de la oficina corporativa',
    resumen: 'Instructivo para registrar a una persona nueva en el biométrico facial de la oficina corporativa: ID, nombre, privilegios y rostro.',
    etiquetas: 'biométrico, reconocimiento facial, registro de usuarios, acceso, oficina corporativa',
    responsable_email: art.responsable_email, estado: art.estado
  };
  const usuario = { email: Session.getActiveUser().getEmail() || 'sistema', nombre: 'Sistema' };
  const r = guardarArticulo_(meta, bloques, 'Redacción formal y clara; contenido dividido en secciones (se conservan las imágenes)', usuario, { forzar: true, accion: 'editar' });
  Logger.log('Artículo actualizado: v' + r.version + ' · estado ' + r.estado);
  return r;
}
