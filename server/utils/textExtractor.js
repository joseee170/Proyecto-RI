const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

function cleanText(text = "") {

    return text
        .toString()
        .replace(/\s+/g, " ")
        .replace(/http\S+/g, "")
        .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, " ")
        .toLowerCase()
        .trim();
}

async function textExtractor(ruta, tipo) {

    try {

        let text = "";

        if (tipo.includes("pdf")) {

            const dataBuffer =
                fs.readFileSync(ruta);

            const data =
                await pdfParse(dataBuffer);

            text = data.text;
        }

        else if (
            tipo.includes("word") ||
            tipo.includes("officedocument")
        ) {

            const result =
                await mammoth.extractRawText({
                    path: ruta
                });

            text = result.value;
        }

        else if (
            tipo.includes("excel") ||
            tipo.includes("spreadsheet")
        ) {

            const workbook =
                XLSX.readFile(ruta);

            workbook.SheetNames.forEach(name => {

                const sheet =
                    workbook.Sheets[name];

                text +=
                    XLSX.utils.sheet_to_csv(sheet);
            });
        }

        return cleanText(text);

    } catch (error) {

        console.log(error);
        return "";
    }
}

module.exports =
    textExtractor;