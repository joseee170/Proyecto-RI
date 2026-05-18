const Tesseract = require("tesseract.js");

/**
 * Extrae texto de una imagen usando OCR.
 * @param {string} ruta - Ruta del archivo de imagen
 * @param {number} umbralConfianza - Confianza mínima (0-100) para incluir una palabra
 * @returns {Promise<string>} Texto extraído con palabras de alta confianza
 */
async function extraerTextoImagen(ruta, umbralConfianza = 60) {
    try {
        const resultado = await Tesseract.recognize(ruta, "spa", {
            logger: () => {} // silenciar logs en producción
        });

        // Filtrar palabras por nivel de confianza para evitar
        // que texto borroso o mal reconocido contamine el índice
        const textofiltrado = resultado.data.words
            .filter(w => w.confidence >= umbralConfianza)
            .map(w => w.text)
            .join(" ")
            .trim();

        // Si no hay suficiente texto confiable, devolver cadena vacía
        return textofiltrado;

    } catch (error) {
        console.error("[OCR] Error al procesar imagen:", ruta, error.message);
        return "";
    }
}

module.exports = extraerTextoImagen;
