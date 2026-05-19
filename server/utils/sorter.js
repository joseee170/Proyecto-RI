//SE IMPORTA EL TOKENIZADOR
const { tokenize } = require("./tokenizer");

//FUNCION PARA NORMALIZAR TEXTO
function normalize(text = "") {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

//FUNCION PARA CALCULAR TF
function termFrequency(words) {

    const tf = {};

    //TOTAL DE PALABRAS
    const total = words.length || 1;

    //SE CUENTAN LAS REPETICIONES
    words.forEach(w => {

        tf[w] = (tf[w] || 0) + 1;
    });

    //SE NORMALIZA EL VALOR TF
    Object.keys(tf).forEach(w => {

        tf[w] = tf[w] / total;
    });

    return tf;
}

//FUNCION PARA ORDENAR PALABRAS POR RELEVANCIA
function scorePalabras(words) {

    //SE CALCULA TF
    const tf = termFrequency(words);

    //SE ORDENAN LAS PALABRAS
    return Object.entries(tf)

        .sort((a, b) => b[1] - a[1])

        .map(([word]) => word);
}

//FUNCION PRINCIPAL PARA CLASIFICAR TEXTO
function sorter(texto) {

    //SI EL TEXTO ESTA VACIO
    if (!texto || !texto.trim()) {

        return {
            categoria: "General",
            keywords: "",
            descripcion: ""
        };
    }

    //SE TOKENIZA EL TEXTO
    const words =
        tokenize(normalize(texto));

    //SI NO HAY PALABRAS
    if (words.length === 0) {

        return {
            categoria: "General",
            keywords: "",
            descripcion: texto.substring(0, 300)
        };
    }

    //SE OBTIENEN LAS PALABRAS MAS IMPORTANTES
    const ranking =
        scorePalabras(words);

    //TOP 10 KEYWORDS
    const topKeywords =
        ranking.slice(0, 10);

    //SE DEFINE LA CATEGORIA
    const categoria =
        topKeywords[0]

        ? topKeywords[0]
            .charAt(0)
            .toUpperCase() +

          topKeywords[0]
            .slice(1)

        : "General";

    //SE UNEN LAS KEYWORDS
    const keywords =
        topKeywords.join(", ");

    //LIMITE DE DESCRIPCION
    const MAX_DESC = 300;

    let descripcion = texto;

    //SE RECORTA LA DESCRIPCION
    if (texto.length > MAX_DESC) {

        const corte =
            texto.lastIndexOf(
                " ",
                MAX_DESC
            );

        descripcion =
            texto.substring(
                0,
                corte > 0
                    ? corte
                    : MAX_DESC
            ) + "...";
    }

    //SE DEVUELVEN LOS DATOS
    return {
        categoria,
        keywords,
        descripcion
    };
}

//SE EXPORTA LA FUNCION
module.exports = sorter;