const keywordExtractor =
    require("keyword-extractor");

function sorter(
    texto
){

    const keywords =
        keywordExtractor.extract(
            texto,
            {
                language:"spanish",
                remove_digits:true,
                return_changed_case:true,
                remove_duplicates:true
            }
        );

    const contenido =
        texto.toLowerCase();

    let categoria =
        "General";

    if(

        contenido.includes("inteligencia artificial")
        ||
        contenido.includes(
            "machine learning"
        )
        ||
        contenido.includes(
            "deep learning"
        )
        ||
        contenido.includes(
            "red neuronal"
        )

    ){

        categoria =
            "Tecnología";
    }

    else if(

        contenido.includes("biología")
        ||
        contenido.includes("adn")
        ||
        contenido.includes("genética")
        ||
        contenido.includes("célula")

    ){

        categoria =
            "Ciencia";
    }

    else if(

        contenido.includes("álgebra")
        ||
        contenido.includes("matemática")
        ||
        contenido.includes("cálculo")

    ){

        categoria =
            "Matemáticas";
    }

    else if(

        contenido.includes("medicina")
        ||
        contenido.includes("hospital")
        ||
        contenido.includes("paciente")

    ){

        categoria =
            "Medicina";
    }

    const descripcion =
        texto
        .substring(0,300);

    return {

        categoria,

        keywords:
            keywords
            .slice(0,15)
            .join(", "),

        descripcion
    };
}

module.exports =
    sorter;