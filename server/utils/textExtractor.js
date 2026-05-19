//SE IMPORTAN LAS LIBRERIAS NECESARIAS
const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const extraerTextoImagen = require("./ocr");

//FUNCION PARA LIMPIAR EL TEXTO
function cleanText(text = "") {

    return text
        .toString()
        .replace(/\s+/g, " ")
        .replace(/http\S+/g, "")
        .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, " ")
        .toLowerCase()
        .trim();
}

//MINIMO DE TEXTO VALIDO
const MIN_TEXTO_DIGITAL = 50;

//FUNCION PRINCIPAL PARA EXTRAER TEXTO
async function textExtractor(ruta, tipo) {

    try {

        let text = "";

        //SE OBTIENE LA EXTENSION
        const ext =
            path.extname(ruta).toLowerCase();

        const mammoth =
            require("mammoth");

        const WordExtractor =
            require("word-extractor");

        //LECTURA DE PDF
        if (
            tipo.includes("pdf") ||
            ext === ".pdf"
        ) {

            const dataBuffer =
                await fs.readFile(ruta);

            const data =
                await pdfParse(dataBuffer);

            text = data.text || "";
        }

        //LECTURA DE WORD DOCX
        else if (
            ext === ".docx" ||
            tipo.includes("wordprocessingml")
        ) {

            const result =
                await mammoth.extractRawText({
                    path: ruta
                });

            text = result.value || "";
        }

        //LECTURA DE WORD DOC
        else if (
            ext === ".doc" ||
            tipo.includes("msword")
        ) {

            const extractor =
                new WordExtractor();

            const doc =
                await extractor.extract(ruta);

            text = doc.getBody();
        }

        //LECTURA DE EXCEL
        else if (

            ext === ".xlsx" ||
            ext === ".xls" ||

            tipo.includes("spreadsheetml") ||

            tipo.includes("ms-excel")
        ) {

            const buffer =
                await fs.readFile(ruta);

            const workbook =
                XLSX.read(buffer, {
                    type: "buffer"
                });

            //SE RECORREN LAS HOJAS
            workbook.SheetNames.forEach(name => {

                const sheet =
                    workbook.Sheets[name];

                text +=
                    XLSX.utils.sheet_to_csv(sheet)
                    + "\n";
            });
        }

        //POWERPOINT
        else if (

            ext === ".pptx" ||
            ext === ".ppt" ||

            tipo.includes("presentationml") ||

            tipo.includes("ms-powerpoint")
        ) {

            //SIN SOPORTE TODAVIA
            text = "";
        }

        //SE LIMPIA EL TEXTO
        return cleanText(text);

    } catch (error) {

        //SI HAY ERROR
        console.error(
            "[textExtractor] Error:",
            ruta,
            error.message
        );

        return "";
    }
}

//SE EXPORTA LA FUNCION
module.exports = textExtractor;