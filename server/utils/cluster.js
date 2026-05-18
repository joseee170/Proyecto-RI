const { kmeans } = require("ml-kmeans");
const { tokenize } = require("./tokenizer");
const { inverseDocumentFrequency, tfidfVector } = require("./tfidf");

function clusterDocuments(documentos = []) {
    if (documentos.length < 2) {
        return documentos.map(() => 0);
    }

    const idf = inverseDocumentFrequency(documentos);

    // Construir vectores TF-IDF con vocabulario filtrado por IDF alto
    // (elimina palabras muy comunes que distorsionan el clustering)
    const IDF_UMBRAL = 0.5;
    const vocabulario = Array.from(
        new Set(documentos.flatMap(doc => tokenize(doc)))
    ).filter(w => (idf[w] || 0) > IDF_UMBRAL);

    if (vocabulario.length === 0) {
        return documentos.map(() => 0);
    }

    const vectores = documentos.map(doc => {
        const vec = tfidfVector(doc, idf);
        return vocabulario.map(palabra => vec[palabra] || 0);
    });

    // Heurística: k = sqrt(n/2), mínimo 2, máximo 5
    const k = Math.max(2, Math.min(
        Math.floor(Math.sqrt(documentos.length / 2)),
        5
    ));

    const resultado = kmeans(vectores, k, { initialization: "kmeans++" });

    return resultado.clusters;
}

module.exports = clusterDocuments;
