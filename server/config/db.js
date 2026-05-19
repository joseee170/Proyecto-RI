//SE IMPORTA SQLITE3
const sqlite3 = require("sqlite3").verbose();

//SE CREA O CONECTA LA BASE DE DATOS
const db = new sqlite3.Database("./database.db");

//SE EXPORTA LA BASE DE DATOS PARA USARLA EN OTROS ARCHIVOS
module.exports = db;