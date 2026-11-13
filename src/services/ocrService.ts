import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { extractDigitableLineFromText } from './boletoBarcode';

const WHITELIST = '0123456789. ';
const MAX_IMAGE_DIMENSION = 2200;

const imageVariants = async (source: Buffer): Promise<Buffer[]> => {
  const metadata = await sharp(source).metadata();
  const width = metadata.width ?? 1600;
  const resizeWidth = Math.min(Math.max(width, 1200), MAX_IMAGE_DIMENSION);
  const height = metadata.height ?? 1600;

  const grayscale = sharp(source, { failOn: 'none' }).grayscale().resize({ width: resizeWidth, withoutEnlargement: true });
  const bottom = sharp(source, { failOn: 'none' }).extract({
    left: 0,
    top: Math.floor(height * 0.55),
    width,
    height: height - Math.floor(height * 0.55),
  }).grayscale().resize({ width: resizeWidth, withoutEnlargement: true });

  return [
    source,
    await grayscale.clone().threshold(160).toBuffer(),
    await grayscale.clone().linear(1.4, -40).threshold(190).toBuffer(),
    await grayscale.clone().threshold(220).toBuffer(),
    await bottom.clone().threshold(160).toBuffer(),
    await bottom.clone().linear(1.3, -30).threshold(190).toBuffer(),
  ];
};

export const readDigitableLine = async (source: Buffer): Promise<string | null> => {
  const worker = await Tesseract.createWorker('eng');

  try {
    await worker.setParameters({
      tessedit_char_whitelist: WHITELIST,
      preserve_interword_spaces: '1',
    });

    for (const variant of await imageVariants(source)) {
      const result = await worker.recognize(variant);
      const line = extractDigitableLineFromText(result.data.text);
      if (line) return line;
    }

    return null;
  } finally {
    await worker.terminate();
  }
};
