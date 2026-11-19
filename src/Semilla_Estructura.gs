/**
 * OxoPedia · Estructura inicial (8 secciones, subsecciones de Desarrollo y los artículos de cada una).
 * Todo se crea en estado «Borrador». sembrarEstructura() es idempotente: no duplica ni pisa lo ya creado.
 * El contenido real se carga por lotes (Semilla_01_…, Semilla_02_…) con sembrarLote1(), sembrarLote2()…
 */

const USUARIO_SEMILLA_ = { email: 'semilla', nombre: 'Semilla' };

/** Constructores de bloques para escribir contenido de forma legible. */
const B = {
  titulo: function (t, nivel) { return { tipo: 'titulo', contenido: t, config: { nivel: nivel || 2 } }; },
  texto: function (t) { return { tipo: 'texto', contenido: t, config: {} }; },
  paso: function (t, hijos) { return { tipo: 'paso', contenido: t, config: {}, hijos: hijos || [] }; },
  codigo: function (t, lenguaje) { return { tipo: 'codigo', contenido: t, config: { lenguaje: lenguaje || 'texto' } }; },
  alerta: function (nivel, t) { return { tipo: 'alerta', contenido: t, config: { nivel: nivel } }; },
  enlace: function (url, titulo, descripcion) { return { tipo: 'enlace', contenido: '', config: { url: url, titulo: titulo, descripcion: descripcion || '' } }; },
  checklist: function (items) { return { tipo: 'checklist', contenido: items.join('\n'), config: {} }; },
  tabla: function (filas) { return { tipo: 'tabla', contenido: filas.map(function (f) { return f.join(' | '); }).join('\n'), config: {} }; },
  desplegable: function (titulo, t) { return { tipo: 'desplegable', contenido: t, config: { titulo: titulo } }; },
  separador: function () { return { tipo: 'separador', contenido: '', config: {} }; },
  /** Marcador de captura pendiente (se reemplaza por un bloque «imagen» desde el editor). */
  captura: function (descripcion) { return B.alerta('nota', '[COMPLETAR: captura de pantalla — ' + descripcion + ']'); }
};

const SECCIONES_SEMILLA = [
  { slug: 'conectividad-acceso-remoto', nombre: 'Conectividad y acceso remoto', icono: 'ph-plugs-connected', color: '#3a6f9a',
    descripcion: 'VPN, TightVNC y herramientas de soporte remoto para llegar a servidores y equipos.' },
  { slug: 'software-hotelero', nombre: 'Software hotelero', icono: 'ph-bed', color: '#c19528',
    descripcion: 'Instalación y configuración de Zeus y Opera, y reportes del back office.' },
  { slug: 'puesto-de-trabajo-onboarding', nombre: 'Puesto de trabajo y onboarding', icono: 'ph-desktop-tower', color: '#5a7d5f',
    descripcion: 'Alistamiento de equipos, configuración estándar y entrega a los usuarios.' },
  { slug: 'infraestructura-dispositivos', nombre: 'Infraestructura y dispositivos', icono: 'ph-hard-drives', color: '#b0613f',
    descripcion: 'Biométrico, pantallas OneScreen, impresoras y otros dispositivos físicos.' },
  { slug: 'operacion-visitas-hoteles', nombre: 'Operación y visitas a hoteles', icono: 'ph-buildings', color: '#7a4e73',
    descripcion: 'Qué se hace en una visita, cómo funciona la operación y qué sitios están vinculados con nosotros.' },
  { slug: 'inteligencia-artificial', nombre: 'Inteligencia Artificial en OxoHotel', icono: 'ph-sparkle', color: '#c4526b',
    descripcion: 'Uso autorizado de Claude y Gemini según las necesidades de OxoHotel.' },
  { slug: 'desarrollo', nombre: 'Desarrollo', icono: 'ph-code', color: '#2b7a78',
    descripcion: 'Apps Script, herramientas, bases de datos, repositorios e IA para desarrollar.' },
  { slug: 'dev-fundamentos', nombre: 'Fundamentos', icono: 'ph-lightbulb', color: '#2b7a78', padre: 'desarrollo', descripcion: 'Conceptos base de Google Apps Script.' },
  { slug: 'dev-herramientas', nombre: 'Herramientas', icono: 'ph-wrench', color: '#2b7a78', padre: 'desarrollo', descripcion: 'IDE, clasp y DBeaver.' },
  { slug: 'dev-datos', nombre: 'Datos', icono: 'ph-database', color: '#2b7a78', padre: 'desarrollo', descripcion: 'Tipos de bases de datos que manejamos.' },
  { slug: 'dev-infraestructura', nombre: 'Infraestructura y repositorios', icono: 'ph-git-branch', color: '#2b7a78', padre: 'desarrollo', descripcion: 'GitHub, Drive de proyectos y Hostinger.' },
  { slug: 'dev-ia', nombre: 'IA para desarrollo', icono: 'ph-robot', color: '#2b7a78', padre: 'desarrollo', descripcion: 'Claude, Claude Code y el agente de Gemini en Antigravity.' },
  { slug: 'transversales', nombre: 'Glosario, FAQ y contactos', icono: 'ph-books', color: '#5b6770',
    descripcion: 'Material de consulta común a todas las áreas.' }
];

