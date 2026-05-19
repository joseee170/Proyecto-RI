//SE IMPORTA LA CONEXION DE LA BASE DE DATOS
const db = require("./db");

//FUNCION PARA CREAR LAS TABLAS DE LA BASE DE DATOS
function initDb() {

    //SE CREA LA TABLA DE USUARIOS SI NO EXISTE
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE COLLATE NOCASE,
            password TEXT
        )
    `);

    //SE CREA LA TABLA DE ARCHIVOS SI NO EXISTE
    db.run(`
        CREATE TABLE IF NOT EXISTS archivos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            ruta TEXT,
            tipo TEXT,
            keywords TEXT,
            categoria TEXT,
            descripcion TEXT,
            usuario_id INTEGER
        )
    `);

    console.log("Base de datos inicializada");
}

//SE EXPORTA LA FUNCION PARA USARLA EN OTROS ARCHIVOS
module.exports = initDb;