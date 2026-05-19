const jwt = require("jsonwebtoken");

//FUNCION PARA VERIFICAR EL TOKEN DEL USUARIO
function verificarToken(req, res, next) {

    //SE OBTIENE EL TOKEN ENVIADO DESDE EL FRONTEND
    const token = req.headers.authorization;

    //SI NO EXISTE EL TOKEN SE NIEGA EL ACCESO
    if (!token) {
        return res.json({
            error: "Acceso denegado"
        });
    }

    try {

        //SE VERIFICA SI EL TOKEN ES VALIDO
        const verified =
            jwt.verify(
                token,
                "secretkey"
            );

        //SE GUARDAN LOS DATOS DEL USUARIO
        req.user = verified;

        next();

    } catch (error) {

        //MENSAJE SI EL TOKEN NO ES VALIDO
        res.json({
            error: "Token invalido"
        });
    }
}

module.exports = verificarToken;