const ARTICULOS_SEMILLA = [
  // 1 · Conectividad
  { sec: 'conectividad-acceso-remoto', slug: 'tightvnc-conexion-servidores', titulo: 'TightVNC: qué es, cómo lo usamos y cómo conectarnos a los servidores',
    resumen: 'Qué es TightVNC, cómo se instala el servidor y cómo conectarse con el visor a los servidores de OxoHotel.', etiquetas: 'tightvnc, vnc, servidores, acceso remoto' },
  { sec: 'conectividad-acceso-remoto', slug: 'forticlient-vpn-configuracion', titulo: 'Configuración de VPN en FortiClient VPN',
    resumen: 'Cómo instalar FortiClient VPN y crear, probar y diagnosticar las conexiones VPN hacia los hoteles y la sede.', etiquetas: 'vpn, forticlient, fortinet, conectividad' },
  { sec: 'conectividad-acceso-remoto', slug: 'soporte-remoto-anydesk-teamviewer-tightvnc', titulo: 'Soporte remoto con AnyDesk, TeamViewer o TightVNC',
    resumen: 'Cuándo usar cada herramienta de soporte remoto y cómo atender a un usuario de forma segura.', etiquetas: 'anydesk, teamviewer, tightvnc, soporte remoto' },
  // 2 · Software hotelero
  { sec: 'software-hotelero', slug: 'instalacion-zeus', titulo: 'Instalación de Zeus (PMS, Nómina, Contabilidad, POS, Front y archivo Hosts)',
    resumen: 'Instalación de los módulos de Zeus en un equipo y configuración del archivo Hosts.', etiquetas: 'zeus, pms, nómina, contabilidad, pos, front, hosts' },
  { sec: 'software-hotelero', slug: 'instalacion-opera-pms', titulo: 'Instalación de Opera (PMS en navegador, Java, Opciones de Internet y archivo Hosts)',
    resumen: 'Preparación del equipo para abrir Opera PMS desde el navegador: Java, Opciones de Internet y Hosts.', etiquetas: 'opera, pms, java, hosts, navegador' },
  { sec: 'software-hotelero', slug: 'opera-cloud-zeus-web-accesos-directos', titulo: 'Instalación de Opera Cloud y Zeus Web (enlaces fijos en accesos directos)',
    resumen: 'Cómo dejar Opera Cloud y Zeus Web como accesos directos con enlace fijo para el usuario.', etiquetas: 'opera cloud, zeus web, accesos directos' },
  { sec: 'software-hotelero', slug: 'exportar-reporte-bof', titulo: 'Cómo exportar un reporte BOF (hoteles como Waya y Chico)',
    resumen: 'Procedimiento para generar y exportar un reporte desde el Back Office (BOF).', etiquetas: 'bof, reportes, waya, chico, exportar' },
  // 3 · Puesto de trabajo
  { sec: 'puesto-de-trabajo-onboarding', slug: 'arreglar-tamano-pantallas', titulo: 'Arreglar los tamaños de las pantallas',
    resumen: 'Resolución, escala y disposición de monitores en Windows.', etiquetas: 'pantalla, resolución, escala, monitores' },
  { sec: 'puesto-de-trabajo-onboarding', slug: 'alistamiento-equipo-completo', titulo: 'Configuración y alistamiento de un equipo completo',
    resumen: 'Lista de alistamiento: impresora, Kaspersky, Chrome, Office, Drive, Intranet y fondo de pantalla.', etiquetas: 'onboarding, alistamiento, kaspersky, office, chrome, drive' },
  { sec: 'puesto-de-trabajo-onboarding', slug: 'actas-entrega-recibido-equipos', titulo: 'Software de actas de entrega y recibido de equipos (uso en la tablet)',
    resumen: 'Cómo se diligencia el acta de entrega y recibido de un equipo con el software en la tablet.', etiquetas: 'actas, entrega, recibido, tablet, inventario' },
  // 4 · Infraestructura
  { sec: 'infraestructura-dispositivos', slug: 'biometrico-oficina-corporativa', titulo: 'Configuración del biométrico de la entrada de la oficina corporativa',
    resumen: 'Configuración y administración del biométrico de acceso de la oficina corporativa.', etiquetas: 'biométrico, acceso, oficina corporativa' },
  { sec: 'infraestructura-dispositivos', slug: 'pantalla-onescreen', titulo: 'Configuración de la pantalla OneScreen (sala de juntas y sala 4)',
    resumen: 'Puesta en marcha y configuración de las pantallas OneScreen.', etiquetas: 'onescreen, sala de juntas, sala 4, pantalla' },
  { sec: 'infraestructura-dispositivos', slug: 'impresora-corporativa', titulo: 'Configuración y soporte físico de la impresora corporativa',
    resumen: 'Instalación en red, controladores y mantenimiento básico de la impresora corporativa.', etiquetas: 'impresora, soporte físico, tóner' },
  // 5 · Operación
  { sec: 'operacion-visitas-hoteles', slug: 'visita-hoteles-operacion', titulo: 'Qué se hace en la visita a hoteles y cómo funciona la operación',
    resumen: 'Objetivo de la visita, checklist y sitios vinculados con TI (como el datacenter).', etiquetas: 'visitas, hoteles, operación, datacenter' },
  // 6 · IA
  { sec: 'inteligencia-artificial', slug: 'configurar-ia-claude-gemini', titulo: 'Cómo configurar una IA (Claude y Gemini) según las necesidades de OxoHotel',
    resumen: 'Herramientas de IA autorizadas, cómo configurarlas y qué información no se debe compartir.', etiquetas: 'ia, claude, gemini, políticas' },
  // 7 · Desarrollo
  { sec: 'dev-fundamentos', slug: 'que-es-google-apps-script', titulo: 'Qué es Google Apps Script',
    resumen: 'Fundamentos de Apps Script y cómo lo usamos en OxoHotel.', etiquetas: 'apps script, fundamentos, google workspace' },
  { sec: 'dev-herramientas', slug: 'ide-vscode-antigravity-estandares', titulo: 'IDE: Visual Studio Code y Antigravity según los estándares de OxoHotel',
    resumen: 'Instalación y configuración estándar de los editores de código.', etiquetas: 'vscode, antigravity, ide, estándares' },
  { sec: 'dev-herramientas', slug: 'clasp-apps-script-local', titulo: 'clasp: trabajar Apps Script en local',
    resumen: 'Instalación y flujo de trabajo con clasp (login, clone, push, deploy).', etiquetas: 'clasp, apps script, node' },
  { sec: 'dev-herramientas', slug: 'dbeaver-conexion-bases-de-datos', titulo: 'DBeaver: cómo lo usamos para conectarnos a las bases de datos',
    resumen: 'Conexión a bases de datos MySQL/MariaDB con DBeaver.', etiquetas: 'dbeaver, mysql, base de datos' },
  { sec: 'dev-datos', slug: 'tipos-de-bases-de-datos', titulo: 'Tipos de bases de datos que manejamos: Google Sheets y phpMyAdmin (Hostinger)',
    resumen: 'Cuándo usar Google Sheets y cuándo MySQL en Hostinger.', etiquetas: 'sheets, mysql, phpmyadmin, hostinger' },
  { sec: 'dev-infraestructura', slug: 'github-repositorio-general', titulo: 'Repositorio general de proyectos en GitHub',
    resumen: 'Organización, convenciones y flujo de trabajo en GitHub.', etiquetas: 'github, git, repositorios' },
  { sec: 'dev-infraestructura', slug: 'drive-proyectos-apps-script', titulo: 'Carpeta de Drive «PROYECTOS APPS SCRIPT»',
    resumen: 'Qué contiene la carpeta y cómo se organiza cada proyecto.', etiquetas: 'drive, apps script, proyectos' },
  { sec: 'dev-infraestructura', slug: 'hostinger-sitios-alojados', titulo: 'Hostinger: sitios alojados y adquiridos',
    resumen: 'Inventario de sitios, dominios y bases de datos alojados en Hostinger.', etiquetas: 'hostinger, dominios, hosting' },
  { sec: 'dev-ia', slug: 'claude-code-desarrollo', titulo: 'Cómo usar Claude y Claude Code para desarrollar',
    resumen: 'Instalación, buenas prácticas y flujo de trabajo con Claude Code.', etiquetas: 'claude code, ia, desarrollo' },
  { sec: 'dev-ia', slug: 'agente-gemini-antigravity', titulo: 'Cómo usar el agente de Gemini integrado en Antigravity',
    resumen: 'Uso del agente de Gemini dentro del IDE Antigravity.', etiquetas: 'gemini, antigravity, agente, ia' },
  // 8 · Transversales
  { sec: 'transversales', slug: 'glosario', titulo: 'Glosario',
    resumen: 'Términos y siglas usados en TI y en la operación hotelera.', etiquetas: 'glosario, términos', tipo: 'glosario' },
  { sec: 'transversales', slug: 'preguntas-frecuentes', titulo: 'Preguntas frecuentes',
    resumen: 'Respuestas rápidas a las dudas más comunes.', etiquetas: 'faq, preguntas', tipo: 'faq' },
  { sec: 'transversales', slug: 'contactos-y-proveedores', titulo: 'Contactos y proveedores',
    resumen: 'Directorio de contactos internos y proveedores de TI.', etiquetas: 'contactos, proveedores, directorio', tipo: 'contactos' }
];

