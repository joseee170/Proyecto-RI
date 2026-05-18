const fs = require("fs").promises; // async: no bloquea el event loop
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
            const dataBuffer = await fs.readFile(ruta); // ✅ async
            const data = await pdfParse(dataBuffer);
            text = data.text;
        }

        else if (
            tipo.includes("word") ||
            tipo.includes("officedocument")
        ) {
            const result = await mammoth.extractRawText({ path: ruta });
            text = result.value;
        }

        else if (
            tipo.includes("excel") ||
            tipo.includes("spreadsheet")
        ) {
            // XLSX no soporta promesas nativas, pero la lectura es rápida
            const buffer = await fs.readFile(ruta);
            const workbook = XLSX.read(buffer, { type: "buffer" });

            workbook.SheetNames.forEach(name => {
                const sheet = workbook.Sheets[name];
                text += XLSX.utils.sheet_to_csv(sheet) + "\n";
            });
        }

        return cleanText(text);

    } catch (error) {
        console.error("[textExtractor] Error al procesar:", ruta, error.message);
        return "";
    }
}

module.exports = textExtractor;
