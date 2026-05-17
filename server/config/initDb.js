const db = require("./db");

function initDb() {

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE COLLATE NOCASE,
            password TEXT
        )
    `);

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

module.exports = initDb;