import Database from 'better-sqlite3';
import path from 'path';
import { now, parseDate } from '../utils/date';

const dbPath = path.join(process.cwd(), 'db/notas.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
} catch (error) {
  console.error('Erro ao conectar ao banco de notas:', error);
  throw error;
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notas_detalhes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      distribuidora TEXT NOT NULL,
      chave TEXT NOT NULL,
      data_emissao TEXT NOT NULL,
      valor_nota REAL NOT NULL
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabela de notas:', error);
}

// Constante exportada com função.
export interface NotaRow {
  id: number;
  distribuidora: string;
  chave: string;
  data_emissao: string;
  valor_nota: number;
}

export const insertNota = (
  distribuidora: string,
  chave: string,
  dataEmissao: string,
  valorNota: number,
) => {
  const stmt = db.prepare(
    'INSERT INTO notas_detalhes (distribuidora, chave, data_emissao, valor_nota) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(distribuidora, chave, dataEmissao, valorNota);
};

// Constante exportada com função.
export const getNotasById = (id: number) => {
  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE id = ?');
  return stmt.get(id);
};

// soma notas de um determinado ano
export const getSumNotasByYear = (ano: number) => {
  const stmt = db.prepare(`
    SELECT SUM(valor_nota) AS total
    FROM notas_detalhes
    WHERE substr(data_emissao, 1, 10) >= ? AND substr(data_emissao, 1, 10) <= ?
  `);
  const row = stmt.get(`${ano}-01-01`, `${ano}-12-31`) as { total: number | null };
  return row?.total ?? 0;
};

// Constante exportada com função.
export const getNotasByValor = (valor: number) => {
  if (valor < 0) {
    return null;
  }

  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE valor_nota = ?');
  return stmt.get(valor);
};

// Constante exportada com função.
export const getNotasByPeriod = (ano: number, mes?: number) => {
  const startDate = `${ano}-${String(mes ?? 1).padStart(2, '0')}-01`;
  const endDate = mes ? parseDate(`${ano}-${mes}-01`).endOf('month').format('YYYY-MM-DD') : `${ano}-12-31`;

  // Usa substr(data_emissao, 1, 10) para extrair YYYY-MM-DD diretamente da string
  // sem passar pelo date() do SQLite, que interpreta offsets como UTC e troca o dia.
  const stmt = db.prepare(
    'SELECT * FROM notas_detalhes WHERE substr(data_emissao, 1, 10) >= ? AND substr(data_emissao, 1, 10) <= ? ORDER BY data_emissao DESC, id DESC'
  );

  return stmt.all(startDate, endDate) as unknown as NotaRow[];
};

// Constante exportada com função.
export const getAllNotas = () => {
  const stmt = db.prepare('SELECT * FROM notas_detalhes ORDER BY data_emissao DESC, id DESC');
  return stmt.all() as unknown as NotaRow[];
};

// Constante exportada com função.
export const deleteNota = (id: number) => {
  const stmt = db.prepare('DELETE FROM notas_detalhes WHERE id = ?');
  return stmt.run(id);
};

// Constante exportada com função.
export const backupNotasDatabase = () => {
  const backupPath = path.join(process.cwd(), `notas-backup-${now().format('YYYY-MM-DD')}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
