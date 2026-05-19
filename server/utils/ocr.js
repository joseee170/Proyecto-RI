const Tesseract = require("tesseract.js");
const path = require("path");

const CACHE_PATH = path.join(__dirname, "../tessdata");

async function extraerTextoImagen(ruta) {
    try {
        const resultado = await Tesseract.recognize(ruta, "spa", {
            logger: () => {},
            cachePath: CACHE_PATH
        });
        return resultado.data.text;
    } catch (error) {
        console.log(error);
        return "";
    }
}

module.exports = extraerTextoImagen;