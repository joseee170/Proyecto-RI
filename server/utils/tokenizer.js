const natural = require("natural");

const stemmer =
    natural.PorterStemmerEs;


const STOPWORDS = new Set([

    // ARTICULOS
    "de", "la", "las", "el", "los",
    "un", "una", "unos", "unas",

    // CONECTORES
    "y", "o", "u", "e",
    "para", "por", "con", "sin",
    "sobre", "entre", "hasta",
    "desde", "durante",

    // PREPOSICIONES
    "del", "al", "a", "ante",
    "bajo", "cabe", "contra",

    // VERBOS COMUNES
    "es", "son", "ser",
    "fue", "han", "ha",
    "se", "su", "sus",

    // PRONOMBRES
    "que", "como", "cuando",
    "donde", "quien",
    "este", "esta", "estos",
    "estas", "ese", "esa",
    "eso", "esto",

    // NEGACIONES
    "no", "si", "mas",
    "pero", "aunque",

    // WEB
    "http", "https",
    "www", "com", "org",
    "net", "edu", "mx",

    // PDF / ARTICULOS
    "doi", "isbn",
    "vol", "gac",
    "pp", "pag",
    "pagina", "capitulo",
    "fig",

    // ACADEMICO
    "introduccion",
    "conclusion",
    "resumen",
    "referencias",
    "bibliografia",
    "anexo",
    "figura",
    "tabla",

    // OCR / BASURA
    "img", "image",
    "scan", "scanned",

    // GENERICAS
    "documento",
    "archivo",
    "contenido",
    "informacion",

    // INGLES COMUN
    "the", "and",
    "for", "with",
    "from", "this",
    "that", "are",

    // NUMEROS OCR
    "2024", "2025",
    "01", "02", "03"
]);

// =========================
// NORMALIZAR PALABRA
// =========================

function normalizeWord(word = "") {

    return word
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

// =========================
// TOKENIZER
// =========================

function tokenize(text = "") {

    return text

        .toLowerCase()

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "")

        // quitar urls
        .replace(/https?:\/\/\S+/g, " ")

        // quitar emails
        .replace(/\S+@\S+\.\S+/g, " ")

        // quitar simbolos
        .replace(/[^\w\s]/g, " ")

        // separar
        .split(/\s+/)

        // limpiar palabras
        .map(normalizeWord)

        // filtros
        .filter(word => {

            return (

                word.length > 2 &&

                !STOPWORDS.has(word) &&

                !/^\d+$/.test(word) &&

                // quitar palabras repetidas raras OCR
                !/(.)\1{3,}/.test(word) &&

                // quitar palabras muy cortas
                word.length < 40
            );
        })

        // stemming
        .map(word => {

            try {

                return stemmer.stem(word);

            } catch {

                return word;
            }
        });
}

module.exports = {
    tokenize,
    STOPWORDS,
    normalizeWord
};