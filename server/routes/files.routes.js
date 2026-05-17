const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../config/db");
const verificarToken = require("../middleware/auth");

const textExtractor = require("../utils/textExtractor");
const sorter = require("../utils/sorter");

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

        const texto = await textExtractor(ruta, tipo);
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
        `SELECT * FROM archivos
         WHERE usuario_id = ?
         AND (
            nombre LIKE ?
            OR keywords LIKE ?
            OR categoria LIKE ?
            OR descripcion LIKE ?
         )`,
        [
            req.user.id,
            `%${q}%`,
            `%${q}%`,
            `%${q}%`,
            `%${q}%`
        ],
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.json([]);
            }
            res.json(rows);
        }
    );
});

//BUSCAR PUBLICO
router.get("/buscar-publico", (req, res) => {

    const q = req.query.q || "";

    db.all(
        `SELECT * FROM archivos
         WHERE nombre LIKE ?
         OR keywords LIKE ?
         OR categoria LIKE ?
         OR descripcion LIKE ?`,
        [
            `%${q}%`,
            `%${q}%`,
            `%${q}%`,
            `%${q}%`
        ],
        (err, rows) => {
            if (err) return res.json([]);
            res.json(rows);
        }
    );
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