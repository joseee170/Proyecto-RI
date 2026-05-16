const fs = require("fs");

const pdfParse = require("pdf-parse");

const mammoth = require("mammoth");

const XLSX = require("xlsx");

async function textExtractor(
    ruta,
    tipo
){

    try{

        if(
            tipo.includes("pdf")
        ){

            const dataBuffer =
                fs.readFileSync(ruta);

            const data =
                await pdfParse(
                    dataBuffer
                );

            return data.text;
        }

        if(
            tipo.includes("word")
            ||
            tipo.includes(
                "officedocument"
            )
        ){

            const result =
                await mammoth.extractRawText(
                    { path:ruta }
                );

            return result.value;
        }

        if(
            tipo.includes("excel")
            ||
            tipo.includes(
                "spreadsheet"
            )
        ){

            const workbook =
                XLSX.readFile(
                    ruta
                );

            let texto = "";

            workbook.SheetNames.forEach(
                (sheetName) => {

                    const sheet =
                        workbook.Sheets[
                            sheetName
                        ];

                    texto +=
                        XLSX.utils.sheet_to_csv(
                            sheet
                        );
                }
            );

            return texto;
        }

        return "";

    }catch(error){

        console.log(error);

        return "";
    }
}

module.exports =
    textExtractor;