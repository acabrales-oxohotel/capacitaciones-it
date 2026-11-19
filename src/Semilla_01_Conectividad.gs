/**
 * OxoPedia · Lote 1 de contenido: sección «Conectividad y acceso remoto».
 * Ejecuta sembrarLote1() después de instalar(). Todo queda en estado «Borrador».
 * Regla: nada de contraseñas, IPs ni credenciales reales; lo específico de OxoHotel va como [COMPLETAR: …].
 */

function sembrarLote1() {
  sembrarContenido_(CONTENIDO_LOTE_1_());
}

const AVISO_BORRADOR_ = 'Borrador pendiente de validación. La información general se basa en la documentación oficial citada al final; los datos propios de OxoHotel están marcados como **[COMPLETAR: …]**.';

function CONTENIDO_LOTE_1_() {
  const c = {};

  // ───────────────────────── TightVNC ─────────────────────────
  c['tightvnc-conexion-servidores'] = {
    bloques: [
      B.alerta('advertencia', AVISO_BORRADOR_),

      B.titulo('Objetivo / ¿Qué es?'),
      B.texto('**TightVNC** es un software gratuito de control remoto basado en el protocolo VNC (RFB). Permite ver y manejar el escritorio de otro equipo a través de la red, como si se estuviera sentado frente a él.'),
      B.texto('Consta de dos programas:\n- **TightVNC Server:** se instala en el equipo o servidor al que nos vamos a conectar y queda escuchando conexiones (por defecto en el puerto TCP **5900**).\n- **TightVNC Viewer:** se usa en nuestro equipo para conectarnos al servidor.'),
      B.alerta('advertencia', 'La edición gratuita de TightVNC **no cifra** la sesión: solo protege la contraseña. Por eso nunca se debe exponer el puerto de VNC directamente a Internet; la conexión se hace **siempre dentro de una VPN** (ver el artículo de FortiClient VPN) o por un túnel seguro.'),

      B.titulo('Cómo lo usamos en OxoHotel'),
      B.texto('[COMPLETAR: para qué servidores y equipos se usa TightVNC (por ejemplo, servidores de hoteles, datacenter, equipos de recepción) y quién está autorizado a conectarse]'),
      B.tabla([
        ['Equipo / servidor', 'Hotel o sede', 'Nombre o dirección', 'Puerto', 'Requiere VPN'],
        ['[COMPLETAR]', '[COMPLETAR]', '[COMPLETAR: dato en el gestor de contraseñas o inventario]', '5900 (por defecto) [COMPLETAR]', '[COMPLETAR: sí / no]']
      ]),
      B.alerta('nota', 'Las direcciones IP, los nombres de servidor y las contraseñas **no se escriben en este artículo**. Se guardan en el gestor de contraseñas del área de TI: [COMPLETAR: nombre del gestor y de la bóveda].'),

      B.titulo('Requisitos previos'),
      B.texto('- Conexión VPN activa hacia la sede o el hotel [COMPLETAR: si aplica].\n- TightVNC Viewer instalado en nuestro equipo (descarga oficial en tightvnc.com).\n- Nombre o IP del servidor y puerto, consultados en el gestor de contraseñas.\n- Contraseña de acceso VNC del servidor, consultada en el gestor de contraseñas.\n- Que el servidor tenga TightVNC Server instalado y en ejecución.'),

      B.titulo('Procedimiento paso a paso'),
      B.titulo('A. Instalar TightVNC Server en un equipo', 3),
      B.paso('Descargue el instalador de Windows (MSI de 32 o 64 bits según el equipo) desde la página oficial de descargas de TightVNC.', [
        B.enlace('https://www.tightvnc.com/download.php', 'Descargas oficiales de TightVNC', 'Elija la versión para Windows que corresponda al sistema del equipo.')
      ]),
      B.paso('Ejecute el instalador como administrador y acepte la licencia. En el tipo de instalación elija **Custom** si necesita instalar solo el Server, o **Typical** para instalar Server y Viewer.'),
      B.paso('Deje marcada la opción de **registrar TightVNC Server como servicio del sistema**. Así el acceso remoto sigue disponible al reiniciar el equipo y antes de iniciar sesión en Windows.', [
        B.captura('pantalla de selección de componentes del instalador')
      ]),
      B.paso('Cuando el instalador lo pida, active la autenticación por contraseña y defina:\n- La **contraseña de acceso remoto** (para controlar el equipo).\n- La **contraseña administrativa** (para cambiar la configuración del servidor).', [
        B.alerta('importante', 'VNC solo toma en cuenta los **primeros 8 caracteres** de la contraseña de acceso. Use una contraseña única para cada equipo, genérela con el gestor de contraseñas y regístrela allí; no la comparta por chat ni correo.')
      ]),
      B.paso('Finalice la instalación y confirme que el instalador creó la regla de excepción del Firewall de Windows para el puerto 5900. Si el equipo usa otro firewall, permita el puerto TCP 5900 **solo desde las redes autorizadas** (la red de la VPN o de la sede) [COMPLETAR: rangos permitidos].'),
      B.paso('Abra **TightVNC Server → Configuración** y revise: puerto de escucha, que **requiera autenticación** y, en la pestaña de control de acceso, las direcciones desde las que se aceptan conexiones.'),

      B.titulo('B. Conectarse a un servidor con TightVNC Viewer', 3),
      B.paso('Conéctese primero a la VPN correspondiente y verifique que llega al servidor (por ejemplo, con la prueba de conectividad que se explica en el artículo de FortiClient VPN).'),
      B.paso('Abra **TightVNC Viewer**. En el campo **Remote Host** escriba la dirección del servidor y, si el puerto no es el 5900, indíquelo con dos puntos dobles.', [
        B.codigo('[SERVIDOR]            ← usa el puerto 5900 por defecto\n[SERVIDOR]::[PUERTO]   ← indica el puerto exacto\n[SERVIDOR]:[N]         ← pantalla N (puerto 5900 + N)', 'texto'),
        B.alerta('nota', 'Sustituya **[SERVIDOR]** y **[PUERTO]** por los datos del gestor de contraseñas. No los deje escritos en capturas ni en este artículo.')
      ]),
      B.paso('Pulse **Connect** e ingrese la contraseña de acceso del servidor.', [
        B.captura('ventana de TightVNC Viewer con el campo Remote Host (sin mostrar direcciones reales)')
      ]),
      B.paso('Trabaje en la sesión. En la barra superior del visor encontrará opciones útiles: pantalla completa, enviar **Ctrl+Alt+Supr**, copiar y pegar, y transferencia de archivos (si está habilitada) [COMPLETAR: política de transferencia de archivos].'),
      B.paso('Al terminar, **cierre la ventana del visor** para desconectarse y, si corresponde, cierre la VPN. No deje sesiones abiertas sin uso.'),

      B.titulo('Problemas comunes y solución'),
      B.desplegable('No conecta: «connection refused» o tiempo de espera agotado', 'Causas más frecuentes:\n- La **VPN no está activa** o no tiene ruta hacia ese servidor.\n- El servicio **TightVNC Server está detenido** (revisar en Servicios de Windows).\n- El **firewall bloquea** el puerto TCP 5900 (o el puerto configurado).\n- Dirección o puerto equivocados.\n\nPrueba rápida desde nuestro equipo (reemplace los datos entre corchetes):\n`Test-NetConnection [SERVIDOR] -Port [PUERTO]` en PowerShell. Si `TcpTestSucceeded` es `False`, el problema está en la red, la VPN o el firewall, no en TightVNC.'),
      B.desplegable('«Authentication failed» (falla la autenticación)', '- La contraseña es incorrecta: recupérela del gestor de contraseñas.\n- La contraseña tiene más de 8 caracteres y se digitó distinta de la registrada: VNC solo considera los primeros 8.\n- Si hubo demasiados intentos fallidos, el servidor puede bloquear temporalmente nuevas conexiones: espere unos minutos.'),
      B.desplegable('Pantalla negra o no responde el teclado/mouse', '- Verifique que el servidor esté instalado **como servicio**; de lo contrario no podrá ver la pantalla de inicio de sesión ni los avisos de control de cuentas (UAC).\n- Si el equipo tiene varios monitores, el visor puede mostrar solo uno: revise las opciones del visor.\n- Reinicie el servicio TightVNC Server.'),
      B.desplegable('La sesión va lenta', '- Reduzca la calidad en las opciones del visor (menos colores / más compresión).\n- Desactive el fondo de escritorio y los efectos visuales del equipo remoto durante la sesión.\n- Verifique el ancho de banda y la latencia de la VPN.'),

      B.titulo('Lista de verificación'),
      B.checklist([
        'La VPN está activa y el servidor responde.',
        'La contraseña se tomó del gestor de contraseñas.',
        'La sesión se cerró al terminar.',
        'Si se cambió algo en el servidor, quedó registrado en [COMPLETAR: bitácora o ticket].'
      ]),

      B.titulo('Recursos y enlaces oficiales'),
      B.enlace('https://www.tightvnc.com/docs.php', 'Documentación oficial de TightVNC', 'Guías de instalación, configuración y uso del Server y el Viewer.'),
      B.enlace('https://www.tightvnc.com/download.php', 'Descarga de TightVNC', 'Instaladores oficiales para Windows.'),
      B.enlace('https://www.tightvnc.com/faq.php', 'Preguntas frecuentes de TightVNC', 'Incluye notas sobre puertos, contraseñas y cifrado (use VPN o túnel SSH en la edición gratuita).')
    ]
  };

  // ───────────────────────── FortiClient VPN ─────────────────────────
  c['forticlient-vpn-configuracion'] = {
    bloques: [
      B.alerta('advertencia', AVISO_BORRADOR_),

      B.titulo('Objetivo / ¿Qué es?'),
      B.texto('**FortiClient VPN** es el cliente gratuito de Fortinet para conectarse por VPN a un firewall **FortiGate**. Con él accedemos a la red interna de las sedes y los hoteles (servidores, equipos y aplicaciones) desde cualquier lugar.'),
      B.texto('El cliente puede conectarse con **VPN SSL** o **VPN IPsec**. El tipo que corresponde a cada sede depende de cómo esté configurado su FortiGate.'),
      B.alerta('nota', 'Fortinet ha anunciado el retiro progresivo de la VPN SSL en modo túnel en las versiones recientes de FortiOS, a favor de IPsec. Confirme en las notas de versión de Fortinet y con el administrador de cada FortiGate qué tipo de VPN debe usarse: [COMPLETAR: tipo de VPN por sede y versión de FortiOS].'),

      B.titulo('Requisitos previos'),
      B.texto('- Instalador de **FortiClient VPN** descargado del sitio oficial de Fortinet.\n- Permisos de administrador en el equipo para instalarlo.\n- Datos de la conexión, entregados por el administrador de la red: tipo de VPN, **puerta de enlace remota** (nombre o IP), puerto, método de autenticación (usuario y contraseña, certificado y/o segundo factor) [COMPLETAR: dónde se consultan].\n- Usuario y contraseña personales, guardados en el gestor de contraseñas [COMPLETAR: gestor]. Nunca se comparten usuarios entre personas.'),

      B.titulo('Procedimiento paso a paso'),
      B.titulo('A. Instalar FortiClient VPN', 3),
      B.paso('Descargue **FortiClient VPN** (edición solo VPN) desde la página oficial de descargas de Fortinet.', [
        B.enlace('https://www.fortinet.com/support/product-downloads', 'Descargas de productos Fortinet', 'Busque «FortiClient VPN» y elija el instalador para Windows.')
      ]),
      B.paso('Ejecute el instalador como administrador, acepte la licencia y siga el asistente con las opciones por defecto. Reinicie si lo solicita.'),

      B.titulo('B. Crear una conexión VPN', 3),
      B.paso('Abra FortiClient VPN y pulse **Configure VPN** (Configurar VPN).', [
        B.captura('pantalla principal de FortiClient VPN')
      ]),
      B.paso('Elija el tipo de VPN según la sede: **SSL-VPN** o **IPsec VPN** [COMPLETAR: tipo por sede].'),
      B.paso('Complete los campos principales:\n- **Connection Name:** nombre claro y uniforme, por ejemplo `OXO-[HOTEL]-VPN`.\n- **Description:** opcional (sede y responsable).\n- **Remote Gateway:** puerta de enlace indicada por el administrador. Si el puerto no es el predeterminado (443 en VPN SSL), marque **Customize port** e indíquelo.\n- **Authentication:** «Prompt on login» (pide usuario y contraseña en cada conexión) o «Save login» (solo si la política de seguridad lo permite) [COMPLETAR: política].\n- **Client Certificate:** solo si la sede lo exige.', [
        B.alerta('advertencia', 'No marque «Do not warn invalid server certificate» para silenciar advertencias. Un aviso de certificado puede indicar un problema real: consúltelo con el administrador del FortiGate.'),
        B.captura('formulario de nueva conexión (sin mostrar el gateway real)')
      ]),
      B.paso('En una conexión **IPsec**, configure además el método de autenticación (clave precompartida o certificado) y las opciones que indique el administrador [COMPLETAR: parámetros IPsec]. La clave precompartida se consulta en el gestor de contraseñas, nunca se escribe aquí.'),
      B.paso('Pulse **Save** (Guardar). Repita el procedimiento para cada sede que lo requiera.'),

      B.titulo('C. Conectarse y verificar', 3),
      B.paso('En la pantalla principal, seleccione la conexión en **VPN Name**, escriba su usuario y contraseña (y el código del segundo factor si aplica) y pulse **Connect**.'),
      B.paso('Cuando el estado sea **Connected**, abra PowerShell y verifique que llega a un recurso interno de la sede (reemplace el dato entre corchetes):', [
        B.codigo('ping [HOST_INTERNO]\nTest-NetConnection [HOST_INTERNO] -Port [PUERTO]\nipconfig /all', 'powershell'),
        B.alerta('nota', 'Si el ping está bloqueado por política de la red, use `Test-NetConnection` contra un puerto conocido del servicio (por ejemplo, 3389 o 5900).')
      ]),
      B.paso('Al terminar el trabajo, pulse **Disconnect**. Normalmente se mantiene **una sola VPN activa a la vez**: desconéctese de una sede antes de conectarse a otra.'),

      B.titulo('Inventario de VPN por sede'),
      B.tabla([
        ['Sede / hotel', 'Nombre de la conexión', 'Tipo', 'Responsable de la VPN', 'Observaciones'],
        ['[COMPLETAR]', 'OXO-[HOTEL]-VPN', '[COMPLETAR: SSL / IPsec]', '[COMPLETAR]', '[COMPLETAR]']
      ]),

      B.titulo('Problemas comunes y solución'),
      B.desplegable('La conexión se queda cargando (por ejemplo, en 40 %) y falla', '- Verifique que el equipo tiene Internet y que la puerta de enlace es alcanzable (`Test-NetConnection [GATEWAY] -Port 443`).\n- Revise la fecha y hora del equipo: un reloj desfasado rompe la validación del certificado.\n- Actualice FortiClient VPN a la última versión compatible con el FortiGate.\n- Reinicie el equipo; si persiste, desinstale y reinstale el cliente.\n- Si hay otro cliente VPN instalado, puede entrar en conflicto: desactívelo.'),
      B.desplegable('«Credential or SSL VPN configuration is wrong» / usuario o contraseña inválidos', '- Confirme usuario y contraseña en el gestor de contraseñas (y que la cuenta no esté bloqueada o vencida).\n- Si usa segundo factor, verifique que el código no haya expirado.\n- Verifique que la conexión tenga el gateway y el puerto correctos.'),
      B.desplegable('«Unable to establish the VPN connection. The VPN server may be unreachable»', '- Compruebe el acceso a Internet del equipo y que no haya un proxy o firewall bloqueando el puerto de la VPN.\n- Pruebe desde otra red (por ejemplo, datos móviles) para descartar bloqueos de la red local.\n- Si solo falla en una sede, avise al administrador del FortiGate: el servicio o la regla de acceso pueden estar caídos.'),
      B.desplegable('Conecta la VPN pero no se llega a los servidores internos', '- Pruebe por IP y por nombre: si funciona por IP pero no por nombre, es un tema de **DNS**.\n- Revise con `tracert [HOST_INTERNO]` dónde se corta el recorrido.\n- Puede faltar una ruta o una política en el FortiGate para su usuario: escale al administrador con la hora exacta y el recurso al que intentó llegar.'),
      B.desplegable('Advertencia de certificado del servidor', 'No continúe sin validar. Comuníquese con el administrador del FortiGate para confirmar si el certificado cambió o si se trata de un intento de suplantación.'),

      B.titulo('Lista de verificación'),
      B.checklist([
        'FortiClient VPN instalado y actualizado.',
        'Conexión creada con el nombre estándar de la sede.',
        'Se conecta, se valida el acceso a un recurso interno y se desconecta al terminar.',
        'Credenciales guardadas únicamente en el gestor de contraseñas.'
      ]),

      B.titulo('Recursos y enlaces oficiales'),
      B.enlace('https://docs.fortinet.com/product/forticlient', 'Documentación oficial de FortiClient', 'Guías de administración, notas de versión y matrices de compatibilidad.'),
      B.enlace('https://www.fortinet.com/support/product-downloads', 'Descargas de Fortinet', 'Instaladores oficiales de FortiClient VPN.')
    ]
  };

  // ───────────────────────── Soporte remoto ─────────────────────────
  c['soporte-remoto-anydesk-teamviewer-tightvnc'] = {
    bloques: [
      B.alerta('advertencia', AVISO_BORRADOR_),

      B.titulo('Objetivo / ¿Qué es?'),
      B.texto('Este artículo explica **cuándo usar cada herramienta de soporte remoto** (AnyDesk, TeamViewer o TightVNC) y cómo atender a un usuario o conectarse a un equipo de forma segura.'),

      B.titulo('¿Qué herramienta uso?'),
      B.tabla([
        ['Herramienta', 'Cuándo usarla', 'Requiere VPN', 'Acceso desatendido', 'Notas'],
        ['AnyDesk', 'Usuario en cualquier lugar que necesita ayuda en su equipo', 'No (usa servidores de relevo)', 'Sí, con contraseña configurada en el equipo', 'Rápida de iniciar; el usuario acepta la conexión'],
        ['TeamViewer', 'Igual que AnyDesk; útil si el usuario ya la tiene instalada', 'No (usa servidores de relevo)', 'Sí, con TeamViewer Host o instalación completa', 'Para uso comercial requiere licencia'],
        ['TightVNC', 'Servidores y equipos de la red de OxoHotel', 'Sí (red interna o VPN)', 'Sí (servicio instalado)', 'Sin cifrado en la edición gratuita: solo dentro de VPN']
      ]),
      B.alerta('nota', 'Las herramientas con servidor de relevo (AnyDesk y TeamViewer) están sujetas a sus **términos de licencia**: el uso comercial requiere una licencia vigente. Licencias de OxoHotel: [COMPLETAR: producto, cantidad de puestos y responsable de renovación].'),
      B.texto('Regla práctica: **dentro de la red corporativa o con VPN → TightVNC; usuario externo o sin VPN → AnyDesk o TeamViewer**. [COMPLETAR: confirmar la herramienta preferida por la empresa].'),

      B.titulo('Requisitos previos'),
      B.texto('- Solicitud de soporte registrada [COMPLETAR: canal o sistema de tickets].\n- Autorización del usuario para conectarse a su equipo.\n- Herramienta instalada en el equipo del técnico.\n- Para TightVNC: VPN activa y datos de conexión (ver el artículo de TightVNC).'),

      B.titulo('Procedimiento paso a paso'),
      B.titulo('Con AnyDesk', 3),
      B.paso('Pida al usuario que abra AnyDesk (descarga desde el sitio oficial) y le comparta **su dirección** (ID) que aparece en el panel «Este puesto de trabajo».', [
        B.enlace('https://anydesk.com/en/downloads', 'Descargas de AnyDesk', 'Solo desde el sitio oficial.')
      ]),
      B.paso('En su AnyDesk, escriba esa dirección en el campo de **puesto de trabajo remoto** y pulse **Conectar**.', [
        B.captura('campo de dirección remota en AnyDesk (sin mostrar IDs reales)')
      ]),
      B.paso('El usuario debe **aceptar** la solicitud en su pantalla. Ajuste los permisos que necesite (control del teclado y mouse, portapapeles, transferencia de archivos).'),
      B.paso('Realice el soporte. Al terminar, cierre la sesión desde el menú de la ventana de AnyDesk y confirme con el usuario que quedó resuelto.'),

      B.titulo('Con TeamViewer', 3),
      B.paso('Pida al usuario que descargue y ejecute **TeamViewer QuickSupport** (módulo de soporte que no requiere instalación) desde el sitio oficial.', [
        B.enlace('https://www.teamviewer.com/en/download/', 'Descargas de TeamViewer', 'Busque «QuickSupport» para el usuario y la aplicación completa para el técnico.')
      ]),
      B.paso('El usuario le comparte su **ID** y la **contraseña temporal** que muestra la ventana (por una vía segura, por ejemplo llamada telefónica).'),
      B.paso('En su TeamViewer, ingrese el ID en «ID de compañero», elija **Control remoto**, pulse **Conectar** e introduzca la contraseña.'),
      B.paso('Al terminar, cierre la sesión; la contraseña temporal deja de ser válida al cerrar QuickSupport.'),

      B.titulo('Con TightVNC', 3),
      B.paso('Conéctese primero a la VPN y siga el procedimiento del artículo «TightVNC: qué es, cómo lo usamos y cómo conectarnos a los servidores».'),

      B.titulo('Buenas prácticas de seguridad'),
      B.texto('- Conéctese **solo cuando el usuario lo haya solicitado** y verifique su identidad (por ejemplo, devolviendo la llamada a un número conocido).\n- No instale herramientas de acceso remoto a partir de enlaces o llamadas no solicitadas.\n- Descargue siempre desde el **sitio oficial** del fabricante.\n- No guarde contraseñas de acceso desatendido en notas ni chats: use el gestor de contraseñas [COMPLETAR: gestor].\n- Cierre la sesión al terminar y retire el acceso desatendido si ya no se necesita.\n- Registre el soporte realizado: [COMPLETAR: dónde y qué datos se anotan].'),
      B.alerta('advertencia', 'Nunca pida ni acepte contraseñas personales del usuario (correo, PMS, etc.). Si el trabajo requiere iniciar sesión, pida al usuario que lo haga él mismo.'),

      B.titulo('Problemas comunes y solución'),
      B.desplegable('Se conecta pero la imagen no carga o va muy lenta', '- Reduzca la calidad de imagen y desactive el fondo de pantalla en las opciones de la sesión.\n- Pida al usuario que cierre aplicaciones que consuman red (videollamadas, descargas).\n- Pruebe con otra herramienta si el problema persiste.'),
      B.desplegable('No puedo interactuar con ventanas de administrador (UAC) o con la pantalla de bloqueo', 'Las ventanas con privilegios elevados solo se pueden controlar si la herramienta está instalada como servicio o se ejecuta con permisos de administrador. Solicite al usuario que instale la herramienta o ejecútela como administrador con su autorización.'),
      B.desplegable('Mensaje de «uso comercial detectado» o sesión limitada', 'Indica un problema de licencia (por ejemplo, una versión gratuita en un entorno empresarial). Detenga el soporte por esa vía, use otra herramienta autorizada y avise al responsable de licencias: [COMPLETAR: contacto].'),
      B.desplegable('El antivirus bloquea la herramienta', 'Kaspersky u otros antivirus pueden clasificar las herramientas de administración remota como software de riesgo. No desactive la protección por su cuenta: solicite al área de seguridad la exclusión correspondiente [COMPLETAR: procedimiento de aprobación].'),

      B.titulo('Lista de verificación'),
      B.checklist([
        'El usuario solicitó el soporte y autorizó la conexión.',
        'Se usó la herramienta adecuada (red interna → TightVNC; externo → AnyDesk/TeamViewer).',
        'No se solicitaron ni guardaron contraseñas del usuario.',
        'La sesión se cerró y el usuario confirmó que quedó resuelto.',
        'El soporte quedó registrado.'
      ]),

      B.titulo('Recursos y enlaces oficiales'),
      B.enlace('https://support.anydesk.com/', 'Centro de ayuda de AnyDesk', 'Guías de uso, acceso desatendido y seguridad.'),
      B.enlace('https://www.teamviewer.com/en/global/support/knowledge-base/', 'Base de conocimiento de TeamViewer', 'Guías de QuickSupport, Host y licenciamiento.'),
      B.enlace('https://www.tightvnc.com/docs.php', 'Documentación de TightVNC', 'Guías oficiales del Server y el Viewer.')
    ]
  };

  return c;
}
