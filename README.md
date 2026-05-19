# Sistema de Recuperación de Información Multimedia

Aplicación web fullstack para subir, clasificar automáticamente y buscar archivos multimedia mediante TF-IDF y similitud coseno.

---

## Estructura del proyecto

```
proyecto/
├── src/                  # Frontend React
├── server/               # Backend Node.js
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── tessdata/         # Modelos OCR locales
│   └── index.js
├── package.json          # Dependencias frontend
└── server/package.json   # Dependencias backend
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18
- npm v9 o superior

---

## Instalación y ejecución

### 1. Clonar o descomprimir el proyecto

```bash
cd proyecto
```

### 2. Instalar dependencias del frontend

```bash
# Desde la raíz del proyecto
npm install
```

### 3. Instalar dependencias del backend

```bash
cd server
npm install
```

### 4. Descargar modelos OCR (solo la primera vez)

Crea la carpeta `server/tessdata/` y descarga los dos archivos:

- **Español:** https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata
- **Inglés:** https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata

```
server/
  tessdata/
    spa.traineddata
    eng.traineddata
```

### 5. Ejecutar el backend

```bash
# Desde server/
node index.js
# Servidor corriendo en http://localhost:3001
```

### 6. Ejecutar el frontend

```bash
# Desde la raíz del proyecto (nueva terminal)
npm start
# App corriendo en http://localhost:3000
```

---

## Dependencias Frontend

| Librería | Versión | Uso |
|---|---|---|
| `react` | ^19.2.6 | Framework principal de UI |
| `react-dom` | ^19.2.6 | Renderizado en el DOM |
| `react-router-dom` | ^7.15.1 | Navegación entre páginas (Login, Admin, Viewer) |
| `axios` | ^1.16.1 | Peticiones HTTP al backend |
| `react-scripts` | 5.0.1 | Scripts de desarrollo y build (Create React App) |
| `web-vitals` | ^2.1.4 | Métricas de rendimiento |
| `@testing-library/react` | ^16.3.2 | Tests de componentes React |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers adicionales para Jest |
| `@testing-library/user-event` | ^13.5.0 | Simulación de eventos de usuario en tests |
| `@testing-library/dom` | ^10.4.1 | Utilidades DOM para tests |

---

## Dependencias Backend

### Servidor y autenticación

| Librería | Versión | Uso |
|---|---|---|
| `express` | ^5.2.1 | Framework HTTP, definición de rutas REST |
| `cors` | ^2.8.6 | Habilita peticiones cross-origin desde el frontend |
| `multer` | ^2.1.1 | Manejo de subida de archivos multipart/form-data |
| `jsonwebtoken` | ^9.0.3 | Generación y verificación de tokens JWT para autenticación |
| `bcrypt` | ^6.0.0 | Hash seguro de contraseñas de usuarios |
| `sqlite3` | ^6.0.1 | Base de datos embebida para almacenamiento de metadatos |

### Extracción de texto de documentos

| Librería | Versión | Uso |
|---|---|---|
| `pdf-parse` | ^1.1.1 | Extracción de texto de archivos PDF |
| `mammoth` | ^1.12.0 | Extracción de texto de archivos Word modernos (`.docx`) |
| `word-extractor` | ^1.0.4 | Extracción de texto de archivos Word antiguos (`.doc`) |
| `xlsx` | ^0.18.5 | Lectura y extracción de texto de hojas de cálculo (`.xlsx`, `.xls`) |

### OCR e imágenes

| Librería | Versión | Uso |
|---|---|---|
| `tesseract.js` | ^7.0.0 | OCR para extracción de texto en imágenes y documentos escaneados |
| `sharp` | ^0.34.5 | Procesamiento y optimización de imágenes |

### Recuperación de información

| Librería | Versión | Uso |
|---|---|---|
| `natural` | ^8.1.1 | Herramientas de NLP: tokenización y stemming |
| `ml-kmeans` | ^7.0.0 | Algoritmo K-Means para clustering de documentos |
| `keyword-extractor` | ^0.0.28 | Extracción de palabras clave (instalada, actualmente en desuso) |

### Multimedia

| Librería | Versión | Uso |
|---|---|---|
| `fluent-ffmpeg` | ^2.1.3 | Procesamiento de archivos de video y audio |
| `ffmpeg-static` | ^5.3.0 | Binario estático de FFmpeg empaquetado con el proyecto |

### IA (instalada, uso experimental)

| Librería | Versión | Uso |
|---|---|---|
| `@xenova/transformers` | ^2.17.2 | Modelos de lenguaje transformer para embeddings semánticos |

---

## Variables de entorno

Crea un archivo `.env` dentro de `server/` con el siguiente contenido:

```env
JWT_SECRET=tu_clave_secreta_aqui
PORT=3001
```

---

## Formatos de archivo soportados

| Tipo | Extensiones |
|---|---|
| Imágenes | jpg, jpeg, png, webp, gif |
| Videos | mp4, webm, ogg |
| Audios | mp3, wav, ogg, m4a |
| Documentos | pdf, doc, docx, xls, xlsx, ppt, pptx |

**Tamaño máximo por archivo:** 200 MB

---

## Roles de usuario

| Rol | Subir | Eliminar | Buscar | Descargar |
|---|---|---|---|---|
| Administrador | ✓ | ✓ | ✓ | ✓ |
| Visualizador | ✗ | ✗ | ✓ | ✓ |

---

## Modelo de recuperación

El sistema usa **TF-IDF + Similitud Coseno** para clasificar y buscar documentos:

1. Al subir un archivo se extrae el texto y se calculan las keywords por frecuencia de término.
2. En cada búsqueda se vectorizan la consulta y los documentos con TF-IDF.
3. Se calcula la similitud coseno y se aplica un boost por coincidencia en nombre, keywords y categoría.
4. Los resultados se ordenan por relevancia descendente.

---

## Notas

- `keyword-extractor` está instalado pero no se usa activamente; la extracción de keywords se realiza con TF-IDF propio.
- `@xenova/transformers` está instalado para uso futuro con embeddings semánticos.
- Los modelos OCR (`spa.traineddata`, `eng.traineddata`) deben descargarse manualmente y colocarse en `server/tessdata/` antes de la primera ejecución.