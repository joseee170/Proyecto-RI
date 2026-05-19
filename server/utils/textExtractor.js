const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const extraerTextoImagen = require("./ocr");

function cleanText(text = "") {
    return text
        .toString()
        .replace(/\s+/g, " ")
        .replace(/http\S+/g, "")
        .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, " ")
        .toLowerCase()
        .trim();
}

// Mínimo de caracteres para considerar que el texto digital es válido
// Si hay menos, asumimos que el doc está escaneado y aplicamos OCR
const MIN_TEXTO_DIGITAL = 50;

async function textExtractor(ruta, tipo) {
    try {
        let text = "";
        const ext = path.extname(ruta).toLowerCase();
        const mammoth = require("mammoth");
        const WordExtractor = require("word-extractor");

        // ── PDF ──
        if (tipo.includes("pdf") || ext === ".pdf") {
            const dataBuffer = await fs.readFile(ruta);
            const data = await pdfParse(dataBuffer);
            text = data.text || "";
        }
        // ── WORD ──
        else if (
            ext === ".docx" ||
            tipo.includes("wordprocessingml")
        ) {
            // .docx — formato moderno
            const result = await mammoth.extractRawText({ path: ruta });
            text = result.value || "";
        }

        else if (
            ext === ".doc" ||
            tipo.includes("msword")
        ) {
            // .doc — formato antiguo Word 97-2003
            const extractor = new WordExtractor();
            const doc = await extractor.extract(ruta);
            text = doc.getBody();
        }

        // ── EXCEL ──
        else if (
            ext === ".xlsx" || ext === ".xls" ||
            tipo.includes("spreadsheetml") ||
            tipo.includes("ms-excel")
        ) {
            const buffer = await fs.readFile(ruta);
            const workbook = XLSX.read(buffer, { type: "buffer" });
            workbook.SheetNames.forEach(name => {
                const sheet = workbook.Sheets[name];
                text += XLSX.utils.sheet_to_csv(sheet) + "\n";
            });
            // Excel casi nunca está escaneado, no aplica OCR
        }

        // ── POWERPOINT ──
        else if (
            ext === ".pptx" || ext === ".ppt" ||
            tipo.includes("presentationml") ||
            tipo.includes("ms-powerpoint")
        ) {
            text = ""; // Sin soporte aún
        }

        return cleanText(text);

    } catch (error) {
        console.error("[textExtractor] Error:", ruta, error.message);
        return "";
    }
}

module.exports = textExtractor;
