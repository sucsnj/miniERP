import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db/tabela.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
} catch (error) {
  console.error('Erro ao conectar ao banco de tabela:', error);
  throw error;
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tabela_search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      normalized_query TEXT NOT NULL UNIQUE,
      result_json TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (error) {
  console.error('Erro ao criar tabela de histórico de tabela:', error);
}

// Constante exportada com função.
export const findTabelaSearchHistory = (normalizedQuery: string) => {
  const stmt = db.prepare('SELECT * FROM tabela_search_history WHERE normalized_query = ?');
  return stmt.get(normalizedQuery) as Record<string, unknown> | null;
};

// Constante exportada com função.
export const saveTabelaSearchHistory = (query: string, normalizedQuery: string, results: unknown[]) => {
  const stmt = db.prepare(
    `INSERT INTO tabela_search_history (query, normalized_query, result_json, result_count, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(normalized_query) DO UPDATE SET
        query = excluded.query,
        result_json = excluded.result_json,
        result_count = excluded.result_count,
        updated_at = CURRENT_TIMESTAMP`
  );
  const result = stmt.run(query, normalizedQuery, JSON.stringify(results), results.length);
  pruneTabelaSearchHistory();
  return result;
};

// Constante exportada com função.
export const getRecentTabelaSearchHistory = () => {
  const stmt = db.prepare(
    'SELECT id, query, result_count, updated_at FROM tabela_search_history ORDER BY updated_at DESC LIMIT 25'
  );
  return stmt.all();
};

// Constante exportada com função.
export const clearTabelaSearchHistory = () => {
  const stmt = db.prepare('DELETE FROM tabela_search_history');
  return stmt.run();
};

// Função local ou componente.
const pruneTabelaSearchHistory = () => {
  const stmt = db.prepare(
    `DELETE FROM tabela_search_history
     WHERE id NOT IN (
       SELECT id FROM tabela_search_history ORDER BY updated_at DESC LIMIT 25
     )`
  );
  return stmt.run();
};

export default db;
