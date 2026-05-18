const { tokenize } = require("./tokenizer");

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

function inverseDocumentFrequency(docs) {
    const idf = {};
    const totalDocs = docs.length || 1;

    docs.forEach(doc => {
        const words = new Set(tokenize(doc));
        words.forEach(w => {
            idf[w] = (idf[w] || 0) + 1;
        });
    });

    Object.keys(idf).forEach(w => {
        idf[w] = Math.log((totalDocs + 1) / (idf[w] + 1)) + 1;
    });

    return idf;
}

function tfidfVector(text, idf) {
    const words = tokenize(text);
    const tf = termFrequency(words);

    const vector = {};

    Object.keys(tf).forEach(w => {
        vector[w] = tf[w] * (idf[w] || 0);
    });

    return vector;
}

module.exports = {
    inverseDocumentFrequency,
    tfidfVector
};
