//SE IMPORTAN LAS LIBRERIAS NECESARIAS
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//SE IMPORTA LA BASE DE DATOS
const db = require("../config/db");

//SE IMPORTA EL MIDDLEWARE PARA VALIDAR EL TOKEN
const verificarToken = require("../middleware/auth");

//SE IMPORTAN LAS FUNCIONES PARA EXTRAER TEXTO Y HACER BUSQUEDAS
const textExtractor = require("../utils/textExtractor");
const sorter = require("../utils/sorter");
const extraerTextoImagen = require("../utils/ocr");
const { tfidfSearch } = require("../utils/searchEngine");
const { fileTypeFromFile } = require("file-type");

//SE CREA EL ROUTER
const router = express.Router();

//SE CREA LA CARPETA UPLOADS SI NO EXISTE
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

//CONFIGURACION PARA GUARDAR LOS ARCHIVOS
const storage = multer.diskStorage({

    //CARPETA DONDE SE GUARDAN
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },

    //SE CREA UN NOMBRE UNICO
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const allowedMimeTypes = [
    // DOCUMENTOS
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // IMAGENES
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",

    // VIDEOS
    "video/mp4",
    "video/webm",

    // AUDIOS
    "audio/mpeg",   // .mp3
    "audio/mp3",    // .mp3 alternativo que envían algunos navegadores
    "audio/wav",    // .wav
    "audio/x-wav",  // .wav alternativo
    "audio/ogg",    // .ogg
    "audio/mp4",    // .m4a
    "audio/m4a",    // .m4a alternativo
    "audio/x-m4a",  // .m4a alternativo
    "audio/ogg",
    "audio/opus",           // ← OGG Opus de WhatsApp
    "audio/ogg; codecs=opus" // ← algunos navegadores envían esto
];

//EXTENSIONES PERMITIDAS
const allowedExtensions = [
    ".pdf",
    ".doc", ".docx",
    ".xls", ".xlsx",
    ".ppt", ".pptx",
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".mp4", ".webm", ".ogg",
    ".mp3", ".wav", ".m4a"
];

//GRUPOS DE MIME TYPES POR CATEGORIA PARA VALIDAR CONTENIDO REAL
const GRUPOS = {
    imagen: ["image/jpeg","image/png","image/gif","image/webp","image/bmp","image/svg+xml"],
    video:  ["video/mp4","video/webm","video/ogg","video/quicktime","video/x-msvideo"],
    audio:  ["audio/mpeg","audio/wav", "audio/x-wav", "audio/ogg", "audio/vorbis","audio/mp4","audio/x-m4a","audio/aac", 
                "video/mp4", "audio/ogg","audio/opus", "audio/ogg; codecs=opus",],
    doc:    [
        "application/pdf",
        "application/zip", // docx, xlsx, pptx son ZIP internamente
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.ms-powerpoint",
        "application/x-cfb", // .doc/.xls/.ppt formato OLE antiguo
    ]
};

//MAPA DE EXTENSION A GRUPO ESPERADO
const EXT_GRUPO = {
    ".jpg": "imagen", ".jpeg": "imagen", ".png": "imagen",
    ".gif": "imagen", ".webp": "imagen",
    ".mp4": "video",  ".webm": "video",  ".ogg": "audio",
    ".mp3": "audio",  ".wav":  "audio",  ".m4a": "audio",
    ".pdf": "doc",    ".doc":  "doc",    ".docx": "doc",
    ".xls": "doc",    ".xlsx": "doc",    ".ppt":  "doc", ".pptx": "doc",
};

//EXTENSIONES OLE ANTIGUAS QUE FILE-TYPE NO DETECTA BIEN
const EXTENSIONES_OLE = [".doc", ".xls", ".ppt"];

//CONFIGURACION DE MULTER — SOLO VALIDA MIME Y EXTENSION BASICA
const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const tipo = file.mimetype;
        const ext  = path.extname(file.originalname).toLowerCase();

        const mimeValido      = allowedMimeTypes.includes(tipo);
        const extensionValida = allowedExtensions.includes(ext);

        if (mimeValido && extensionValida) {
            cb(null, true);
        } else {
            cb(new Error("Tipo de archivo no permitido"), false);
        }
    },

    //LIMITE DE TAMAÑO
    limits: {
        fileSize: 1024 * 1024 * 200
    }
});

