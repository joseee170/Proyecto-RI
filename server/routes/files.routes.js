const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../config/db");
const verificarToken = require("../middleware/auth");

const textExtractor = require("../utils/textExtractor");
const sorter = require("../utils/sorter");
const extraerTextoImagen = require("../utils/ocr");
const { tfidfSearch } = require("../utils/searchEngine");

const router = express.Router();

// CREAR CARPETA UPLOADS SI NO EXISTE
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// =========================
// MULTER CONFIG
// =========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// MIME TYPES PERMITIDOS
const allowedMimeTypes = [

    // PDF
    "application/pdf",

    // WORD
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // EXCEL
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // POWERPOINT
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
    "video/ogg",

    // AUDIOS
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/x-m4a"
];

// EXTENSIONES PERMITIDAS
const allowedExtensions = [

    ".pdf",

    ".doc",
    ".docx",

    ".xls",
    ".xlsx",

    ".ppt",
    ".pptx",

    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",

    ".mp4",
    ".webm",
    ".ogg",

    ".mp3",
    ".wav",
    ".m4a"
];

// CONFIG MULTER
const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const tipo = file.mimetype;

        const ext =
            path.extname(file.originalname).toLowerCase();

        const mimeValido =
            allowedMimeTypes.includes(tipo);

        const extensionValida =
            allowedExtensions.includes(ext);

        if (mimeValido && extensionValida) {

            cb(null, true);

        } else {

            cb(
                new Error("Tipo de archivo no permitido"),
                false
            );
        }
    },

    limits: {
        fileSize: 1024 * 1024 * 200 // 200MB
    }
});

// =========================
// SUBIR ARCHIVO
// =========================

router.post(
    "/upload",
    verificarToken,
    upload.single("archivo"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.json({
                    error: "No se recibió archivo"
                });
            }

            const nombre = req.file.originalname;

            const ruta =
                req.file.path.replace(/\\/g, "/");

            const tipo = req.file.mimetype;

            let texto = "";

            // EXTRAER TEXTO SOLO DE DOCUMENTOS
            try {

                texto = await textExtractor(ruta, tipo);

            } catch (e) {

                console.log(
                    "No se pudo extraer texto:",
                    e.message
                );
            }

            // OCR PARA IMAGENES
            if (tipo.includes("image")) {

                try {

                    const textoOCR =
                        await extraerTextoImagen(ruta);

                    texto += " " + textoOCR;

                } catch (e) {

                    console.log(
                        "Error OCR:",
                        e.message
                    );
                }
            }

            function categoriaBase(tipo, nombre) {
                const ext = path.extname(nombre).toLowerCase();

                if (tipo.includes("image"))                                     return "Imagen";
                if (tipo.includes("video"))                                     return "Video";
                if (tipo.includes("audio"))                                     return "Audio";
                if (tipo.includes("pdf") || ext === ".pdf")                     return "Documento";
                if (ext === ".doc"  || ext === ".docx" ||
                    tipo.includes("wordprocessingml") || tipo.includes("msword")) return "Documento";
                if (ext === ".xls"  || ext === ".xlsx" ||
                    tipo.includes("spreadsheetml") || tipo.includes("ms-excel")) return "Hoja de cálculo";
                if (ext === ".ppt"  || ext === ".pptx" ||
                    tipo.includes("presentationml") || tipo.includes("ms-powerpoint")) return "Presentación";

                return "General";
            }

            // Clasificar solo si hay texto, si no usar la categoría base
            let resultado = {
                categoria: categoriaBase(tipo, nombre),
                keywords: "",
                descripcion: nombre,
            };

            if (texto && texto.trim().length > 10) {
                resultado = sorter(texto);
            }

            if (texto && texto.trim().length > 10) {

                resultado = sorter(texto);
            }

            // GUARDAR EN DB
            db.run(
                `INSERT INTO archivos(
                    nombre,
                    ruta,
                    tipo,
                    keywords,
                    categoria,
                    descripcion,
                    usuario_id
                ) VALUES (?,?,?,?,?,?,?)`,
                [
                    nombre,
                    ruta,
                    tipo,
                    resultado.keywords,
                    resultado.categoria,
                    resultado.descripcion,
                    req.user.id
                ],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.json({
                            error: "Error SQL"
                        });
                    }

                    res.json({
                        mensaje:
                            "Archivo subido correctamente"
                    });
                }
            );

        } catch (error) {

            console.log(error);

            res.json({
                error: "Error upload"
            });
        }
    }
);

// =========================
// BUSCAR PRIVADO
// =========================

router.get(
    "/buscar",
    verificarToken,
    (req, res) => {

        const q = req.query.q || "";

        db.all(
            `SELECT * FROM archivos
             WHERE usuario_id = ?`,
            [req.user.id],
            (err, rows) => {

                if (err) {

                    console.log(err);

                    return res.json([]);
                }

                if (!q.trim()) {

                    return res.json(rows);
                }

                const results =
                    tfidfSearch(q, rows);

                return res.json(results);
            }
        );
    }
);

