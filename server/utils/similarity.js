//FUNCION PARA CALCULAR LA SIMILITUD COSENO
function cosineSimilarity(vecA, vecB) {

    //VARIABLES PARA LOS CALCULOS
    let dot = 0;
    let magA = 0;
    let magB = 0;

    //SE OBTIENEN TODAS LAS PALABRAS DE LOS DOS VECTORES
    const keys = new Set([
        ...Object.keys(vecA),
        ...Object.keys(vecB)
    ]);

    //SE RECORREN LAS PALABRAS
    keys.forEach(k => {

        const a = vecA[k] || 0;
        const b = vecB[k] || 0;

        //PRODUCTO PUNTO
        dot += a * b;

        //MAGNITUD DEL VECTOR A
        magA += a * a;

        //MAGNITUD DEL VECTOR B
        magB += b * b;
    });

    //SE CALCULA LA SIMILITUD COSENO
    return dot / (
        Math.sqrt(magA) *
        Math.sqrt(magB) || 1
    );
}

//SE EXPORTA LA FUNCION
module.exports = cosineSimilarity;