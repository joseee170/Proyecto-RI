const { tokenize } = require("./tokenizer");

function normalize(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Calcula TF de un solo documento
function termFrequency(words) {
    const tf = {};
    const total = words.length || 1;
    words.forEach(w => {
        tf[w] = (tf[w] || 0) + 1;
    });
    Object.keys(tf).forEach(w => {
        tf[w] = tf[w] / total;
    });
    return tf;
}

// IDF interno: penaliza palabras muy frecuentes dentro del mismo texto
// usando la frecuencia relativa como proxy (cuanto más repetida, menos única)
function scorePalabras(words) {
    const tf = termFrequency(words);

    // Ordenar por TF descendente — las más frecuentes y representativas primero
    return Object.entries(tf)
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word);
}

function sorter(texto) {
    if (!texto || !texto.trim()) {
        return {
            categoria: "General",
            keywords: "",
            descripcion: ""
        };
    }

    const words = tokenize(normalize(texto));

    if (words.length === 0) {
        return {
            categoria: "General",
            keywords: "",
            descripcion: texto.substring(0, 300)
        };
    }

    // Palabras ordenadas por relevancia (TF)
    const ranking = scorePalabras(words);

    // Top 10 keywords más representativas del documento
    const topKeywords = ranking.slice(0, 10);

    // La categoría es la palabra más frecuente y significativa del texto
    // (la que mejor lo representa según TF)
    const categoria = topKeywords[0]
        ? topKeywords[0].charAt(0).toUpperCase() + topKeywords[0].slice(1)
        : "General";

    // Keywords como string limpio
    const keywords = topKeywords.join(", ");

    // Descripción cortada en límite de palabra
    const MAX_DESC = 300;
    let descripcion = texto;
    if (texto.length > MAX_DESC) {
        const corte = texto.lastIndexOf(" ", MAX_DESC);
        descripcion = texto.substring(0, corte > 0 ? corte : MAX_DESC) + "...";
    }

    return {
        categoria,
        keywords,
        descripcion
    };
}

module.exports = sorter;
