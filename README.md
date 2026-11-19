# OxoPedia · Gestión del conocimiento de TI de OxoHotel

Plataforma interna para documentar procesos de soporte y desarrollo, capacitar a nuevo personal de TI y consultar manuales a diario.

- **Aplicación:** Web App de Google Apps Script (HtmlService), acceso restringido al dominio de Workspace.
- **Base de datos:** Google Sheets (7 pestañas).
- **Imágenes y capturas:** carpeta `media/` de este repositorio de GitHub (el editor las sube con la API de GitHub).
- **Adjuntos descargables y copias de versión:** carpeta de Drive de OxoPedia.
- **Código:** `src/` (lo que `clasp push` sube a Apps Script).

## Estructura

```
.clasp.json            scriptId y rootDir = src   (.clasp.json.example: plantilla)
README.md
media/                 imágenes de los artículos (las crea la app; no editar a mano)
docs/                  material de referencia (no se sube a Apps Script)
src/
  appsscript.json      zona horaria, permisos y despliegue (ejecutar como quien despliega · acceso: dominio)
  Code.gs              doGet y api() — única puerta de entrada, valida sesión y rol
  Config.gs  Utils.gs  Schema.gs  Db.gs  Auth.gs
  Secciones.gs  Articulos.gs  Historial.gs  Inicio.gs  Admin.gs
  Drive.gs             adjuntos y copias de versión
  GitHub.gs            subida y lectura de imágenes
  Instalar.gs          instalar() y diagnostico()
  Semilla_Estructura.gs        8 secciones + 5 subsecciones + 28 artículos (Borrador)
  Semilla_01_Conectividad.gs   contenido del lote 1
  Index.html  Estilos.html  Js*.html    interfaz
```

## Modelo de datos (Google Sheets)

| Hoja | Columnas |
|---|---|
| **Secciones** | id, slug, nombre, descripcion, icono, color, orden, padre_id, activa, creado_en, creado_por |
| **Articulos** | id, seccion_id, slug, titulo, resumen, etiquetas, responsable_email, estado, fecha_creacion, fecha_revision, validado_por, version, orden, destacado, tiempo_lectura_min, indice_busqueda, activo, actualizado_en, actualizado_por |
| **Bloques** | id, articulo_id, padre_id, orden, tipo, contenido, config_json, actualizado_en |
| **Recursos** | id, articulo_id, bloque_id, tipo, titulo, url, drive_id, mime, tamano_kb, subido_por, subido_en, activo |
| **Historial** | id, fecha, articulo_id, usuario, accion, resumen, version, estado_anterior, estado_nuevo, snapshot_file_id |
| **Usuarios** | email, nombre, rol, activo, ultimo_acceso, creado_en, creado_por |
| **Configuracion** | clave, valor, descripcion |

Tipos de bloque: `titulo`, `texto`, `paso` (con bloques hijos), `imagen`, `codigo`, `alerta`, `enlace`, `adjunto`, `checklist`, `tabla`, `desplegable`, `separador`.

## Despliegue

Requisitos: Node.js, `clasp` (`npm i -g @google/clasp`) y la API de Apps Script activada en <https://script.google.com/home/usersettings>.

```bash
clasp login                 # una sola vez
clasp push                  # sube src/ al proyecto de Apps Script
clasp deploy -d "OxoPedia"  # crea la implementación (o: Implementar → Nueva implementación en el editor)
clasp open                  # abre el editor
```

> Cada vez que cambies el código: `clasp push` y luego **nueva versión de la implementación** (`clasp deploy -i <ID_IMPLEMENTACION>` o Implementar → Administrar implementaciones → Editar → Nueva versión). Si no, la URL sigue sirviendo la versión anterior.

### Primera puesta en marcha (en el editor de Apps Script)

1. **Propiedades del script** (⚙ Configuración del proyecto → Propiedades del script):
   | Propiedad | Valor |
   |---|---|
   | `GITHUB_TOKEN` | token fine-grained de GitHub (ver más abajo) |
   | `ADMIN_CORREO` | *(opcional)* correos adicionales de administradores, separados por coma |
   | `SHEET_ID`, `CARPETA_ID`, `GITHUB_REPO`, `GITHUB_RAMA` | *(opcionales)* solo si quieres cambiar los valores de `Config.gs` |
