const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.json({
            error: "Acceso denegado"
        });
    }

    try {

        const verified =
            jwt.verify(
                token,
                "secretkey"
            );

        req.user = verified;

        next();

    } catch (error) {

        console.log(error);

        res.json({
            error: "Token inválido"
        });
    }
}

module.exports = verificarToken;