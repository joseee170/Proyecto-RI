const keywordExtractor = require("keyword-extractor");

const sinonimos = {
    tecnologia: [
        "inteligencia artificial",
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

function normalizeText(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // elimina acentos antes de comparar
}

function detectCategory(text = "") {
    const normalized = normalizeText(text);

    let best = "General";
    let maxScore = 0;

    for (const category in sinonimos) {
        let score = 0;

        sinonimos[category].forEach(word => {
            // normalizar también las palabras del diccionario
            if (normalized.includes(normalizeText(word))) {
                score++;
            }
        });

        // desempate: si hay empate, mantiene la categoría previa (más específica)
        if (score > maxScore) {
            maxScore = score;
            best = category;
        }
    }

    return { categoria: best, confianza: maxScore };
}

function sorter(texto) {
    const keywords = keywordExtractor.extract(texto, {
        language: "spanish",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
    });

    const { categoria, confianza } = detectCategory(texto);

    // Cortar descripción en límite de palabra, sin romper palabras a la mitad
    const MAX_DESC = 300;
    let descripcion = texto;
    if (texto.length > MAX_DESC) {
        const corte = texto.lastIndexOf(" ", MAX_DESC);
        descripcion = texto.substring(0, corte > 0 ? corte : MAX_DESC) + "...";
    }

    const cleanKeywords = keywords
        .filter(k => k.length > 3)
        .slice(0, 10)
        .join(", ");

    return {
        categoria,
        confianza,   // útil para decidir si la categoría es confiable
        keywords: cleanKeywords,
        descripcion
    };
}

module.exports = sorter;