//RUTA PARA SUBIR ARCHIVOS
router.post(
    "/upload",
    verificarToken,
    upload.single("archivo"),
    async (req, res) => {

        try {

            //SE VERIFICA QUE EXISTA UN ARCHIVO
            if (!req.file) {
                return res.json({ error: "No se recibió archivo" });
            }

            const nombre = req.file.originalname;
            const ruta   = req.file.path.replace(/\\/g, "/");
            const tipo   = req.file.mimetype;
            const ext    = path.extname(nombre).toLowerCase();

            // ── VALIDACION DE CONTENIDO REAL CON FILE-TYPE ──
            // SE EJECUTA DESPUES DE QUE MULTER GUARDA EL ARCHIVO
            const grupoEsperado = EXT_GRUPO[ext];
            const tipoReal      = await fileTypeFromFile(ruta);

            if (grupoEsperado) {

                if (tipoReal) {

                    // SE VERIFICA QUE EL CONTENIDO REAL COINCIDA CON EL GRUPO
                    const mimesPermitidos = GRUPOS[grupoEsperado];

                    if (!mimesPermitidos.includes(tipoReal.mime)) {
                        fs.unlink(ruta, () => {});
                        return res.json({
                            error: `Archivo inválido: la extensión ${ext} no corresponde al contenido real del archivo.`
                        });
                    }

                } else {

                    // FILE-TYPE NO RECONOCIO EL FORMATO
                    // SOLO SE ACEPTA SI ES EXTENSION OLE ANTIGUA (.doc, .xls, .ppt)
                    if (!EXTENSIONES_OLE.includes(ext)) {
                        fs.unlink(ruta, () => {});
                        return res.json({
                            error: `Archivo inválido: no se pudo verificar el contenido de ${ext}.`
                        });
                    }
                }
            }

            let texto = "";

            //SE INTENTA EXTRAER TEXTO
            try {
                texto = await textExtractor(ruta, tipo);
            } catch (e) {
                console.log("No se pudo extraer texto:", e.message);
            }

            //SE USA OCR PARA IMAGENES
            if (tipo.includes("image")) {
                try {
                    const textoOCR = await extraerTextoImagen(ruta);
                    texto += " " + textoOCR;
                } catch (e) {
                    console.log("Error OCR:", e.message);
                }
            }

            //FUNCION PARA DEFINIR LA CATEGORIA BASE
            function categoriaBase(tipo, nombre) {

                const ext = path.extname(nombre).toLowerCase();

                if (tipo.includes("image")) return "Imagen";
                if (tipo.includes("video")) return "Video";
                if (tipo.includes("audio")) return "Audio";
                if (tipo.includes("pdf") || ext === ".pdf") return "Documento";
                if (ext === ".doc"  || ext === ".docx" || tipo.includes("wordprocessingml") || tipo.includes("msword")) return "Documento";
                if (ext === ".xls"  || ext === ".xlsx" || tipo.includes("spreadsheetml") || tipo.includes("ms-excel")) return "Hoja de cálculo";
                if (ext === ".ppt"  || ext === ".pptx" || tipo.includes("presentationml") || tipo.includes("ms-powerpoint")) return "Presentación";

                return "General";
            }

            //SE CREA UNA CLASIFICACION BASICA
            let resultado = {
                categoria: categoriaBase(tipo, nombre),
                keywords: "",
                descripcion: nombre,
            };

            //SI EL ARCHIVO TIENE TEXTO SE CLASIFICA CON TFIDF
            if (texto && texto.trim().length > 10) {
                resultado = sorter(texto);
            }

            //SE GUARDA EN LA BASE DE DATOS
            db.run(
                `INSERT INTO archivos(
                    nombre, ruta, tipo,
                    keywords, categoria, descripcion,
                    usuario_id
                ) VALUES (?,?,?,?,?,?,?)`,
                [
                    nombre, ruta, tipo,
                    resultado.keywords,
                    resultado.categoria,
                    resultado.descripcion,
                    req.user.id
                ],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.json({ error: "Error SQL" });
                    }
                    res.json({ mensaje: "Archivo subido correctamente" });
                }
            );

        } catch (error) {
            console.log(error);
            res.json({ error: "Error upload" });
        }
    }
);

//RUTA PARA BUSCAR ARCHIVOS PRIVADOS
router.get("/buscar", verificarToken, (req, res) => {

    const q = req.query.q || "";

    db.all(
        `SELECT * FROM archivos WHERE usuario_id = ?`,
        [req.user.id],
        (err, rows) => {

            if (err) {
                console.log(err);
                return res.json([]);
            }

            if (!q.trim()) return res.json(rows);

            const results = tfidfSearch(q, rows);
            return res.json(results);
        }
    );
});

//RUTA PARA BUSQUEDA PUBLICA
router.get("/buscar-publico", (req, res) => {

    const q = req.query.q || "";

    db.all(`SELECT * FROM archivos`, [], (err, rows) => {

        if (err) return res.json([]);

        if (!q.trim()) return res.json(rows);

        const results = tfidfSearch(q, rows);
        return res.json(results);
    });
});

