//SE IMPORTA KMEANS PARA AGRUPAR DOCUMENTOS
const { kmeans } = require("ml-kmeans");

//SE IMPORTA EL TOKENIZADOR
const { tokenize } = require("./tokenizer");

//SE IMPORTAN LAS FUNCIONES TFIDF
const { inverseDocumentFrequency, tfidfVector } = require("./tfidf");

//FUNCION PARA AGRUPAR DOCUMENTOS
function clusterDocuments(documentos = []) {

    //SI HAY MENOS DE 2 DOCUMENTOS TODOS VAN AL MISMO GRUPO
    if (documentos.length < 2) {
        return documentos.map(() => 0);
    }

    //SE CALCULA EL IDF DE LOS DOCUMENTOS
    const idf = inverseDocumentFrequency(documentos);

    //SE CREA EL VOCABULARIO FILTRANDO PALABRAS MUY COMUNES
    const IDF_UMBRAL = 0.5;

    const vocabulario = Array.from(
        new Set(documentos.flatMap(doc => tokenize(doc)))
    ).filter(w => (idf[w] || 0) > IDF_UMBRAL);

    //SI NO HAY PALABRAS VALIDAS TODOS VAN AL MISMO GRUPO
    if (vocabulario.length === 0) {
        return documentos.map(() => 0);
    }

    //SE CREAN LOS VECTORES TFIDF
    const vectores = documentos.map(doc => {

        const vec = tfidfVector(doc, idf);

        return vocabulario.map(
            palabra => vec[palabra] || 0
        );
    });

    //SE CALCULA EL NUMERO DE CLUSTERS
    const k = Math.max(
        2,
        Math.min(
            Math.floor(Math.sqrt(documentos.length / 2)),
            5
        )
    );

    //SE EJECUTA KMEANS
    const resultado =
        kmeans(vectores, k, {
            initialization: "kmeans++"
        });

    //SE DEVUELVEN LOS GRUPOS
    return resultado.clusters;
}

//SE EXPORTA LA FUNCION
module.exports = clusterDocuments;