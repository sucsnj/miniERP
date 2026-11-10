import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import path from "path";

import { lerLinhaDigitavel } from "@/services/ocrService";
import { lerPdfComOcr, info } from "@/services/pdfService";

export const config = {
    api: {
        bodyParser: false,
    },
};

const upload = multer({
    dest: "uploads/",
});

type MulterMiddleware = (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (result?: unknown) => void,
) => void;

// Função utilitária.
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: MulterMiddleware) {
    return new Promise((resolve, reject) => {

        fn(req, res, (result?: unknown) => {

            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        });
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido",
        });
    }

    await runMiddleware(req, res, upload.array("files") as unknown as MulterMiddleware);

    const files = (req as { files?: Express.Multer.File[] }).files;

    if (!files || files.length === 0) {

        return res.status(400).json({
            error: "Nenhum arquivo enviado",
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const resultados = [];

    for (const file of files) {

        const ext = path.extname(file.originalname).toLowerCase();

        let linhaDigitavel: string | null = null;

        try {

            console.log("PROCESSANDO:", file.originalname);

            if (ext === ".pdf") {

                console.log("PROCESSANDO PDF");

                linhaDigitavel = await lerPdfComOcr(file.path);

            } else {

                console.log("PROCESSANDO IMAGEM");

                linhaDigitavel = await lerLinhaDigitavel(file.path);
            }

            if (linhaDigitavel) {
                resultados.push({
                    arquivo: file.originalname + `${info}`,
                    linha: linhaDigitavel,
                });
            } else {
                resultados.push({
                    arquivo: file.originalname,
                    erro: "Erro no OCR",
                });
            }

        } catch (err) {

            console.error("Erro:", err);

            resultados.push({
                arquivo: file.originalname,
                erro: "Falha ao processar arquivo",
            });

        } finally {

            try {
                fs.unlinkSync(file.path);
            } catch { }

        }
    }

    return res.status(200).json(resultados);
}
