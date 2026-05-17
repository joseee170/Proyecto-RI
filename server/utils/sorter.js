const keywordExtractor =
    require("keyword-extractor");

const sinonimos = {
    tecnologia: [
        "ia", "ai", "inteligencia artificial",
        "machine learning", "deep learning",
        "software", "programacion", "redes",
        "computadora", "backend", "frontend"
    ],
    ciencia: [
        "biologia", "adn", "genetica",
        "celula", "quimica", "fisica"
    ],
    matematicas: [
        "algebra", "calculo", "ecuacion",
        "derivada", "integral", "estadistica"
    ],
    medicina: [
        "hospital", "paciente", "medico",
        "salud", "diagnostico", "enfermedad"
    ],
    historia: [
        "guerra", "revolucion", "imperio",
        "civilizacion", "historia"
    ]
};

function detectCategory(text = "") {

    text = text.toLowerCase();

    let best = "General";
    let maxScore = 0;

    for (const category in sinonimos) {

        let score = 0;

        sinonimos[category].forEach(word => {

            if (text.includes(word)) {
                score++;
            }
        });

        if (score > maxScore) {
            maxScore = score;
            best = category;
        }
    }

    return best;
}

function sorter(texto) {

    const keywords =
        keywordExtractor.extract(texto, {
            language: "spanish",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });

    const categoria =
        detectCategory(texto);

    const descripcion =
        texto.substring(0, 300);

    const cleanKeywords =
        keywords
            .filter(k => k.length > 3)
            .slice(0, 10)
            .join(", ");

    return {

        categoria,
        keywords: cleanKeywords,
        descripcion
    };
}

module.exports =
    sorter;