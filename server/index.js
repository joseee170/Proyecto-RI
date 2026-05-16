const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

db.run(`
CREATE TABLE IF NOT EXISTS archivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    ruta TEXT,
    tipo TEXT,
    keywords TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)
`);

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));
const verificarToken = (req, res, next) => {

    const token =
        req.headers.authorization;

    if(!token){

        return res.json({
            error: "Acceso denegado"
        });
    }

    try{

        const verified =
            jwt.verify(
                token,
                "secretkey"
            );

        req.user = verified;

        next();

    }catch{

        res.json({
            error: "Token inválido"
        });
    }
};

app.post(
    "/upload",
    verificarToken,
    upload.single("archivo"),
    (req, res) => {
        
    const nombre = req.file.originalname;
    const ruta = req.file.path.replace(/\\/g, "/");
    const tipo = req.file.mimetype;
    const keywords = req.body.keywords;

    db.run(
        `INSERT INTO archivos(nombre,ruta,tipo,keywords)
         VALUES(?,?,?,?)`,
        [nombre, ruta, tipo, keywords]
    );

    res.json({
        mensaje: "Archivo subido"
    });
});

app.get("/buscar", (req, res) => {

    const q = req.query.q;

    db.all(
        `SELECT * FROM archivos
         WHERE nombre LIKE ?
         OR keywords LIKE ?`,
        [`%${q}%`, `%${q}%`],
        (err, rows) => {

            if(err){
                return res.json(err);
            }

            res.json(rows);
        }
    );
});

app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO usuarios(username,password)
         VALUES(?,?)`,
        [username, hashedPassword],
        function(err){

            if(err){

                return res.json({
                    error: "Usuario ya existe"
                });
            }

            res.json({
                mensaje: "Usuario registrado"
            });
        }
    );
});

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        `SELECT * FROM usuarios
         WHERE username = ?`,
        [username],
        async (err, user) => {

            if(!user){

                return res.json({
                    error: "Usuario no encontrado"
                });
            }

            const validPassword =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if(!validPassword){

                return res.json({
                    error: "Contraseña incorrecta"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                "secretkey"
            );

            res.json({
                mensaje: "Login correcto",
                token
            });
        }
    );
});

app.get("/download/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        `SELECT * FROM archivos WHERE id = ?`,
        [id],
        (err, row) => {

            if(err || !row){

                return res.json({
                    error: "Archivo no encontrado"
                });
            }

            res.download(
                row.ruta,
                row.nombre
            );
        }
    );
});

const fs = require("fs");

app.delete(
    "/eliminar/:id",
    verificarToken,
    (req, res) => {

        const id = req.params.id;

        db.get(
            `SELECT * FROM archivos WHERE id = ?`,
            [id],
            (err, row) => {

                if(!row){

                    return res.json({
                        error: "Archivo no encontrado"
                    });
                }

                fs.unlink(row.ruta, () => {

                    db.run(
                        `DELETE FROM archivos WHERE id = ?`,
                        [id]
                    );

                    res.json({
                        mensaje: "Archivo eliminado"
                    });
                });
            }
        );
});

app.listen(3001, () => {
    console.log("Servidor corriendo en puerto 3001");
});