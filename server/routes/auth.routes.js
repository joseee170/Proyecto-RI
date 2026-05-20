//SE IMPORTA EXPRESS PARA CREAR LAS RUTAS DEL SERVIDOR
const express = require("express");

//SE IMPORTA BCRYPT PARA ENCRIPTAR CONTRASEÑAS
const bcrypt = require("bcrypt");

//SE IMPORTA JWT PARA CREAR TOKENS DE ACCESO
const jwt = require("jsonwebtoken");

//SE IMPORTA LA CONEXION A LA BASE DE DATOS
const db = require("../config/db");

//SE IMPORTA EL MIDDLEWARE PARA VERIFICAR TOKENS
const verificarToken = require("../middleware/auth");

//SE CREA EL ROUTER PARA DEFINIR LAS RUTAS
const router = express.Router();

//RUTA PARA REGISTRAR USUARIOS
router.post("/register", async (req, res) => {

    let { username, password } = req.body;

    //SE VERIFICA QUE LOS DATOS NO ESTEN VACIOS
    if (!username || !password) {
        return res.json({ error: "Faltan datos" });
    }

    //VALIDAR PASSWORD
    if (password.length < 6) {

        return res.json({
            error:
                "La contraseña debe tener al menos 6 caracteres"
        });
    }

    if (username.length < 3) {

    return res.json({
        error:
            "El usuario debe tener al menos 3 caracteres"
    });
}

    //SE NORMALIZA EL NOMBRE DE USUARIO
    const usernameNormalizado = username.trim().toLowerCase();

    //SE BUSCA SI EL USUARIO YA EXISTE
    db.get(
        `SELECT * FROM usuarios WHERE username = ?`,
        [usernameNormalizado],
        async (err, user) => {

            if (user) {
                return res.json({ error: "El usuario ya existe" });
            }

            //SE ENCRIPTA LA CONTRASEÑA
            const hashedPassword = await bcrypt.hash(password, 10);

            //SE INSERTA EL NUEVO USUARIO
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

//RUTA PARA INICIAR SESION
router.post("/login", (req, res) => {

    let { username, password } = req.body;

    //SE NORMALIZA EL NOMBRE DE USUARIO
    const usernameNormalizado = username.trim().toLowerCase();

    //SE BUSCA EL USUARIO EN LA BASE DE DATOS
    db.get(
        `SELECT * FROM usuarios WHERE username = ?`,
        [usernameNormalizado],

        async (err, user) => {

            //SI EL USUARIO NO EXISTE
            if (!user) {
                return res.json({ error: "Usuario no encontrado" });
            }

            //SE COMPARA LA CONTRASEÑA INGRESADA
            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.json({ error: "Contraseña incorrecta" });
            }

            //SE CREA EL TOKEN DEL USUARIO
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                "secretkey"
            );

            //SE ENVIA EL TOKEN AL FRONTEND
            res.json({
                mensaje: "Login correcto",
                token
            });
        }
    );
});

//RUTA PARA OBTENER LOS DATOS DEL USUARIO
router.get("/me", verificarToken, (req, res) => {

        //SE BUSCA EL USUARIO POR SU ID
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

                //SE DEVUELVEN LOS DATOS DEL USUARIO
                res.json(user);
            }
        );
    }
);

module.exports = router;