/** Estructura estándar de un artículo nuevo, con marcadores por completar. */
function plantillaBase_() {
  return [
    B.alerta('advertencia', 'Borrador pendiente de contenido. Completa los marcadores **[COMPLETAR: …]**, agrega las capturas y cambia el estado a «En revisión» cuando esté listo.'),
    B.titulo('Objetivo / ¿Qué es?'),
    B.texto('[COMPLETAR: qué es y para qué sirve, en 2 o 3 frases]'),
    B.titulo('Requisitos previos'),
    B.texto('- [COMPLETAR: requisito 1]\n- [COMPLETAR: requisito 2]'),
    B.titulo('Procedimiento paso a paso'),
    B.paso('[COMPLETAR: primer paso]', [B.captura('qué debe verse en este paso')]),
    B.paso('[COMPLETAR: segundo paso]'),
    B.titulo('Problemas comunes y solución'),
    B.texto('- **[COMPLETAR: síntoma]** → [COMPLETAR: solución]'),
    B.titulo('Recursos y enlaces oficiales'),
    B.texto('- [COMPLETAR: enlaces a la documentación oficial]')
  ];
}

function plantillaTransversal_(tipo) {
  if (tipo === 'glosario') {
    return [B.texto('Agrega aquí cada término con su definición. Mantén el orden alfabético.'),
      B.tabla([['Término', 'Definición', 'Área'], ['[COMPLETAR: término]', '[COMPLETAR: definición]', '[COMPLETAR: área]']])];
  }
  if (tipo === 'faq') {
    return [B.texto('Preguntas que se repiten en soporte. Cada una es un desplegable: agrega más desde el editor.'),
      B.desplegable('[COMPLETAR: pregunta frecuente]', '[COMPLETAR: respuesta breve y, si aplica, enlace al artículo completo]')];
  }
  return [B.alerta('advertencia', 'No escribas contraseñas ni claves aquí. Usa el gestor de contraseñas corporativo y deja solo la referencia.'),
    B.titulo('Contactos internos'),
    B.tabla([['Nombre', 'Cargo / área', 'Correo', 'Teléfono'], ['[COMPLETAR]', '[COMPLETAR]', '[COMPLETAR]', '[COMPLETAR]']]),
    B.titulo('Proveedores'),
    B.tabla([['Proveedor', 'Servicio', 'Contacto', 'Soporte / SLA'], ['[COMPLETAR]', '[COMPLETAR]', '[COMPLETAR]', '[COMPLETAR]']])];
}

