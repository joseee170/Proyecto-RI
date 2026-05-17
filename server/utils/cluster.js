const natural =
    require("natural");

const { kmeans } =
    require("ml-kmeans");

const stopwords =
    new Set([
        "de","la","y","el","en","los","las","un","una",
        "http","www","com","org","mx","vol","gac",
        "para","con","por","del","al","los","las",
        "es","son","ser","se","su","sus"
    ]);

function cleanWords(text) {

    return text
        .toLowerCase()
        .split(/\s+/)
        .filter(w =>
            w.length > 2 &&
            !stopwords.has(w)
        );
}

function clusterDocuments(documentos = []) {

    if (documentos.length < 2) {
        return documentos.map(() => 0);
    }

    const tfidf =
        new natural.TfIdf();

    documentos.forEach(doc => {

        tfidf.addDocument(doc);
    });

    const vocabulario =
        new Set();

    documentos.forEach(doc => {

        cleanWords(doc).forEach(word => {

            vocabulario.add(word);
        });
    });

    const palabras =
        Array.from(vocabulario);

    const vectores =
        documentos.map((_, i) => {

            return palabras.map(palabra => {

                return tfidf.tfidf(palabra, i);
            });
        });

    const k =
        Math.min(5, documentos.length);

    const resultado =
        kmeans(vectores, k);

    return resultado.clusters;
}

module.exports =
    clusterDocuments;