import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import {
  findTabelaSearchHistory,
  saveTabelaSearchHistory,
  getRecentTabelaSearchHistory,
  clearTabelaSearchHistory,
} from '../../database/tabelaDb';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: 'uploads/' });

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

const normalizeText = (value: string) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const normalizeHeader = (header: string) =>
  header
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

// Função local ou componente.
const parseNumberValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
};

// Função local ou componente.
const parseTabelaWorksheet = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
    return rows;
  } catch (error) {
    console.error('Erro ao ler planilha de tabela:', error);
    return null;
  }
};

interface TabelaRow {
  substancia: string;
  laboratorio: string;
  ean: string;
  produto: string;
  apresentacao: string;
  classeTerapeutica: string;
  pf205: string;
  pmc205: string;
}

let cachedTabelaTable: Record<string, unknown>[] | null = null;

// Função local ou componente.
const loadTabelaTable = () => {
  if (cachedTabelaTable) {
    return cachedTabelaTable;
  }

  const tempDir = path.join(process.cwd(), 'temp');
  const jsonPath = path.join(tempDir, 'tabela-table.json');
  const xlsxPath = path.join(tempDir, 'tabela.xlsx');

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      cachedTabelaTable = JSON.parse(raw) as Record<string, unknown>[];
      return cachedTabelaTable;
    } catch (error) {
      console.error('Erro ao carregar tabela de tabela JSON:', error);
    }
  }

  if (fs.existsSync(xlsxPath)) {
    const parsed = parseTabelaWorksheet(xlsxPath);
    if (parsed) {
      try {
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (error) {
        console.error('Erro ao salvar tabela de tabela JSON:', error);
      }
      cachedTabelaTable = parsed;
      return cachedTabelaTable;
    }
  }

  return null;
};

// Função local ou componente.
const searchTabelaTable = (query: string, table: Record<string, unknown>[]) => {
  const normalizedQuery = normalizeText(query);
  const results = table
    .map((row) => {
      const values = {
        substancia: String(row.substancia ?? '').trim(),
        laboratorio: String(row.laboratorio ?? '').trim(),
        ean: String(row.ean ?? '').trim(),
        produto: String(row.produto ?? '').trim(),
        apresentacao: String(row.apresentacao ?? '').trim(),
        classeTerapeutica: String(row.classeTerapeutica ?? '').trim(),
        pf205: String(row.pf205 ?? '').trim(),
        pmc205: String(row.pmc205 ?? '').trim(),
      };

      const searchText = normalizeText(
        `${values.substancia} ${values.laboratorio} ${values.ean} ${values.produto} ${values.apresentacao} ${values.classeTerapeutica} ${values.pf205} ${values.pmc205}`
      );

      const substanciaText = normalizeText(values.substancia);
      const exactEan = normalizeText(values.ean) === normalizedQuery;
      const containsMatch = searchText.includes(normalizedQuery);

      if (!containsMatch && !exactEan) {
        return null;
      }

      let score = 0;
      if (substanciaText.includes(normalizedQuery)) {
        score += 100;
      }
      if (exactEan) {
        score += 50;
      }
      if (searchText.includes(normalizedQuery)) {
        score += 10;
      }
      if (String(values.produto).toLowerCase().includes(query.toLowerCase())) {
        score += 2;
      }

      return {
        row: values,
        score,
      };
    })
    .filter(Boolean) as Array<{ row: TabelaRow; score: number }>;

  return results
    .sort((a, b) => b.score - a.score)
    .map((item) => item.row);
};

