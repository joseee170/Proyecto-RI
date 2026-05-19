//SE IMPORTA LA LIBRERIA NATURAL
const natural = require("natural");

//SE USA EL STEMMER EN ESPAÑOL
const stemmer =
    natural.PorterStemmerEs;

//LISTA DE PALABRAS QUE SE IGNORAN
const STOPWORDS = new Set([
    "de", "la", "las", "el", "los",
    "un", "una", "unos", "unas",
    "y", "o", "u", "e",
    "para", "por", "con", "sin",
    "sobre", "entre", "hasta",
    "desde", "durante",
    "del", "al", "a", "ante",
    "bajo", "cabe", "contra",
    "es", "son", "ser",
    "fue", "han", "ha",
    "se", "su", "sus",
    "que", "como", "cuando",
    "donde", "quien",
    "este", "esta", "estos",
    "estas", "ese", "esa",
    "eso", "esto",
    "no", "si", "mas",
    "pero", "aunque",
    "http", "https",
    "www", "com", "org",
    "net", "edu", "mx",
    "doi", "isbn",
    "vol", "gac",
    "pp", "pag",
    "pagina", "capitulo",
    "fig",
    "introduccion",
    "conclusion",
    "resumen",
    "referencias",
    "bibliografia",
    "anexo",
    "figura",
    "tabla",
    "img", "image",
    "scan", "scanned",
    "documento",
    "archivo",
    "contenido",
    "informacion",
    "the", "and",
    "for", "with",
    "from", "this",
    "that", "are",
    "2024", "2025",
    "01", "02", "03"
]);

//FUNCION PARA NORMALIZAR PALABRAS
function normalizeWord(word = "") {

    return word
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

//FUNCION PARA TOKENIZAR TEXTO
function tokenize(text = "") {

    return text

        //TODO A MINUSCULAS
        .toLowerCase()

        //SE ELIMINAN ACENTOS
        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "")

        //SE ELIMINAN URLS
        .replace(/https?:\/\/\S+/g, " ")

        //SE ELIMINAN EMAILS
        .replace(/\S+@\S+\.\S+/g, " ")

        //SE ELIMINAN SIMBOLOS
        .replace(/[^\w\s]/g, " ")

        //SE SEPARA EL TEXTO
        .split(/\s+/)

        //SE NORMALIZAN LAS PALABRAS
        .map(normalizeWord)

        //SE FILTRAN PALABRAS
        .filter(word => {

            return (

                //MINIMO 3 CARACTERES
                word.length > 2 &&

                //NO DEBE ESTAR EN STOPWORDS
                !STOPWORDS.has(word) &&

                //NO DEBEN SER SOLO NUMEROS
                !/^\d+$/.test(word) &&

                //SE ELIMINAN REPETICIONES EXTRAÑAS
                !/(.)\1{3,}/.test(word) &&

                //LIMITE DE TAMAÑO
                word.length < 40
            );
        })

        //SE APLICA STEMMING
        .map(word => {

            try {

                return stemmer.stem(word);

            } catch {

                return word;
            }
        });
}

//SE EXPORTAN LAS FUNCIONES
module.exports = {
    tokenize,
    STOPWORDS,
    normalizeWord
};