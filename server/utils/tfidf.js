//SE IMPORTA EL TOKENIZADOR
const { tokenize } = require("./tokenizer");

//FUNCION PARA CALCULAR TF
function termFrequency(words) {

    const tf = {};

    //TOTAL DE PALABRAS
    const total = words.length || 1;

    //SE CUENTAN LAS REPETICIONES
    words.forEach(w => {

        tf[w] = (tf[w] || 0) + 1;
    });

    //SE NORMALIZA EL TF
    Object.keys(tf).forEach(w => {

        tf[w] = tf[w] / total;
    });

    return tf;
}

//FUNCION PARA CALCULAR IDF
function inverseDocumentFrequency(docs) {

    const idf = {};

    //TOTAL DE DOCUMENTOS
    const totalDocs = docs.length || 1;

    //SE RECORREN LOS DOCUMENTOS
    docs.forEach(doc => {

        //SE OBTIENEN PALABRAS UNICAS
        const words =
            new Set(tokenize(doc));

        words.forEach(w => {

            idf[w] = (idf[w] || 0) + 1;
        });
    });

    //SE CALCULA EL IDF
    Object.keys(idf).forEach(w => {

        idf[w] =
            Math.log(
                (totalDocs + 1) /
                (idf[w] + 1)
            ) + 1;
    });

    return idf;
}

//FUNCION PARA CREAR EL VECTOR TFIDF
function tfidfVector(text, idf) {

    //SE TOKENIZA EL TEXTO
    const words =
        tokenize(text);

    //SE CALCULA TF
    const tf =
        termFrequency(words);

    const vector = {};

    //SE CALCULA TFIDF
    Object.keys(tf).forEach(w => {

        vector[w] =
            tf[w] *
            (idf[w] || 0);
    });

    return vector;
}

//SE EXPORTAN LAS FUNCIONES
module.exports = {
    inverseDocumentFrequency,
    tfidfVector
};