loadTabelaTable();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await runMiddleware(req, res, upload.single('file') as unknown as MulterMiddleware);

    const file = (req as { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: 'Arquivo XLSX não enviado.' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Apenas arquivos XLSX ou XLS são aceitos.' });
    }

    try {
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (!rows || rows.length === 0) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'A planilha não contém dados.' });
      }

      const normalizedRows = rows
        .map((rawRow) => {
          const row: Record<string, unknown> = {};
          Object.entries(rawRow).forEach(([key, value]) => {
            const normalizedKey = normalizeHeader(key);
            row[normalizedKey] = value;
          });

          const pfValue = parseNumberValue(
            row.pf205 ?? row['pf205'] ?? row['pf205%'] ?? row['pf205percent'] ?? row['pf20_5'] ?? row['pf20,5'] ?? ''
          );
          const pmcValue = parseNumberValue(
            row.pmc205 ?? row['pmc205'] ?? row['pmc205%'] ?? row['pmc20,5'] ?? ''
          );

          return {
            substancia: String(row.substancia || row.substancia1 || row['substância'] || '').trim(),
            laboratorio: String(row.laboratorio || '').trim(),
            ean: String(row.ean1 || row.ean || '').trim(),
            produto: String(row.produto || '').trim(),
            apresentacao: String(row.apresentacao || '').trim(),
            classeTerapeutica: String(row.classeterapeutica || row['classe terapeutica'] || '').trim(),
            pf205: pfValue !== null ? String(pfValue).trim() : String(row.pf205 ?? row['pf205'] ?? row['pf205%'] ?? row['pf205percent'] ?? row['pf20_5'] ?? row['pf20,5'] ?? '').trim(),
            pmc205: pmcValue !== null ? String(pmcValue).trim() : String(row.pmc205 ?? row['pmc205'] ?? row['pmc205%'] ?? row['pmc20,5'] ?? '').trim(),
          };
        })
        .filter((item) => item.substancia || item.produto || item.ean);

      if (normalizedRows.length === 0) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'A planilha não possui colunas legíveis para a tabela.' });
      }

      cachedTabelaTable = normalizedRows;

      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const xlsxPath = path.join(tempDir, 'tabela.xlsx');
      const tablePath = path.join(tempDir, 'tabela-table.json');

      fs.copyFileSync(file.path, xlsxPath);
      fs.writeFileSync(tablePath, JSON.stringify(normalizedRows, null, 2), 'utf-8');

      fs.unlinkSync(file.path);

      return res.status(200).json({ message: 'Planilha de tabela carregada com sucesso.', rowCount: normalizedRows.length });
    } catch (error) {
      console.error('Erro ao processar planilha de tabela:', error);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(500).json({ error: 'Erro ao processar a planilha de tabela.' });
    }
  }

  if (req.method === 'GET') {
    const { query, history } = req.query;

    if (history === '1' || history === 'true') {
      try {
        const table = getRecentTabelaSearchHistory();
        return res.status(200).json(table);
      } catch (error) {
        console.error('Erro ao buscar histórico de tabela:', error);
        return res.status(500).json({ error: 'Erro ao buscar histórico.' });
      }
    }

    if (req.query.status === '1' || req.query.status === 'true') {
      const table = loadTabelaTable();
      return res.status(200).json({ loaded: Array.isArray(table), rowCount: Array.isArray(table) ? table.length : 0 });
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Parâmetro de busca obrigatório.' });
    }

    const normalizedQuery = normalizeText(query);
    const cached = findTabelaSearchHistory(normalizedQuery);
    if (cached) {
      try {
        const results = JSON.parse(cached.result_json as string);
        return res.status(200).json({ source: 'history', results, query });
      } catch (error) {
        console.error('Erro ao parsear resultados do cache de tabela:', error);
      }
    }

    const table = loadTabelaTable();
    if (!table) {
      return res.status(404).json({ error: 'Nenhuma planilha de tabela carregada. Faça upload de um arquivo XLSX antes de pesquisar.' });
    }

    const results = searchTabelaTable(query, table);
    try {
      saveTabelaSearchHistory(query, normalizedQuery, results);
    } catch (error) {
      console.error('Erro ao salvar histórico de tabela:', error);
    }

    return res.status(200).json({ source: 'table', results, query });
  }

  if (req.method === 'DELETE') {
    try {
      clearTabelaSearchHistory();
      return res.status(200).json({ message: 'Histórico de tabela limpo com sucesso.' });
    } catch (error) {
      console.error('Erro ao limpar histórico de tabela:', error);
      return res.status(500).json({ error: 'Erro ao limpar histórico.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
