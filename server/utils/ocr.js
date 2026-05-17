const Tesseract = require("tesseract.js");

async function extraerTextoImagen(ruta) {

    try {

        const resultado =
            await Tesseract.recognize(
                ruta,
                "spa"
            );

        return resultado.data.text;

    } catch (error) {

        console.log(error);

        return "";
    }
}

module.exports = extraerTextoImagen;