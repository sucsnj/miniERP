import Tesseract from "tesseract.js";

export async function lerLinhaDigitavel(imagemPath: string, regexConst: string = "regex1") {

    try {

        console.log("OCR EXECUTANDO:", imagemPath);

        const worker = await Tesseract.createWorker("eng");

        await worker.setParameters({
            tessedit_char_whitelist: "0123456789. "
        });

        const resultado = await worker.recognize(imagemPath);

        await worker.terminate();

        console.log("TEXTO OCR:");
        console.log(resultado.data.text);

        const texto = resultado.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ");

        const regex1 = /\d{5}\.?\d{5}\s?\d{5}\.?\d{6}\s?\d{5}\.?\d{6}\s?\d\s?\d{14}/g;
        const regex2 = /\d{5}[\s\.]?\d{5}[\s\.]?\d{5}[\s\.]?\d{6}[\s\.]?\d{5}[\s\.]?\d{6}[\s\.]?\d[\s\.]?\d{13,14}/g;
        let regex = null;

        if (regexConst === "regex1") {
            regex = regex1;
        } else {
            regex = regex2;
        }

        const matches = texto.match(regex);
        console.log("MATCHES:", matches);

        if (matches && matches.length > 0) {
            // pega sempre a última linha encontrada
            const linha = matches[matches.length - 1]
                .replace(/\s/g, "")
                .replace(/\./g, "");
            return linha;
        }

        return null;

    } catch (err) {

        console.error("Erro no OCR:", err);

        return null;
    }
}
