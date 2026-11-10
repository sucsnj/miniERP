import { fromPath } from "pdf2pic";
import path from "path";
import { lerLinhaDigitavel } from "./ocrService";
import sharp from "sharp";
import { cleanTemp } from "../utils/cleaner";


// Função para extrair regiões de uma imagem
async function cropRegions(imgPath: string): Promise<string[]> {
    const metadata = await sharp(imgPath).metadata();
    const { width, height } = metadata;

    const regions: string[] = [];

    // Região inferior (30% até o fim)
    const bottomPath = imgPath.replace(".png", ".bottom.png");
    await sharp(imgPath)
        .extract({ left: 0, top: Math.floor(height * 0.7), width, height: Math.floor(height * 0.3) })
        .toFile(bottomPath);
    regions.push(bottomPath);

    // Região intermediária (40% até 70%)
    const midPath = imgPath.replace(".png", ".mid.png");
    await sharp(imgPath)
        .extract({ left: 0, top: Math.floor(height * 0.4), width, height: Math.floor(height * 0.3) })
        .toFile(midPath);
    regions.push(midPath);

    // Região ampla (30% até 80%)
    const widePath = imgPath.replace(".png", ".wide.png");
    await sharp(imgPath)
        .extract({ left: 0, top: Math.floor(height * 0.3), width, height: Math.floor(height * 0.5) })
        .toFile(widePath);
    regions.push(widePath);

    return regions;
}

// Cenários de pre-processamento de imagem
async function preprocessScenarios(imgPath: string): Promise<string[]> {
    const scenarios = [];

    // Cenário 1
    scenarios.push(imgPath.replace(".png", ".basic.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .threshold(180)
        .toFile(scenarios[0]);

    // Cenário 2
    scenarios.push(imgPath.replace(".png", ".contrast.png"));
    await sharp(imgPath)
        .resize({ width: 1500 })
        .grayscale()
        .threshold(200)
        .linear(1.2, -30)
        .toFile(scenarios[1]);

    // Cenário 3
    scenarios.push(imgPath.replace(".png", ".smooth.png"));
    await sharp(imgPath)
        .resize({ width: 1000 })
        .grayscale()
        .threshold(160)
        .blur(1)
        .toFile(scenarios[2]);

    // Cenário 4
    scenarios.push(imgPath.replace(".png", ".lowThresh.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .threshold(140)
        .toFile(scenarios[3]);

    // Cenário 5
    scenarios.push(imgPath.replace(".png", ".highThresh.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .threshold(220)
        .toFile(scenarios[4]);

    // Cenário 6
    scenarios.push(imgPath.replace(".png", ".bright.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .modulate({ brightness: 1.3 })
        .threshold(180)
        .toFile(scenarios[5]);

    // Cenário 7
    scenarios.push(imgPath.replace(".png", ".bigBlur.png"));
    await sharp(imgPath)
        .resize({ width: 2000 })
        .grayscale()
        .threshold(180)
        .blur(0.5)
        .toFile(scenarios[6]);

    // Cenário 8
    scenarios.push(imgPath.replace(".png", ".linear.png"));
    await sharp(imgPath)
        .resize({ width: 1500 })
        .grayscale()
        .threshold(190)
        .linear(1.4, -40)
        .toFile(scenarios[7]);

    // Cenário 9
    scenarios.push(imgPath.replace(".png", ".superBright.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .modulate({ brightness: 1.5 })
        .threshold(180)
        .toFile(scenarios[8]);

    // Cenário 10
    scenarios.push(imgPath.replace(".png", ".superDark.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .threshold(240)
        .toFile(scenarios[9]);

    // Cenário 11
    scenarios.push(imgPath.replace(".png", ".noiseReduction.png"));
    await sharp(imgPath)
        .resize({ width: 1200 })
        .grayscale()
        .threshold(170)
        .blur(2)
        .toFile(scenarios[10]);

    // Cenário 12
    scenarios.push(imgPath.replace(".png", ".maxScale.png"));
    await sharp(imgPath)
        .resize({ width: 2500 })
        .grayscale()
        .threshold(180)
        .linear(1.3, -20)
        .toFile(scenarios[11]);

    return scenarios;
}

export let info = "";

export async function lerPdfComOcr(pdfPath: string) {
    const converter = fromPath(pdfPath, {
        density: 400,
        saveFilename: "pagina",
        savePath: "./temp",
        format: "png",
        width: 2480,
        height: 3508,
    });

    for (let i = 1; i <= 3; i++) {
        try {
            const page = await converter(i);
            if (!page.path) {
                continue;
            }

            const imgPath = path.resolve(page.path);
            console.log("PNG GERADA:", imgPath);

            // const preImgPath = await preprocess(imgPath); // reprocessa a imagem
            let linha = await lerLinhaDigitavel(imgPath); // tenta por meio padrão
            if (!linha) {
                const preImgs = await preprocessScenarios(imgPath); // tenta por cenários de pre-processamento
                for (const preImg of preImgs) {
                    linha = await lerLinhaDigitavel(preImg); // imagem reprocessada
                    if (linha) break;
                }
            }

            // tenta com regiões
            if (!linha) {
                const crops = await cropRegions(imgPath);
                for (const crop of crops) {
                    linha = await lerLinhaDigitavel(crop);
                    if (linha) break;
                }
            }
            console.log("LINHA:", linha);

            if (linha) {
                // remove arquivos temporários
                info = "";
                await cleanTemp();
                return linha
            } else {
                // refaz com regex2
                linha = await lerLinhaDigitavel(imgPath, "regex2");
                info = " (ocr inconsistente)";
                if (linha) {
                    await cleanTemp();
                    return linha
                }
                await cleanTemp();
            };

        } catch (err) {
            console.error(`Erro página ${i}:`, err);
        }
    }
    return null;
}