function sembrarEstructura() {
  Db.invalidar();
  const u = USUARIO_SEMILLA_;
  let nuevas = 0;
  SECCIONES_SEMILLA.forEach(function (s, i) {
    const todas = Db.leer('Secciones');
    if (todas.some(function (x) { return x.slug === s.slug; })) return;
    const padre = s.padre ? todas.find(function (x) { return x.slug === s.padre; }) : null;
    Db.insertar('Secciones', { id: id_('sec'), slug: s.slug, nombre: s.nombre, descripcion: s.descripcion, icono: s.icono, color: s.color,
      orden: String(i + 1), padre_id: padre ? padre.id : '', activa: 'TRUE', creado_en: ahora_(), creado_por: 'instalar' });
    nuevas++;
  });
  let arts = 0;
  ARTICULOS_SEMILLA.forEach(function (a) {
    Db.invalidar();
    if (Db.leer('Articulos').some(function (x) { return x.slug === a.slug; })) return;
    const sec = Db.leer('Secciones').find(function (x) { return x.slug === a.sec; });
    if (!sec) { console.warn('Sección no encontrada para ' + a.slug); return; }
    const bloques = a.tipo ? plantillaTransversal_(a.tipo) : plantillaBase_();
    guardarArticulo_({ seccion_id: sec.id, slug: a.slug, titulo: a.titulo, resumen: a.resumen, etiquetas: a.etiquetas,
      responsable_email: '', estado: 'Borrador' }, bloques, 'Estructura inicial', u, { semilla: true });
    arts++;
  });
  console.log('Estructura: ' + nuevas + ' secciones y ' + arts + ' artículos nuevos.');
}

