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
export interface InvoiceRow {
  id: number;
  distribuidora: string;
  chave: string;
  data_emissao: string;
  valor_nota: number;
}

export const insertInvoice = (
  supplierName: string,
  key: string,
  issueDate: string,
  invoiceAmount: number,
) => {
  const stmt = db.prepare(
    'INSERT INTO notas_detalhes (distribuidora, chave, data_emissao, valor_nota) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(supplierName, key, issueDate, invoiceAmount);
};

// Constante exportada com função.
export const getInvoicesById = (id: number) => {
  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE id = ?');
  return stmt.get(id);
};

// soma notas de um determinado ano
export const getInvoiceSumByYear = (year: number) => {
  const stmt = db.prepare(`
    SELECT SUM(valor_nota) AS total
    FROM notas_detalhes
    WHERE substr(data_emissao, 1, 10) >= ? AND substr(data_emissao, 1, 10) <= ?
  `);
  const row = stmt.get(`${year}-01-01`, `${year}-12-31`) as { total: number | null };
  return row?.total ?? 0;
};

// Constante exportada com função.
export const getInvoicesByAmount = (amount: number) => {
  if (amount < 0) {
    return null;
  }

  const stmt = db.prepare('SELECT * FROM notas_detalhes WHERE valor_nota = ?');
  return stmt.get(amount);
};

// Constante exportada com função.
export const getInvoicesByPeriod = (year: number, month?: number) => {
  const startDate = `${year}-${String(month ?? 1).padStart(2, '0')}-01`;
  const endDate = month ? parseDate(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD') : `${year}-12-31`;

  // Usa substr(data_emissao, 1, 10) para extrair YYYY-MM-DD diretamente da string
  // sem passar pelo date() do SQLite, que interpreta offsets como UTC e troca o dia.
  const stmt = db.prepare(
    'SELECT * FROM notas_detalhes WHERE substr(data_emissao, 1, 10) >= ? AND substr(data_emissao, 1, 10) <= ? ORDER BY data_emissao DESC, id DESC'
  );

  return stmt.all(startDate, endDate) as unknown as InvoiceRow[];
};

// Constante exportada com função.
export const getAllInvoices = () => {
  const stmt = db.prepare('SELECT * FROM notas_detalhes ORDER BY data_emissao DESC, id DESC');
  return stmt.all() as unknown as InvoiceRow[];
};

// Constante exportada com função.
export const deleteInvoice = (id: number) => {
  const stmt = db.prepare('DELETE FROM notas_detalhes WHERE id = ?');
  return stmt.run(id);
};

// Constante exportada com função.
export const backupInvoicesDatabase = () => {
  const backupPath = path.join(process.cwd(), `notas-backup-${now().format('YYYY-MM-DD')}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
