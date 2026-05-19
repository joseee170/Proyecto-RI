//SE IMPORTA EXPRESS
const express = require("express");

//SE IMPORTA CORS
const cors = require("cors");

//SE IMPORTA PATH
const path = require("path");

//SE CREA LA APLICACION
const app = express();

//SE HABILITA CORS
app.use(cors());

//SE HABILITA JSON
app.use(express.json());

//SE INICIALIZA LA BASE DE DATOS
require("./config/initDb")();

//SE HACE PUBLICA LA CARPETA UPLOADS
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

//RUTAS DE AUTENTICACION
app.use(
    "/auth",
    require("./routes/auth.routes")
);

//RUTAS DE ARCHIVOS
app.use(
    "/files",
    require("./routes/files.routes")
);

//SE INICIA EL SERVIDOR
app.listen(3001, "0.0.0.0", () => {

    console.log(
        "Servidor corriendo"
    );
});