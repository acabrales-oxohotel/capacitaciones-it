/**
 * OxoPedia · Mejora de redacción y estructura del artículo «Soporte remoto con AnyDesk».
 * Uso: ejecutar UNA VEZ mejorarArticuloAnyDesk() desde el editor de Apps Script.
 *  - Corrige ortografía y redacción, y divide el contenido en secciones.
 *  - Conserva las 6 capturas ya subidas (se buscan por su ruta en el artículo actual).
 *  - Se guarda como una versión nueva: el texto anterior queda en el Historial.
 *  - No incluye IDs, contraseñas ni datos de acceso.
 */

const ID_ARTICULO_ANYDESK_ = 'artc47ba537';

function mejorarArticuloAnyDesk() {
  const art = Db.leer('Articulos').find(function (a) { return a.id === ID_ARTICULO_ANYDESK_; });
  if (!art) throw new Error('No se encontró el artículo de AnyDesk (' + ID_ARTICULO_ANYDESK_ + ').');

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
    B.texto('**AnyDesk** es una herramienta de acceso remoto que permite ver y controlar otro equipo a través de Internet. Con ella brindamos **soporte técnico a distancia** a los usuarios de la compañía sin necesidad de desplazarnos. Este instructivo explica cómo descargarla, cómo conectarse a otro equipo y qué hacer si la conexión falla.'),
    B.alerta('advertencia', 'Conéctese **únicamente cuando el usuario lo haya solicitado** y autorizado. Además, la versión gratuita de AnyDesk es de uso no profesional: confirme con el responsable de licencias cuál es la versión autorizada para el uso en la compañía [COMPLETAR: licencia y contacto].'),

    B.titulo('Antes de comenzar', 2),
    B.checklist([
      'El usuario solicitó el soporte y autorizó la conexión.',
      'Ambos equipos tienen conexión a Internet.',
      'AnyDesk está **abierto** en el equipo al que se va a ingresar.',
      'Se cuenta con el **ID** del equipo remoto, que entrega la persona encargada de ese equipo.'
    ]),

    B.titulo('1. Descargar AnyDesk', 2),
    B.paso('Abra el navegador, escriba **anydesk** en el buscador de Google y presione **Enter**. Ingrese al sitio oficial, **anydesk.com**.', [
      img('paso1-buscar-en-google', 'Búsqueda de AnyDesk en Google con el sitio oficial señalado', 'Búsqueda de «anydesk» y acceso al sitio oficial anydesk.com.')
    ]),
    B.paso('En la página de AnyDesk, haga clic en **Descargas** o en **Descárgalo ahora** y ejecute el archivo descargado.', [
      img('paso2-pagina-anydesk', 'Página oficial de AnyDesk con los botones de descarga señalados', 'Botones de descarga en la página oficial.')
    ]),

    B.titulo('2. Conocer la pantalla principal', 2),
    B.paso('Al abrir AnyDesk se muestra la pantalla principal. Allí encontrará dos datos importantes: **su propio ID** (número del puesto de trabajo) y el campo **«Introduzca la dirección remota»**, donde se escribe el **ID del otro equipo**. El ID del equipo remoto lo entrega la persona encargada del dispositivo.', [
      img('paso4-app-instalada', 'Pantalla principal de AnyDesk con el ID propio y el campo del ID remoto señalados', 'Pantalla principal: su ID y el campo para escribir el ID del otro equipo.')
    ]),
    B.alerta('nota', 'El ID identifica al equipo, pero no sustituye la autorización del usuario: la conexión solo se establece cuando la persona acepta la solicitud en su equipo.'),

    B.titulo('3. Conectarse al equipo remoto', 2),
    B.paso('Escriba el **ID del otro equipo** en el campo de dirección remota y presione **Enter** para iniciar la solicitud de conexión.'),
    B.paso('Espere mientras AnyDesk muestra el mensaje **«Conectando…»**. Si necesita detener el intento, utilice el botón **Cancelar**.', [
      img('paso5-conectando', 'Mensaje «Conectando…» a la espera de que el otro equipo acepte', 'Estado «Conectando…»: se espera que el otro equipo acepte la solicitud.')
    ]),
    B.paso('En el equipo remoto, la persona encargada verá la solicitud de conexión y debe hacer clic en **Aceptar**.', [
      img('paso6-aceptar-en-otro-equipo', 'Ventana de AnyDesk en el equipo remoto con la solicitud de conexión y el botón Aceptar señalados', 'En el equipo remoto aparece la solicitud: la persona hace clic en «Aceptar».')
    ]),
    B.paso('Una vez aceptada la solicitud, se mostrará el escritorio del otro equipo y podrá **controlarlo** para realizar el soporte técnico.'),
    B.paso('Al terminar, cierre la sesión de AnyDesk y confirme con el usuario que el inconveniente quedó resuelto.'),

    B.titulo('Solución de problemas', 2),
    B.texto('Si aparece el mensaje **«No se puede acceder al ordenador»**, la conexión no se pudo establecer. Revise lo siguiente:'),
    img('paso9-error-no-se-puede-acceder', 'Mensaje de error «No se puede acceder al ordenador» con las opciones señaladas', 'Error «No se puede acceder al ordenador» y sus opciones: Encendido, Repetir y Cancelar.'),
    B.checklist([
      'Que el **ID** escrito sea el correcto.',
      'Que el equipo remoto esté **encendido**.',
      'Que el equipo remoto tenga **conexión a Internet**.',
      'Que la persona encargada tenga **AnyDesk abierto**: sin la aplicación abierta no puede aceptar la solicitud.'
    ]),
    B.texto('Cuando se haya corregido la causa, haga clic en **Repetir** para intentar de nuevo la conexión.'),
    B.desplegable('El equipo está apagado', 'Solicite a la persona encargada que encienda el equipo, o utilice la opción **Encendido** que se muestra en la ventana de error si el equipo está configurado para ello.'),

    B.titulo('Recursos relacionados', 2),
    B.texto('Para conocer cuándo usar AnyDesk, TeamViewer o TightVNC, y las buenas prácticas de seguridad, consulte el artículo «Soporte remoto con AnyDesk, TeamViewer o TightVNC» de esta misma sección.'),
    B.enlace('https://support.anydesk.com/', 'Centro de ayuda de AnyDesk', 'Guías de uso, acceso desatendido y seguridad.')
  ];

  const meta = {
    id: art.id, seccion_id: art.seccion_id, titulo: 'Soporte remoto con AnyDesk',
    resumen: 'Instructivo para descargar AnyDesk, conectarse a otro equipo y resolver los errores de conexión más frecuentes.',
    etiquetas: art.etiquetas || 'anydesk, soporte remoto, acceso remoto', responsable_email: art.responsable_email, estado: art.estado
  };
  const usuario = { email: Session.getActiveUser().getEmail() || 'sistema', nombre: 'Sistema' };
  const r = guardarArticulo_(meta, bloques, 'Corrección de ortografía y redacción; contenido dividido en secciones (se conservan las imágenes)', usuario, { forzar: true, accion: 'editar' });
  Logger.log('Artículo actualizado: v' + r.version + ' · estado ' + r.estado);
  return r;
}
