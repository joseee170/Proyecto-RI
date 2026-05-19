//SE IMPORTAN LAS FUNCIONES TFIDF
const { inverseDocumentFrequency, tfidfVector } = require("./tfidf");

//SE IMPORTA LA FUNCION DE SIMILITUD COSENO
const cosineSimilarity = require("./similarity");

//VARIABLES PARA GUARDAR CACHE
let _cachedIdf = null;
let _cachedCorpusKey = null;

//FUNCION PARA NORMALIZAR TEXTO
function normalize(text = "") {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

//FUNCION PARA DAR PRIORIDAD A COINCIDENCIAS IMPORTANTES
function camposBoost(query, doc) {

    const q = normalize(query);

    let boost = 0;

    //SE NORMALIZAN LOS CAMPOS
    const nombre =
        normalize(doc.nombre || "");

    const keywords =
        normalize(doc.keywords || "");

    const categoria =
        normalize(doc.categoria || "");

    //SI EL NOMBRE ES EXACTO
    if (nombre === q)
        boost += 2.0;

    //SI EL NOMBRE CONTIENE LA BUSQUEDA
    else if (nombre.includes(q))
        boost += 1.0;

    //SI LAS KEYWORDS CONTIENEN LA BUSQUEDA
    if (keywords.includes(q))
        boost += 0.5;

    //SI LA CATEGORIA COINCIDE
    if (categoria === q)
        boost += 0.4;

    else if (categoria.includes(q))
        boost += 0.2;

    return boost;
}

//FUNCION PARA CREAR EL CORPUS
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

//FUNCION PARA OBTENER EL IDF
function getIdf(corpus) {

    const key = corpus.join("|");

    //SI YA EXISTE EN CACHE SE REUTILIZA
    if (_cachedIdf && key === _cachedCorpusKey)
        return _cachedIdf;

    _cachedCorpusKey = key;

    //SE CALCULA EL NUEVO IDF
    _cachedIdf =
        inverseDocumentFrequency(corpus);

    return _cachedIdf;
}

//FUNCION PRINCIPAL DE BUSQUEDA
function tfidfSearch(query, documents) {

    //SI NO HAY BUSQUEDA
    if (!query || !query.trim())
        return documents;

    //SE NORMALIZA LA QUERY
    const q = normalize(query);

    //SE CREA EL CORPUS
    const corpus =
        buildCorpus(documents);

    //SE OBTIENE EL IDF
    const idf =
        getIdf(corpus);

    //SE CREA EL VECTOR DE LA QUERY
    const queryVec =
        tfidfVector(q, idf);

    //SE CALCULA LA RELEVANCIA
    const results = documents.map((doc, i) => {

        const docVec =
            tfidfVector(corpus[i], idf);

        //SIMILITUD COSENO
        const tfidfScore =
            cosineSimilarity(queryVec, docVec);

        //BOOST EXTRA
        const boost =
            camposBoost(query, doc);

        return {
            ...doc,

            //PUNTAJE FINAL
            score: tfidfScore + boost
        };
    });

    //SE ORDENAN LOS RESULTADOS
    return results
        .sort((a, b) => b.score - a.score)
        .filter(r => r.score > 0);
}

//FUNCION PARA LIMPIAR EL CACHE
function invalidateCache() {

    _cachedIdf = null;
    _cachedCorpusKey = null;
}

//SE EXPORTAN LAS FUNCIONES
module.exports = {
    tfidfSearch,
    invalidateCache
};