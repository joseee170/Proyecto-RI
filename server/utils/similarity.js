function cosineSimilarity(vecA, vecB) {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    const keys = new Set([
        ...Object.keys(vecA),
        ...Object.keys(vecB)
    ]);

    keys.forEach(k => {

        const a = vecA[k] || 0;
        const b = vecB[k] || 0;

        dot += a * b;
        magA += a * a;
        magB += b * b;
    });

    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

module.exports = cosineSimilarity;