//RUTA PARA SUGERENCIAS DE AUTOCOMPLETADO
router.get("/sugerencias", (req, res) => {

    const q = (req.query.q || "").toLowerCase().trim();

    if (!q || q.length < 2) return res.json([]);

    const sql = `
        SELECT nombre, keywords, categoria
        FROM archivos
        WHERE
            LOWER(nombre)    LIKE ? OR
            LOWER(keywords)  LIKE ? OR
            LOWER(categoria) LIKE ?
        LIMIT 50
    `;

    const param = `%${q}%`;

    db.all(sql, [param, param, param], (err, rows) => {

        if (err) return res.json([]);

        const palabras = new Set();

        rows.forEach(row => {
            const campos = [
                row.nombre    || "",
                row.keywords  || "",
                row.categoria || ""
            ].join(" ");

            campos
                .toLowerCase()
                .split(/[\s,]+/)
                .filter(p => p.length > 2 && p.includes(q))
                .forEach(p => palabras.add(p));
        });

        rows.forEach(row => {
            if (row.nombre && row.nombre.toLowerCase().includes(q)) {
                palabras.add(row.nombre.toLowerCase());
            }
        });

        const sugerencias = Array.from(palabras)
            .sort((a, b) => {
                const aEmpieza = a.startsWith(q) ? 0 : 1;
                const bEmpieza = b.startsWith(q) ? 0 : 1;
                return aEmpieza - bEmpieza || a.localeCompare(b);
            })
            .slice(0, 8);

        res.json(sugerencias);
    });
});

//RUTA PARA DESCARGAR ARCHIVOS
router.get("/download/:id", (req, res) => {

    db.get(`SELECT * FROM archivos WHERE id = ?`, [req.params.id], (err, row) => {

        if (!row) return res.json({ error: "No encontrado" });

        res.download(row.ruta, row.nombre);
    });
});

//RUTA PARA ELIMINAR ARCHIVOS
router.delete("/eliminar/:id", verificarToken, (req, res) => {

    db.get(
        `SELECT * FROM archivos WHERE id = ? AND usuario_id = ?`,
        [req.params.id, req.user.id],
        (err, row) => {

            if (!row) return res.json({ error: "No encontrado" });

            fs.unlink(row.ruta, () => {
                db.run(`DELETE FROM archivos WHERE id = ?`, [req.params.id]);
                res.json({ mensaje: "Eliminado" });
            });
        }
    );
});

//RUTA PARA PREVISUALIZAR ARCHIVOS
router.get("/preview/:id", (req, res) => {

    db.get(`SELECT * FROM archivos WHERE id = ?`, [req.params.id], async (err, row) => {

        if (!row) return res.json({ error: "Archivo no encontrado" });

        const ext = row.nombre.split(".").pop().toLowerCase();

        try {

            //PREVISUALIZACION PDF
            if (ext === "pdf") {
                return res.json({
                    tipo: "pdf",
                    url: `http://localhost:3001/${row.ruta}`
                });
            }

            //PREVISUALIZACION DOCX
            if (ext === "docx") {
                const mammoth = require("mammoth");
                const result  = await mammoth.convertToHtml({ path: row.ruta });
                return res.json({ tipo: "html", html: result.value });
            }

            //PREVISUALIZACION DOC
            if (ext === "doc") {
                const WordExtractor = require("word-extractor");
                const extractor     = new WordExtractor();
                const doc           = await extractor.extract(row.ruta);
                const texto         = doc.getBody() || "";
                const html = texto
                    .split(/\n+/)
                    .filter(l => l.trim())
                    .map(l => `<p>${l}</p>`)
                    .join("");
                return res.json({ tipo: "html", html });
            }

            //PREVISUALIZACION EXCEL
            if (ext === "xlsx" || ext === "xls") {
                const XLSX     = require("xlsx");
                const workbook = XLSX.readFile(row.ruta);
                const hojas = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    const html  = XLSX.utils.sheet_to_html(sheet);
                    return `<h3 style="margin:16px 0 8px;color:#1d4ed8">${name}</h3>${html}`;
                }).join("<hr/>");
                return res.json({ tipo: "html", html: hojas });
            }

            //PREVISUALIZACION POWERPOINT
            if (ext === "pptx" || ext === "ppt") {
                const officeparser = require("officeparser");
                
                const texto = await officeparser.parseOfficeAsync(row.ruta);
                
                // Convertir el texto extraído a diapositivas separadas por saltos
                const html = texto
                    .split(/\n{2,}/)
                    .filter(bloque => bloque.trim())
                    .map((bloque, i) => `
                        <div class="slide">
                            <div class="slide-numero">Diapositiva ${i + 1}</div>
                            <div class="slide-contenido">
                                ${bloque
                                    .split(/\n/)
                                    .filter(l => l.trim())
                                    .map(l => `<p>${l}</p>`)
                                    .join("")
                                }
                            </div>
                        </div>
                    `)
                    .join("");

                return res.json({ tipo: "html", html });
            }

            return res.json({ error: "Formato no soportado" });

        } catch (e) {
            console.error("[preview]", e.message);
            return res.json({ error: "Error al generar la previsualizacion" });
        }
    });
});

//SE EXPORTAN LAS RUTAS
module.exports = router;