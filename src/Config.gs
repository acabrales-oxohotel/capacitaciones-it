/**
 * OxoPedia · Constantes y parámetros editables.
 * Los IDs de la hoja y de la carpeta de Drive se pueden sobrescribir con Propiedades del script
 * (SHEET_ID, CARPETA_ID, GITHUB_REPO, GITHUB_RAMA) sin tocar el código.
 */

const APP = { NOMBRE: 'OxoPedia', VERSION: '1.0.0', ZONA: 'America/Bogota' };

const DEFECTOS = {
  SHEET_ID: '1TMcYYHnbHqsGq_lYOyvF5mpMq1HnXDUQwGg_d_MvMPo',
  CARPETA_ID: '1t2T24QF832VgGZcejw0of9jjEzup_kUV',
  GITHUB_REPO: 'acabrales-oxohotel/capacitaciones-it',
  GITHUB_RAMA: 'main'
};

const ROLES = { ADMIN: 'Administrador', LECTOR: 'Lector' };
const ESTADOS = ['Borrador', 'En revisión', 'Validado'];
const TIPOS_BLOQUE = ['titulo', 'texto', 'paso', 'imagen', 'codigo', 'alerta', 'enlace', 'adjunto',
  'checklist', 'tabla', 'desplegable', 'separador'];

/** [clave, valor, descripción] — se siembran en la hoja «Configuracion» (solo las que falten). */
const CONFIG_INICIAL = [
  ['nombre_app', 'OxoPedia', 'Nombre que se muestra en la cabecera'],
  ['dominio', 'oxohotel.com', 'Dominio de Google Workspace permitido'],
  ['auto_registro', 'SI', 'SI = quien entra con correo del dominio queda como Lector automáticamente'],
  ['dias_para_revisar', '180', 'Días tras los cuales un artículo validado se marca «por revisar»'],
  ['max_upload_mb', '10', 'Tamaño máximo por archivo subido (MB)'],
  ['imagenes_modo', 'proxy', 'proxy = imágenes de un repositorio privado servidas por la app; cdn = repositorio público vía jsDelivr'],
  ['logo_url', '', 'URL del logo de OxoHotel (vacío = se muestra solo el nombre)']
];

function prop_(clave) {
  return PropertiesService.getScriptProperties().getProperty(clave) || '';
}
function sheetId_() { return prop_('SHEET_ID') || DEFECTOS.SHEET_ID; }
function carpetaId_() { return prop_('CARPETA_ID') || DEFECTOS.CARPETA_ID; }

/** Lee un parámetro de la hoja Configuracion (con valor inicial como respaldo). */
function config_(clave) {
  let fila = null;
  try { fila = Db.leer('Configuracion').find(function (c) { return c.clave === clave; }); } catch (e) { /* hoja aún no creada */ }
  if (fila) return fila.valor;
  const ini = CONFIG_INICIAL.find(function (c) { return c[0] === clave; });
  return ini ? ini[1] : '';
}
