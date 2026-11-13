import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { readDigitableLine } from '@/services/ocrService';
import { readPdfWithOcr } from '@/services/pdfService';
import { requireAdminApi } from '../../utils/serverAuth';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error('Tipo de arquivo não suportado.'));
  },
});

type MulterMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (result?: unknown) => void,
) => void;

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: MulterMiddleware) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve();
    });
  });
}

const sniffMime = (buffer: Buffer): 'pdf' | 'image' | null => {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  if (buffer.length >= 4) {
    const png = buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const webp =
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.length >= 12 &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    if (png || jpeg || webp) return 'image';
  }
  return null;
};

interface OcrResult {
  id: string;
  arquivo: string;
  linhaDigitavel?: string;
  erro?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await runMiddleware(req, res, upload.array('files') as unknown as MulterMiddleware);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível ler os arquivos.';
    return res.status(400).json({ error: message });
  }

  const files = (req as { files?: Express.Multer.File[] }).files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const results: OcrResult[] = [];

  for (const file of files) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const kind = sniffMime(file.buffer);

    if (!kind) {
      results.push({ id, arquivo: file.originalname, erro: 'Arquivo inválido ou não suportado.' });
      continue;
    }

    try {
      if (kind === 'pdf') {
        const result = await readPdfWithOcr(file.buffer);
        if (result.linhaDigitavel) {
          results.push({ id, arquivo: file.originalname, linhaDigitavel: result.linhaDigitavel });
        } else {
          results.push({ id, arquivo: file.originalname, erro: 'Linha digitável não encontrada.' });
        }
        continue;
      }

      const linhaDigitavel = await readDigitableLine(file.buffer);
      results.push({
        id,
        arquivo: file.originalname,
        ...(linhaDigitavel
          ? { linhaDigitavel }
          : { erro: 'Linha digitável não encontrada.' }),
      });
    } catch (error) {
      console.error('Erro no OCR:', file.originalname, error);
      const message = error instanceof Error ? error.message : 'Falha ao processar arquivo';
      results.push({ id, arquivo: file.originalname, erro: message });
    }
  }

  return res.status(200).json(results);
}