2. Ejecuta **`instalar()`**: crea las pestañas, las subcarpetas de Drive, da de alta como administrador a quien la ejecuta y siembra secciones y artículos. Acepta los permisos. Es seguro repetirla.
3. Ejecuta **`diagnostico()`** y revisa el registro: debe mostrar ✔ en hojas, carpeta de Drive, administradores y GitHub.
4. Ejecuta **`sembrarLote1()`** para cargar el contenido borrador de la sección «Conectividad y acceso remoto».
5. **Implementar → Nueva implementación → Aplicación web** — *Ejecutar como: yo* · *Quién tiene acceso: cualquier persona de oxohotel.com*. Comparte la URL `/exec`.

Quien entre con su cuenta del dominio queda como **Lector**. Para dar permisos de edición: *Gestión → Usuarios*.

### Imágenes en GitHub

1. GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*.
2. Acceso a **solo** el repositorio `capacitaciones-it`; permiso **Contents: Read and write**.
3. Guarda el token en la propiedad `GITHUB_TOKEN` (nunca en el código ni en el repositorio).

Modos de lectura (*Gestión → Configuración → `imagenes_modo`*):

| Modo | Cuándo | Cómo funciona |
|---|---|---|
| `proxy` (por defecto) | Repositorio **privado** | La app lee la imagen del repositorio con el token y la entrega al navegador. Las capturas se comprimen a WebP (máx. 1600 px) antes de subir y se guardan en caché. |
| `cdn` | Repositorio **público** | El navegador la pide directo a jsDelivr: más rápido, pero **cualquier persona con el enlace** puede verla. |

> ⚠ Las capturas de sistemas internos pueden mostrar nombres de servidores, IPs o datos de huéspedes. No uses el modo `cdn` (ni hagas público el repositorio) sin revisar antes ese material.

## Cómo agregar contenido (sin tocar código)

**Nueva sección:** menú lateral → *Gestión → Nueva sección* (nombre, color de acento, ícono, y opcionalmente una sección superior). Se puede reordenar y editar cuando quieras.

**Nuevo artículo:** *Nuevo artículo* (o el botón dentro de la sección). Completa título, sección, resumen, etiquetas y responsable, y arma el contenido con bloques:

- **Paso:** se numeran solos (la numeración reinicia en cada título). Dentro de un paso puedes agregar imagen, código, alerta, texto o enlace.
- **Imagen:** clic, arrastrar o **pegar con Ctrl+V** una captura. Se sube a `media/` en GitHub.
- **Código:** bloque con botón *Copiar*.
- **Alerta:** nota, advertencia o importante.
- **Enlace:** a páginas externas o a carpetas/archivos de Drive.
- **Adjunto:** archivo descargable (se guarda en Drive).
- **Checklist, tabla (columnas con `|`), desplegable (para FAQ).**
- En cualquier texto: `**negrita**`, `*cursiva*`, `` `código` ``, `[texto](https://…)`, listas con `- ` o `1. `, y `[COMPLETAR: qué falta]` para marcar pendientes.

**Flujo de calidad:** `Borrador` → `En revisión` → `Validado`. Al validar se registra fecha y responsable. Los artículos validados con más de `dias_para_revisar` (180) días sin revisión aparecen en *Por revisar* en el Inicio; *Marcar como revisado* renueva la fecha sin editar.

**Historial:** cada guardado genera una versión (con copia en Drive → `_versiones`). Desde *Historial* un administrador puede ver y restaurar versiones anteriores.

## Cargas de contenido por lotes (opcional, para desarrolladores)

El contenido inicial vive en archivos `Semilla_NN_*.gs` y se carga con `sembrarLoteN()`. La carga **nunca pisa** un artículo que ya fue editado desde la app. Para un lote nuevo, copia `Semilla_01_Conectividad.gs`, cambia los `slug` y los bloques, y agrega la función `sembrarLoteN()`.

## Seguridad

- Acceso solo para el dominio de Workspace; el rol se valida **en el servidor** en cada llamada.
- No se escriben contraseñas, IPs ni credenciales en los artículos: usar marcadores `[COMPLETAR: …]` y el gestor de contraseñas.
- El texto de los artículos se escapa antes de mostrarse; los enlaces solo admiten `https://`, `http://` y `mailto:`.
- Los secretos (`GITHUB_TOKEN`) viven únicamente en las Propiedades del script.
