const natural =
    require("natural");

const { kmeans } =
    require("ml-kmeans");

function clusterDocuments(
    documentos = []
){

    if(
        documentos.length < 2
    ){

        return documentos.map(
            () => 0
        );
    }

    const tfidf =
        new natural.TfIdf();

    documentos.forEach(
        (doc) => {

            tfidf.addDocument(
                doc
            );
        }
    );

    const vocabulario =
        new Set();

    documentos.forEach(
        (doc) => {

            doc
            .split(/\s+/)
            .forEach((palabra) => {

                vocabulario.add(
                    palabra.toLowerCase()
                );
            });
        }
    );

    const palabras =
        Array.from(vocabulario);

    const vectores =
        documentos.map(
            (_, i) => {

                return palabras.map(
                    (palabra) => {

                        return tfidf.tfidf(
                            palabra,
                            i
                        );
                    }
                );
            }
        );

    const k =
        Math.min(
            5,
            documentos.length
        );

    const resultado =
        kmeans(
            vectores,
            k
        );

    return resultado.clusters;
}

module.exports =
    clusterDocuments;