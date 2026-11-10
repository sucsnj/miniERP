import Database from 'better-sqlite3';
import path from 'path';
import { now, parseDate } from '../utils/date';

const dbPath = path.join(process.cwd(), 'db/contas.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
} catch (error) {
  console.error('Erro ao conectar ao banco de contas:', error);
  throw error;
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contas_detalhes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      distribuidora TEXT NOT NULL,
      valor REAL NOT NULL,
      vencimento TEXT NOT NULL,
      documento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      banco_observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabela de contas:', error);
}

// Constante exportada com função.
export interface ContaRow {
  id: number;
  distribuidora: string;
  valor: number;
  vencimento: string;
  documento: string;
  status: 'Pendente' | 'Pago';
  banco_observacoes: string | null;
  criado_em: string;
}

// Constante exportada com função.
export const insertConta = (
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
) => {
  const stmt = db.prepare(
    'INSERT INTO contas_detalhes (distribuidora, valor, vencimento, documento, status, banco_observacoes) VALUES (?, ?, ?, ?, ?, ?)',
  );
  return stmt.run(distribuidora, valor, vencimento, documento, 'Pendente', bancoObservacoes || null);
};

// Constante exportada com função.
export const getContasByPeriod = (ano: number, mes?: number) => {
  const startDate = `${ano}-${String(mes ?? 1).padStart(2, '0')}-01`;
  const endDate = mes ? parseDate(`${ano}-${mes}-01`).endOf('month').format('YYYY-MM-DD') : `${ano}-12-31`;

  const stmt = mes
    ? db.prepare('SELECT * FROM contas_detalhes WHERE vencimento >= ? AND vencimento <= ? ORDER BY vencimento DESC, id DESC')
    : db.prepare('SELECT * FROM contas_detalhes WHERE vencimento >= ? AND vencimento <= ? ORDER BY vencimento DESC, id DESC');

  return stmt.all(startDate, endDate) as unknown as ContaRow[];
};

// Constante exportada com função.
export const getContaById = (id: number) => {
  const stmt = db.prepare('SELECT * FROM contas_detalhes WHERE id = ?');
  return stmt.get(id);
};

// Constante exportada com função.
export const getAllContas = () => {
  const stmt = db.prepare('SELECT * FROM contas_detalhes ORDER BY vencimento DESC, id DESC');
  return stmt.all() as unknown as ContaRow[];
};

// Constante exportada com função.
export const updateConta = (
  id: number,
  distribuidora: string,
  valor: number,
  vencimento: string,
  documento: string,
  bancoObservacoes?: string,
) => {
  const stmt = db.prepare(
    'UPDATE contas_detalhes SET distribuidora = ?, valor = ?, vencimento = ?, documento = ?, banco_observacoes = ? WHERE id = ?',
  );
  return stmt.run(distribuidora, valor, vencimento, documento, bancoObservacoes || null, id);
};

// Constante exportada com função.
export const deleteConta = (id: number) => {
  const stmt = db.prepare('DELETE FROM contas_detalhes WHERE id = ?');
  return stmt.run(id);
};

// Constante exportada com função.
export const payConta = (id: number) => {
  const stmt = db.prepare('UPDATE contas_detalhes SET status = ? WHERE id = ?');
  return stmt.run('Pago', id);
};

// Constante exportada com função.
export const cancelPaymentConta = (id: number) => {
  const stmt = db.prepare('UPDATE contas_detalhes SET status = ? WHERE id = ?');
  return stmt.run('Pendente', id);
};

// Constante exportada com função.
export const backupContasDatabase = () => {
  const backupPath = path.join(process.cwd(), `db/contas-backup-${now().format('YYYY-MM-DD')}.db`);
  db.backup(backupPath);
  return backupPath;
};

export default db;
