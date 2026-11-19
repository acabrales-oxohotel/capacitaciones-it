/**
 * OxoPedia · Esquema de la base de datos (pestañas y columnas de Google Sheets).
 * La primera columna de cada hoja es la clave. Todas las celdas se guardan como texto.
 * Booleanos: 'TRUE' / 'FALSE'. Fechas: 'yyyy-MM-dd HH:mm:ss' (hora de Bogotá).
 */
const ESQUEMA = {
  Secciones: ['id', 'slug', 'nombre', 'descripcion', 'icono', 'color', 'orden', 'padre_id', 'activa', 'creado_en', 'creado_por'],
  Articulos: ['id', 'seccion_id', 'slug', 'titulo', 'resumen', 'etiquetas', 'responsable_email', 'estado',
    'fecha_creacion', 'fecha_revision', 'validado_por', 'version', 'orden', 'destacado', 'tiempo_lectura_min',
    'indice_busqueda', 'activo', 'actualizado_en', 'actualizado_por'],
  Bloques: ['id', 'articulo_id', 'padre_id', 'orden', 'tipo', 'contenido', 'config_json', 'actualizado_en'],
  Recursos: ['id', 'articulo_id', 'bloque_id', 'tipo', 'titulo', 'url', 'drive_id', 'mime', 'tamano_kb', 'subido_por', 'subido_en', 'activo'],
  Historial: ['id', 'fecha', 'articulo_id', 'usuario', 'accion', 'resumen', 'version', 'estado_anterior', 'estado_nuevo', 'snapshot_file_id'],
  Usuarios: ['email', 'nombre', 'rol', 'activo', 'ultimo_acceso', 'creado_en', 'creado_por'],
  Configuracion: ['clave', 'valor', 'descripcion']
};

const ANCHOS_ = { id: 110, slug: 190, nombre: 200, titulo: 280, descripcion: 320, resumen: 320, contenido: 420,
  config_json: 260, indice_busqueda: 260, etiquetas: 180, email: 220, responsable_email: 220, url: 300, valor: 320, clave: 200 };