// =========================
// BUSCAR PUBLICO
// =========================

router.get("/buscar-publico", (req, res) => {

    const q = req.query.q || "";

    db.all(
        `SELECT * FROM archivos`,
        [],
        (err, rows) => {

            if (err) return res.json([]);

            if (!q.trim()) {

                return res.json(rows);
            }

            const results =
                tfidfSearch(q, rows);

            return res.json(results);
        }
    );
});

// =========================
// SUGERENCIAS
// =========================

router.get("/sugerencias", (req, res) => {

    const q =
        (req.query.q || "")
            .toLowerCase()
            .trim();

    if (!q || q.length < 2) {

        return res.json([]);
    }

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

    db.all(
        sql,
        [param, param, param],
        (err, rows) => {

            if (err) return res.json([]);

            const palabras = new Set();

            rows.forEach(row => {

                const campos = [
                    row.nombre || "",
                    row.keywords || "",
                    row.categoria || ""
                ].join(" ");

                campos
                    .toLowerCase()
                    .split(/[\s,]+/)
                    .filter(
                        p =>
                            p.length > 2 &&
                            p.includes(q)
                    )
                    .forEach(
                        p => palabras.add(p)
                    );
            });

            rows.forEach(row => {

                if (
                    row.nombre &&
                    row.nombre
                        .toLowerCase()
                        .includes(q)
                ) {

                    palabras.add(
                        row.nombre.toLowerCase()
                    );
                }
            });

            const sugerencias =
                Array.from(palabras)
                    .sort((a, b) => {

                        const aEmpieza =
                            a.startsWith(q) ? 0 : 1;

                        const bEmpieza =
                            b.startsWith(q) ? 0 : 1;

                        return (
                            aEmpieza - bEmpieza ||
                            a.localeCompare(b)
                        );
                    })
                    .slice(0, 8);

            res.json(sugerencias);
        }
    );
});

// =========================
// DESCARGAR
// =========================

router.get("/download/:id", (req, res) => {

    db.get(
        `SELECT * FROM archivos WHERE id = ?`,
        [req.params.id],
        (err, row) => {

            if (!row) {

                return res.json({
                    error: "No encontrado"
                });
            }

            res.download(
                row.ruta,
                row.nombre
            );
        }
    );
});

// =========================
// ELIMINAR
// =========================

router.delete(
    "/eliminar/:id",
    verificarToken,
    (req, res) => {

        db.get(
            `SELECT * FROM archivos
             WHERE id = ?
             AND usuario_id = ?`,
            [
                req.params.id,
                req.user.id
            ],
            (err, row) => {

                if (!row) {

                    return res.json({
                        error: "No encontrado"
                    });
                }

                fs.unlink(row.ruta, () => {

                    db.run(
                        `DELETE FROM archivos
                         WHERE id = ?`,
                        [req.params.id]
                    );

                    res.json({
                        mensaje: "Eliminado"
                    });
                });
            }
        );
    }
);

router.get("/preview/:id", (req, res) => {
    db.get(`SELECT * FROM archivos WHERE id = ?`, [req.params.id], async (err, row) => {
        if (!row) return res.json({ error: "Archivo no encontrado" });

        const ext = row.nombre.split(".").pop().toLowerCase();

        try {
            // ── PDF: devuelve la URL para mostrarla en iframe ──
            if (ext === "pdf") {
                return res.json({
                    tipo: "pdf",
                    url: `http://localhost:3001/${row.ruta}`
                });
            }

            // ── Word .docx ──
            if (ext === "docx") {
                const mammoth = require("mammoth");
                const result  = await mammoth.convertToHtml({ path: row.ruta });
                return res.json({ tipo: "html", html: result.value });
            }

            // ── Word .doc (formato antiguo) ──
            if (ext === "doc") {
                const WordExtractor = require("word-extractor");
                const extractor     = new WordExtractor();
                const doc           = await extractor.extract(row.ruta);
                const texto         = doc.getBody() || "";
                // Convertir saltos de línea a párrafos HTML
                const html = texto
                    .split(/\n+/)
                    .filter(l => l.trim())
                    .map(l => `<p>${l}</p>`)
                    .join("");
                return res.json({ tipo: "html", html });
            }

            // ── Excel ──
            if (ext === "xlsx" || ext === "xls") {
                const XLSX     = require("xlsx");
                const workbook = XLSX.readFile(row.ruta);
                // Generar una pestaña por cada hoja
                const hojas = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    const html  = XLSX.utils.sheet_to_html(sheet);
                    return `<h3 style="margin:16px 0 8px;color:#1d4ed8">${name}</h3>${html}`;
                }).join("<hr/>");
                return res.json({ tipo: "html", html: hojas });
            }

            // ── PowerPoint ──
            if (ext === "pptx" || ext === "ppt") {
                return res.json({ tipo: "pptx" });
            }

            return res.json({ error: "Formato no soportado" });

        } catch (e) {
            console.error("[preview]", e.message);
            return res.json({ error: "Error al generar la previsualización: " + e.message });
        }
    });
});


module.exports = router;