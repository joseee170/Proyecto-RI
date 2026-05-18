const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../config/db");
const verificarToken = require("../middleware/auth");

const textExtractor = require("../utils/textExtractor");
const sorter = require("../utils/sorter");
const extraerTextoImagen = require("../utils/ocr");
const {tfidfSearch} = require("../utils/searchEngine");

const router = express.Router();

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

//MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

//CARGAR
router.post("/upload", verificarToken, upload.single("archivo"), async (req, res) => {

    try {

        if (!req.file) {
            return res.json({ error: "No se recibió archivo" });
        }

        const nombre = req.file.originalname;
        const ruta = req.file.path.replace(/\\/g, "/");
        const tipo = req.file.mimetype;

        let texto = await textExtractor(ruta, tipo);
        // IMAGENES
        if (tipo.includes("image")) {

            const textoOCR =
                await extraerTextoImagen(ruta);

            texto += " " + textoOCR;
        }

        const resultado = sorter(texto);

        db.run(
            `INSERT INTO archivos(
                nombre, ruta, tipo,
                keywords, categoria, descripcion,
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
                    return res.json({ error: "Error SQL" });
                }

                res.json({ mensaje: "Archivo subido correctamente" });
            }
        );

    } catch (error) {
        console.log(error);
        res.json({ error: "Error upload" });
    }
});

//BUSCAR PRIVADO
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

            if (!q.trim()) {
                return res.json(rows);
            }

            const results = tfidfSearch(q, rows);
            return res.json(results);
        }
    );
});

//BUSCAR PUBLICO
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

            const results = tfidfSearch(q, rows);
            return res.json(results);
        }
    );
});

router.get("/sugerencias", (req, res) => {
    const q = (req.query.q || "").toLowerCase().trim();

    if (!q || q.length < 2) {
        return res.json([]);
    }

    // Busca en nombre, keywords y categoria de todos los archivos
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

        // Extraer palabras individuales de todos los campos
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

        // También agregar títulos completos si contienen la query
        rows.forEach(row => {
            if (row.nombre && row.nombre.toLowerCase().includes(q)) {
                palabras.add(row.nombre.toLowerCase());
            }
        });

        const sugerencias = Array.from(palabras)
            .sort((a, b) => {
                // Priorizar las que empiezan con la query
                const aEmpieza = a.startsWith(q) ? 0 : 1;
                const bEmpieza = b.startsWith(q) ? 0 : 1;
                return aEmpieza - bEmpieza || a.localeCompare(b);
            })
            .slice(0, 8);

        res.json(sugerencias);
    });
});

//DESCARGAR
router.get("/download/:id", (req, res) => {

    db.get(
        `SELECT * FROM archivos WHERE id = ?`,
        [req.params.id],
        (err, row) => {

            if (!row) return res.json({ error: "No encontrado" });

            res.download(row.ruta, row.nombre);
        }
    );
});

//ELIMINAR
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

module.exports = router;