/** ¿Alguien editó el artículo desde la app? (si es así, la semilla no lo pisa) */
function editadoPorPersona_(articuloId) {
  return Db.leer('Historial').some(function (h) { return h.articulo_id === articuloId && h.usuario !== 'semilla'; });
}

/** Carga contenido (objeto slug → {resumen?, etiquetas?, bloques}) en artículos existentes que nadie haya editado. */
function sembrarContenido_(contenidos) {
  Db.invalidar();
  let ok = 0, omitidos = 0;
  Object.keys(contenidos).forEach(function (slug) {
    const def = contenidos[slug];
    const art = Db.leer('Articulos').find(function (x) { return x.slug === slug; });
    if (!art) { console.warn('No existe el artículo «' + slug + '». Ejecuta sembrarEstructura().'); return; }
    if (editadoPorPersona_(art.id)) { console.log('Omitido (ya editado en la app): ' + slug); omitidos++; return; }
    guardarArticulo_({ id: art.id, seccion_id: art.seccion_id, titulo: art.titulo, resumen: def.resumen || art.resumen,
      etiquetas: def.etiquetas || art.etiquetas, responsable_email: art.responsable_email, estado: 'Borrador' },
    def.bloques, 'Borrador inicial con contenido', USUARIO_SEMILLA_, { semilla: true });
    ok++;
  });
  console.log('Contenido cargado: ' + ok + ' artículos' + (omitidos ? ', omitidos: ' + omitidos : '') + '.');
}
