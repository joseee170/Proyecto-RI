const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const verificarToken = require("../middleware/auth");

const router = express.Router();

//REGISTRO
router.post("/register", async (req, res) => {

    let { username, password } = req.body;

    if (!username || !password) {
        return res.json({ error: "Faltan datos" });
    }

    const usernameNormalizado = username.trim().toLowerCase();

    db.get(
        `SELECT * FROM usuarios WHERE username = ?`,
        [usernameNormalizado],
        async (err, user) => {

            if (user) {
                return res.json({ error: "El usuario ya existe" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(
                `INSERT INTO usuarios(username, password)
                 VALUES(?,?)`,
                [usernameNormalizado, hashedPassword],
                (err) => {

                    if (err) {
                        return res.json({ error: "Error al registrar usuario" });
                    }

                    res.json({ mensaje: "Usuario registrado" });
                }
            );
        }
    );
});

//INICIO
router.post("/login", (req, res) => {

    let { username, password } = req.body;

    const usernameNormalizado = username.trim().toLowerCase();

    db.get(
        `SELECT * FROM usuarios WHERE username = ?`,
        [usernameNormalizado],

        async (err, user) => {

            if (!user) {
                return res.json({ error: "Usuario no encontrado" });
            }

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.json({ error: "Contraseña incorrecta" });
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

router.get("/me", verificarToken, (req, res) => {

        db.get(
            `SELECT id, username
             FROM usuarios
             WHERE id = ?`,
            [req.user.id],
            (err, user) => {

                if (err || !user) {

                    return res.json({
                        error: "Usuario no encontrado"
                    });
                }

                res.json(user);
            }
        );
    }
);

module.exports = router;