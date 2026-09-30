# Sistema de Recuperación de Información Multimedia

Aplicación web fullstack desarrollada para la **gestión, clasificación y recuperación de archivos multimedia**. El sistema permite subir documentos, imágenes, videos y audios, extraer información de su contenido y realizar búsquedas basadas en **TF-IDF y similitud coseno**.

## Características

* Autenticación de usuarios mediante JWT.
* Control de acceso mediante roles.
* Carga y gestión de archivos multimedia.
* Búsqueda de archivos por contenido y palabras clave.
* Clasificación de documentos mediante técnicas de Recuperación de Información.
* Cálculo de relevancia mediante TF-IDF y similitud coseno.
* Extracción de texto de documentos.
* OCR para extracción de texto desde imágenes.
* Soporte para archivos de audio.
* Soporte para archivos de video.
* Descarga de archivos almacenados.
* Persistencia de información mediante SQLite.

## Tecnologías

### Frontend

* React
* React Router
* Axios
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express
* SQLite
* JWT
* Multer
* bcrypt

### Procesamiento de información

* TF-IDF
* Similitud Coseno
* Natural
* K-Means
* Tesseract.js
* Sharp

### Multimedia

* FFmpeg
* fluent-ffmpeg

## Estructura del proyecto

```text
Proyecto-RI/
│
├── public/                  # Archivos públicos del frontend
│
├── src/                     # Aplicación frontend en React
│   ├── components/          # Componentes reutilizables
│   ├── pages/               # Vistas de la aplicación
│   ├── services/            # Comunicación con el backend
│   └── ...
│
├── server/                  # Backend de la aplicación
│   ├── config/              # Configuración
│   ├── middleware/          # Middleware de autenticación y seguridad
│   ├── routes/              # Rutas de la API REST
│   ├── utils/               # Funciones auxiliares y procesamiento
│   ├── uploads/             # Archivos cargados
│   ├── tessdata/            # Modelos de idioma para OCR
│   └── index.js             # Punto de entrada del servidor
│
├── package.json             # Dependencias y scripts del frontend
└── server/package.json      # Dependencias del backend
```

## Formatos soportados

El sistema permite trabajar con diferentes tipos de archivos:

| Tipo       | Formatos                             |
| ---------- | ------------------------------------ |
| Imágenes   | JPG, JPEG, PNG, WEBP, GIF            |
| Videos     | MP4, WEBM, OGG                       |
| Audios     | MP3, WAV, OGG, M4A                   |
| Documentos | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX |

**Tamaño máximo:** 200 MB por archivo.

## Roles de usuario

| Función            | Administrador | Visualizador |
| ------------------ | :-----------: | :----------: |
| Subir archivos     |       ✓       |       ✗      |
| Eliminar archivos  |       ✓       |       ✗      |
| Buscar archivos    |       ✓       |       ✓      |
| Descargar archivos |       ✓       |       ✓      |

## Recuperación de información

El sistema utiliza técnicas de **Recuperación de Información (RI)** para determinar la relevancia de los resultados.

El proceso general es:

1. El usuario carga un archivo.
2. El sistema extrae el contenido disponible.
3. Se identifican términos relevantes mediante TF-IDF.
4. Las consultas del usuario se convierten en vectores.
5. Se calcula la similitud coseno entre la consulta y los documentos.
6. Los resultados se ordenan de acuerdo con su relevancia.

Además, el sistema considera coincidencias en elementos como el nombre del archivo, palabras clave y categoría.

## Requisitos

* Node.js 18 o superior
* npm 9 o superior

## Instalación

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` dentro de `server/`:

```env
JWT_SECRET=tu_clave_secreta
PORT=3001
```

### 4. Configurar OCR

Crear la carpeta:

```text
server/tessdata/
```

Colocar dentro los modelos de idioma:

```text
spa.traineddata
eng.traineddata
```

Estos modelos son necesarios para el reconocimiento de texto mediante OCR.

## Ejecución

### Backend

Desde la carpeta `server/`:

```bash
node index.js
```

El servidor estará disponible en:

```text
http://localhost:3001
```

### Frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Seguridad

El sistema implementa:

* Autenticación mediante JWT.
* Contraseñas almacenadas mediante hash con bcrypt.
* Control de acceso basado en roles.
* Validación de archivos.
* Separación entre frontend y backend mediante una API REST.

## Notas

* Los modelos OCR deben colocarse manualmente en `server/tessdata/`.
* `keyword-extractor` se encuentra instalado como dependencia, pero la extracción actual de palabras clave se realiza mediante TF-IDF.
* `@xenova/transformers` se encuentra preparado para futuras implementaciones de embeddings semánticos.
* Los archivos cargados se almacenan en `server/uploads/`.

