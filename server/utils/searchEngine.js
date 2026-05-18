const { inverseDocumentFrequency, tfidfVector } = require("./tfidf");
const cosineSimilarity = require("./similarity");

let _cachedIdf = null;
let _cachedCorpusKey = null;

function normalize(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Boost por coincidencia en campos clave (nombre, keywords, categoria)
function camposBoost(query, doc) {
    const q = normalize(query);
    let boost = 0;

    const nombre    = normalize(doc.nombre    || "");
    const keywords  = normalize(doc.keywords  || "");
    const categoria = normalize(doc.categoria || "");

    // Nombre exacto: máxima prioridad
    if (nombre === q)               boost += 2.0;
    // Nombre contiene la query
    else if (nombre.includes(q))    boost += 1.0;

    // Keywords contienen la query
    if (keywords.includes(q))       boost += 0.5;

    // Categoría coincide
    if (categoria === q)            boost += 0.4;
    else if (categoria.includes(q)) boost += 0.2;

    return boost;
}

// Construye el texto que representa a cada documento para TF-IDF
// Usa 'nombre' (no 'titulo') que es como se llama la columna en la BD
function buildCorpus(documents) {
    return documents.map(doc =>
        normalize(
            (doc.nombre      || "") + " " +
            (doc.keywords    || "") + " " +
            (doc.categoria   || "") + " " +
            (doc.descripcion || "")
        )
    );
}

function getIdf(corpus) {
    const key = corpus.join("|");
    if (_cachedIdf && key === _cachedCorpusKey) return _cachedIdf;
    _cachedCorpusKey = key;
    _cachedIdf = inverseDocumentFrequency(corpus);
    return _cachedIdf;
}

function tfidfSearch(query, documents) {
    if (!query || !query.trim()) return documents;

    const q = normalize(query);
    const corpus = buildCorpus(documents);
    const idf = getIdf(corpus);
    const queryVec = tfidfVector(q, idf);

    const results = documents.map((doc, i) => {
        const docVec     = tfidfVector(corpus[i], idf);
        const tfidfScore = cosineSimilarity(queryVec, docVec);
        const boost      = camposBoost(query, doc);

        return {
            ...doc,
            score: tfidfScore + boost
        };
    });

    return results
        .sort((a, b) => b.score - a.score)
        .filter(r => r.score > 0);
}

function invalidateCache() {
    _cachedIdf = null;
    _cachedCorpusKey = null;
}

module.exports = { tfidfSearch, invalidateCache };
