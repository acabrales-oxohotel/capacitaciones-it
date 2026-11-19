/**
 * OxoPedia · Mejora de redacción del artículo «Configuración de VPN en FortiClient VPN».
 * Reorganiza el contenido que ya existe (pasos e imágenes cargadas desde el editor) con una redacción formal y clara.
 *
 * Uso: ejecutar UNA VEZ mejorarArticuloVpn() desde el editor de Apps Script.
 *  - Conserva las imágenes ya subidas (se buscan por su ruta en el artículo actual).
 *  - Guarda como una versión nueva (el texto anterior queda en el Historial y se puede restaurar).
 *  - Deja el artículo «En revisión» para que un administrador lo valide de nuevo.
 *  - No incluye usuarios, contraseñas, IP ni claves: esos datos viven únicamente en los Excel del equipo de TI.
 */

const ID_ARTICULO_VPN_ = 'artbf411a1f';

function mejorarArticuloVpn() {
  const art = Db.leer('Articulos').find(function (a) { return a.id === ID_ARTICULO_VPN_; });
  if (!art) throw new Error('No se encontró el artículo de la VPN (' + ID_ARTICULO_VPN_ + ').');

  // Imágenes ya existentes en el artículo (recorre también las anidadas dentro de los pasos).
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
    B.texto('Esta guía explica cómo **instalar FortiClient VPN** y cómo **crear y utilizar la conexión VPN de cada hotel**, para acceder de forma segura a los sistemas de la compañía, por ejemplo el PMS. Está dirigida al personal de tecnología que da soporte a los hoteles y a quienes se encuentran en proceso de capacitación.'),
    B.alerta('importante', 'Los datos de cada hotel (usuario y contraseña de la VPN, direcciones, clave precompartida y credenciales del PMS) se consultan **únicamente** en los archivos de Excel del equipo de tecnología [COMPLETAR: ubicación de los archivos]. Esta guía no los reproduce y no deben copiarse en correos, chats ni documentos.'),

    B.titulo('Antes de comenzar', 2),
    B.checklist([
      'Equipo con Windows y permisos de administrador para instalar programas.',
      'Memoria de instalación del equipo de tecnología (unidad **CCCOMA**).',
      'Archivo de Excel con los usuarios de la VPN y archivo de Excel con la configuración de la VPN de cada hotel.',
      'Conocer el hotel al que se va a conectar y su tipo de PMS (por ejemplo, Zeus u Opera).'
    ]),

    B.titulo('1. Instalar FortiClient VPN', 2),
    B.texto('El instalador se encuentra en la memoria de instalación del equipo de tecnología. Realice este procedimiento una sola vez por equipo.'),
    B.paso('Conecte la memoria de instalación al equipo y, en el Explorador de archivos, abra la unidad **CCCOMA**.', [
      img('instalar-1-unidad-cccoma', 'Explorador de archivos con la unidad CCCOMA señalada', 'Paso 1. Abra la unidad CCCOMA (por ejemplo, D:).')
    ]),
    B.paso('Dentro de la unidad, abra la carpeta **MEMORIA**.', [
      img('instalar-2-carpeta-memoria', 'Contenido de la unidad CCCOMA con la carpeta MEMORIA señalada', 'Paso 2. Abra la carpeta MEMORIA.')
    ]),
    B.paso('En la carpeta MEMORIA, abra la carpeta **Instaladores de Zeus**.', [
      img('instalar-3-instaladores-de-zeus', 'Carpeta MEMORIA con la carpeta Instaladores de Zeus señalada', 'Paso 3. Abra la carpeta Instaladores de Zeus.')
    ]),
    B.paso('Ejecute el archivo **FortiClientVPNOnlineInstaller** con doble clic y siga las indicaciones del asistente hasta finalizar la instalación.', [
      img('instalar-4-forticlient', 'Archivo FortiClientVPNOnlineInstaller señalado dentro de la carpeta', 'Paso 4. Doble clic en FortiClientVPNOnlineInstaller.')
    ]),
    B.paso('Al terminar, abra **FortiClient VPN** desde el menú Inicio y confirme que se muestra la pantalla principal del programa.'),

    B.titulo('2. Conocer la información y la pantalla de FortiClient', 2),
    B.texto('Antes de configurar la conexión, revise las siguientes guías visuales. En cada una, los recuadros numerados indican **qué dato se digita en cada campo** y **de qué columna del Excel se toma**; el mismo número y color aparecen en la tabla y en la captura.'),
    img('imagen-0-origen-de-los-datos', 'Origen de los datos en el Excel y su correspondencia con cada campo', 'Origen de los datos: columnas del Excel que se copian en cada campo de FortiClient.'),
    img('guia-vpn-1-conectarse', 'Guía 1: cómo conectarse a la VPN en FortiClient', 'Guía 1. Cómo conectarse a la VPN: nombre de la VPN, usuario, contraseña y botón Conectar.'),
    img('guia-vpn-2-fase1', 'Guía 2: configuración avanzada, Fase 1', 'Guía 2. Configuración avanzada, Fase 1.'),
    img('guia-vpn-3-fase2', 'Guía 3: configuración avanzada, Fase 2', 'Guía 3. Configuración avanzada, Fase 2.'),
    img('guia-vpn-4-resumen-claves', 'Guía 4: resumen de qué usuario y contraseña se usa en cada lugar', 'Guía 4. Resumen: qué usuario y contraseña se utiliza en cada paso.'),
    B.tabla([
      ['Dato', 'Cuándo se utiliza', 'Dónde se digita'],
      ['Clave precompartida y datos de la conexión', 'Una sola vez, al crear la conexión', 'Ventana «Editar conexión VPN»'],
      ['Usuario y contraseña de la VPN', 'Cada vez que se inicia la conexión', 'Pantalla principal de FortiClient'],
      ['Enlace de acceso al sistema del hotel', 'Con la VPN en estado «Conectado»', 'Navegador (Chrome o Edge)'],
      ['Usuario y contraseña del PMS', 'Dentro del sistema del hotel', 'Pantalla de ingreso del PMS']
    ]),
    B.alerta('nota', 'La contraseña de la VPN y la del PMS **son distintas**. La clave precompartida no se escribe al iniciar sesión: se utiliza únicamente al crear la conexión.'),

    B.titulo('3. Crear la conexión VPN del hotel', 2),
    B.texto('Este procedimiento se realiza **una sola vez por hotel**. Los datos se toman de la fila del hotel en el Excel de configuración de la VPN (hoja «VPNs»).'),
    B.paso('En FortiClient, abra el menú de configuración y seleccione **Editar conexión**. Elija **VPN IPsec** y diligencie: nombre de la conexión (nombre del hotel seguido de «IPSEC»), gateway remoto con la dirección principal y, mediante «Adicionar gateway remoto», la dirección secundaria. Como método de autenticación seleccione **Clave precompartida** y digite la clave. En «Autenticación (XAuth)» deje **Preguntar en el login**; deje «Failover SSL VPN» en [Ninguno] y sin marcar el inicio de sesión único (SSO). Por último, despliegue **Ajustes avanzados** y abra Fase 1 y Fase 2.', [
      img('excel-0-crear-conexion', 'Ventana Editar conexión VPN con los campos y su origen en el Excel', 'Datos de la conexión y su origen en el Excel de configuración de la VPN.')
    ]),
    B.paso('**Fase 1.** Configure dos propuestas IKE: AES128 con SHA1 y AES256 con SHA256 (iguales en todos los hoteles). Marque el **Grupo DH** indicado en la columna «CAF DH FASE 1» del Excel. Establezca la vida de la clave en **86400** segundos y digite el **ID local** indicado en el Excel. Deje marcadas «Detección de par muerto (DPD)» y «NAT transversal», y deje sin marcar «Habilitar LAN local».', [
      img('excel-2-fase1', 'Configuración de la Fase 1 con los valores fijos y los tomados del Excel', 'Fase 1: valores fijos y valores tomados del Excel.')
    ]),
    B.paso('**Fase 2.** Configure las mismas dos propuestas IKE. Establezca la vida de la clave en **43200** segundos y deje sin marcar la opción de KBytes. Marque «Habilitar detección de repeticiones» y «Habilitar Perfect Forward Secrecy (PFS)», y seleccione el **Grupo DH** de la columna «CAF DH FASE 2» del Excel. Finalice con **Guardar**.', [
      img('excel-3-fase2', 'Configuración de la Fase 2 con los valores fijos y los tomados del Excel', 'Fase 2: valores fijos y valores tomados del Excel.')
    ]),

    B.titulo('4. Conectarse a la VPN', 2),
    B.texto('Este procedimiento se realiza **cada vez** que se necesita acceder al hotel. Los datos se toman del Excel de usuarios de la VPN, en la fila del hotel correspondiente.'),
    B.paso('En FortiClient, seleccione el hotel en el campo **Nombre de VPN**. Digite el **usuario** y la **contraseña de la VPN** indicados en el Excel. La opción «Guardar contraseña» es opcional y debe usarse **solo en equipos personales asignados**.', [
      img('excel-1-conectarse', 'Pantalla principal de FortiClient con el origen de cada campo en el Excel', 'Campos de la pantalla principal y su origen en el Excel de usuarios.')
    ]),
    B.paso('Haga clic en **Conectar** y espere el mensaje **«Conectado»**.'),
    B.paso('Con la VPN conectada, abra en el navegador el enlace de acceso del hotel e ingrese al PMS con las credenciales propias del programa.'),
    B.paso('Al terminar su gestión, vuelva a FortiClient y seleccione **Desconectar**. No deje la VPN activa sin uso.'),

    B.titulo('Solución de problemas', 2),
    B.desplegable('La VPN no conecta', '- Verifique que seleccionó el hotel correcto en **Nombre de VPN**.\n- Confirme que digita la **contraseña de la VPN** y no la del PMS.\n- Revise que el usuario y la contraseña correspondan a la fila del hotel en el Excel.\n- Si falla con la dirección principal, edite la conexión (menú de configuración) e intente con la **dirección secundaria**.'),
    B.desplegable('El enlace del PMS no abre', '- Confirme que FortiClient muestra el estado **«Conectado»** antes de abrir el navegador.\n- Revise que utiliza el enlace de acceso del hotel indicado en el Excel.\n- Cierre la sesión de la VPN, vuelva a conectarse e intente de nuevo.'),
    B.desplegable('Me solicita la clave precompartida al iniciar sesión', 'La clave precompartida **no** se digita al iniciar sesión: solo se usa al crear la conexión. Si el programa la solicita, edite la conexión y confirme que el método de autenticación sea «Clave precompartida» y que el campo «Autenticación (XAuth)» esté en «Preguntar en el login».'),
    B.alerta('advertencia', 'Si el problema persiste, no comparta credenciales por chat ni por correo. Escale el caso al equipo de tecnología indicando el hotel afectado y el mensaje que muestra FortiClient [COMPLETAR: canal de escalamiento].')
  ];

  const meta = {
    id: art.id, seccion_id: art.seccion_id, titulo: art.titulo,
    resumen: 'Guía paso a paso para instalar FortiClient VPN y crear, configurar y utilizar la conexión VPN de cada hotel.',
    etiquetas: art.etiquetas, responsable_email: art.responsable_email, estado: 'En revisión'
  };
  const usuario = { email: Session.getActiveUser().getEmail() || 'sistema', nombre: 'Sistema' };
  const r = guardarArticulo_(meta, bloques, 'Redacción formal y reestructuración del contenido (se conservan las imágenes)', usuario, { forzar: true, accion: 'editar' });
  Logger.log('Artículo actualizado: v' + r.version + ' · estado ' + r.estado);
  return r;
}
