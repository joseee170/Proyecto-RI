const {
    inverseDocumentFrequency,
    tfidfVector
} = require("./tfidf");

const cosineSimilarity = require("./similarity");

// Cache del IDF para evitar recalcular en cada búsqueda
let _cachedIdf = null;
let _cachedCorpusKey = null;

function normalize(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Boost proporcional y acotado (máx 0.5) para no dominar el score coseno
function categoryBoost(query, category) {
    if (!query || !category) return 0;

    const q = normalize(query.trim());
    const c = normalize(category.trim());

    if (c === q) return 0.5;       // match exacto
    if (c.includes(q)) return 0.3; // match parcial
    return 0;
}

function buildCorpus(documents) {
    return documents.map(doc =>
        normalize(
            (doc.titulo || "") + " " +
            (doc.descripcion || "") + " " +
            (doc.keywords || "") + " " +
            (doc.categoria || "")
        )
    );
}

function getIdf(corpus) {
    const key = corpus.join("|");

    if (_cachedIdf && key === _cachedCorpusKey) {
        return _cachedIdf;
    }

    _cachedCorpusKey = key;
    _cachedIdf = inverseDocumentFrequency(corpus);

    return _cachedIdf;
}

function tfidfSearch(query, documents) {
    if (!query || !query.trim()) {
        return documents;
    }

    const corpus = buildCorpus(documents);
    const idf = getIdf(corpus);
    const queryVec = tfidfVector(normalize(query), idf);

    const results = documents.map((doc, i) => {
        const docVec = tfidfVector(corpus[i], idf);
        const tfidfScore = cosineSimilarity(queryVec, docVec);
        const boost = categoryBoost(query, doc.categoria);

        return {
            ...doc,
            score: tfidfScore + boost
        };
    });

    return results
        .sort((a, b) => b.score - a.score)
        .filter(r => r.score > 0);
}

// Permite invalidar el cache manualmente cuando cambia el corpus
function invalidateCache() {
    _cachedIdf = null;
    _cachedCorpusKey = null;
}

module.exports = { tfidfSearch, invalidateCache };
