//SE IMPORTA TESSERACT PARA HACER OCR
const Tesseract = require("tesseract.js");

//SE IMPORTA PATH PARA MANEJAR RUTAS
const path = require("path");

//RUTA DE LA CARPETA CACHE
const CACHE_PATH =
    path.join(__dirname, "../tessdata");

//FUNCION PARA EXTRAER TEXTO DE IMAGENES
async function extraerTextoImagen(ruta) {

    try {

        //SE ANALIZA LA IMAGEN Y SE EXTRAE EL TEXTO
        const resultado =
            await Tesseract.recognize(
                ruta,
                "spa",
                {
                    logger: () => {},
                    cachePath: CACHE_PATH
                }
            );

        //SE DEVUELVE EL TEXTO DETECTADO
        return resultado.data.text;

    } catch (error) {

        //SI HAY ERROR SE MUESTRA EN CONSOLA
        console.log(error);

        return "";
    }
}

//SE EXPORTA LA FUNCION
module.exports = extraerTextoImagen;