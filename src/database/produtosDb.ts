import Database from 'better-sqlite3';
import path from 'path';
import { seedUoms, seedCategorias, seedMarcas, seedFornecedores } from './seeds';

const dbPath = path.join(process.cwd(), 'db/produtos.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('Erro ao conectar ao banco de produtos:', error);
  throw error;
}

try {
  // Criação das tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS marcas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS unidades_medida (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sigla TEXT NOT NULL UNIQUE,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK(tipo = 'PRODUTO'),
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      unidade_medida_id INTEGER NOT NULL REFERENCES unidades_medida(id),
      marca_id INTEGER NOT NULL REFERENCES marcas(id),
      fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
      preco_compra REAL DEFAULT 0,
      margem_lucro REAL DEFAULT 0,
      preco_venda REAL DEFAULT 0,
      estoque INTEGER DEFAULT 0,
      multiplicador_unidade REAL NOT NULL DEFAULT 1,
      codigo_interno TEXT UNIQUE,
      referencia TEXT UNIQUE,
      ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS item_codigos_barras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      codigo_barras TEXT NOT NULL UNIQUE,
      principal INTEGER NOT NULL DEFAULT 0 CHECK(principal IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS item_unidades_medida (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      unidade_medida_id INTEGER NOT NULL REFERENCES unidades_medida(id),
      multiplicador_unidade REAL NOT NULL DEFAULT 1,
      principal INTEGER NOT NULL DEFAULT 0 CHECK(principal IN (0, 1)),
      UNIQUE(item_id, unidade_medida_id)
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      preco_venda REAL DEFAULT 0,
      codigo_interno TEXT UNIQUE,
      referencia TEXT UNIQUE,
      duracao_minutos INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
      item TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
      quantidade INTEGER NOT NULL,
      estoque_final INTEGER NOT NULL,
      descricao TEXT,
      data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      preco_venda REAL DEFAULT 0,
      codigo_interno TEXT UNIQUE,
      referencia TEXT,
      duracao_minutos INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const servicosTableInfo = db.prepare("PRAGMA table_info(servicos)").all() as Array<{ name: string }>;
  const servicosColumns = new Set(servicosTableInfo.map((column) => column.name));
  const servicosColumnDefinitions: Array<{ name: string; definition: string }> = [
    { name: 'descricao', definition: 'TEXT' },
    { name: 'categoria_id', definition: 'INTEGER NOT NULL REFERENCES categorias(id)' },
    { name: 'preco_venda', definition: 'REAL DEFAULT 0' },
    { name: 'codigo_interno', definition: 'TEXT UNIQUE' },
    { name: 'referencia', definition: 'TEXT' },
    { name: 'duracao_minutos', definition: 'INTEGER DEFAULT 0' },
    { name: 'data_criacao', definition: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
    { name: 'data_atualizacao', definition: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
  ];

  for (const column of servicosColumnDefinitions) {
    if (!servicosColumns.has(column.name)) {
      db.exec(`ALTER TABLE servicos ADD COLUMN ${column.name} ${column.definition}`);
    }
  }

  if (servicosColumns.has('ativo')) {
    db.exec('ALTER TABLE servicos DROP COLUMN ativo');
  }

  const itensTableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'itens'").get() as { sql?: string } | undefined;
  if (itensTableSql?.sql?.includes("'SERVICO'")) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      ALTER TABLE itens RENAME TO itens_legacy;

      CREATE TABLE itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL CHECK(tipo = 'PRODUTO'),
        nome TEXT NOT NULL,
        descricao TEXT,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id),
        unidade_medida_id INTEGER NOT NULL REFERENCES unidades_medida(id),
        marca_id INTEGER NOT NULL REFERENCES marcas(id),
        fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
        preco_compra REAL DEFAULT 0,
        margem_lucro REAL DEFAULT 0,
        preco_venda REAL DEFAULT 0,
        estoque INTEGER DEFAULT 0,
        multiplicador_unidade REAL NOT NULL DEFAULT 1,
        codigo_interno TEXT UNIQUE,
        referencia TEXT UNIQUE,
        ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO itens (
        id, tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id,
        fornecedor_id, preco_compra, margem_lucro, preco_venda, estoque,
        multiplicador_unidade, codigo_interno, referencia, ativo,
        data_criacao, data_atualizacao
      )
      SELECT
        id, tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id,
        fornecedor_id, preco_compra, margem_lucro, preco_venda, estoque,
        1, codigo_interno, referencia, ativo, data_criacao, data_atualizacao
      FROM itens_legacy WHERE tipo = 'PRODUTO';
      DELETE FROM item_codigos_barras WHERE item_id NOT IN (SELECT id FROM itens);
      DELETE FROM movimentacoes_estoque WHERE item_id NOT IN (SELECT id FROM itens);
      DROP TABLE itens_legacy;
    `);
    db.pragma('foreign_keys = ON');
  }

  const itensColumns = new Set(
    (db.prepare('PRAGMA table_info(itens)').all() as Array<{ name: string }>).map((column) => column.name)
  );
  if (!itensColumns.has('multiplicador_unidade')) {
    db.exec('ALTER TABLE itens ADD COLUMN multiplicador_unidade REAL NOT NULL DEFAULT 1');
  }

  // Seeding inicial para Unidades de Medida
  const countUom = db.prepare('SELECT count(*) as count FROM unidades_medida').get() as { count: number };
  if (countUom.count === 0) {
    const insertUom = db.prepare('INSERT INTO unidades_medida (sigla, descricao) VALUES (?, ?)');
    for (const uom of seedUoms) {
      insertUom.run(uom.sigla, uom.descricao);
    }
  }

  // Seeding inicial para Categoria
  const countCat = db.prepare('SELECT count(*) as count FROM categorias').get() as { count: number };
  if (countCat.count === 0) {
    const insertCategoria = db.prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)');
    for (const categoria of seedCategorias) {
      insertCategoria.run(categoria.nome, categoria.descricao);
    }
  }

  // Seeding inicial para Marca
  const countBrand = db.prepare('SELECT count(*) as count FROM marcas').get() as { count: number };
  if (countBrand.count === 0) {
    const insertMarca = db.prepare('INSERT INTO marcas (nome) VALUES (?)');
    for (const marca of seedMarcas) {
      insertMarca.run(marca.nome);
    }
  }

  // Seeding inicial para Fornecedores
  const countFornecedor = db.prepare('SELECT count(*) as count FROM fornecedores').get() as { count: number };
  if (countFornecedor.count === 0) {
    const insertFornecedor = db.prepare('INSERT INTO fornecedores (nome) VALUES (?)');
    for (const fornecedor of seedFornecedores) {
      insertFornecedor.run(fornecedor.nome);
    }
  }

  // Migration de unidades de medida da tabela itens para a nova tabela
  const countItemUnidades = db.prepare('SELECT count(*) as count FROM item_unidades_medida').get() as { count: number };
  if (countItemUnidades.count === 0) {
    const countItens = db.prepare("SELECT count(*) as count FROM itens WHERE tipo = 'PRODUTO'").get() as { count: number };
    if (countItens.count > 0) {
      db.exec(`
        INSERT INTO item_unidades_medida (item_id, unidade_medida_id, multiplicador_unidade, principal)
        SELECT id, unidade_medida_id, multiplicador_unidade, 1 FROM itens WHERE tipo = 'PRODUTO';
      `);
    }
  }

} catch (error) {
  console.error('Erro ao inicializar tabelas e seeds de produtos:', error);
}

const syncSharedAutoincrementSequence = () => {
  const rows = db.prepare("SELECT name, seq FROM sqlite_sequence WHERE name IN ('itens', 'servicos')").all() as Array<{ name: string; seq: number | null }>;
  const seqMap = new Map(rows.map(({ name, seq }) => [name, Number(seq) || 0]));

  if (!seqMap.has('itens')) {
    db.prepare("INSERT INTO sqlite_sequence (name, seq) VALUES ('itens', 0)").run();
    seqMap.set('itens', 0);
  }

  if (!seqMap.has('servicos')) {
    db.prepare("INSERT INTO sqlite_sequence (name, seq) VALUES ('servicos', 0)").run();
    seqMap.set('servicos', 0);
  }

  const maxExistingId = Math.max(
    (db.prepare('SELECT MAX(id) as max_id FROM itens').get() as { max_id: number | null }).max_id ?? 0,
    (db.prepare('SELECT MAX(id) as max_id FROM servicos').get() as { max_id: number | null }).max_id ?? 0
  );

  const sharedSeq = Math.max(maxExistingId, seqMap.get('itens') ?? 0, seqMap.get('servicos') ?? 0);

  db.prepare("UPDATE sqlite_sequence SET seq = ? WHERE name = 'itens'").run(sharedSeq);
  db.prepare("UPDATE sqlite_sequence SET seq = ? WHERE name = 'servicos'").run(sharedSeq);

  return sharedSeq;
};

syncSharedAutoincrementSequence();

export interface CategoriaRow {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface MarcaRow {
  id: number;
  nome: string;
}

export interface FornecedorRow {
  id: number;
  nome: string;
}

export interface UnidadeMedidaRow {
  id: number;
  sigla: string;
  descricao: string | null;
}

// Helpers para Categorias
export const getCategorias = () => {
  return db.prepare('SELECT * FROM categorias ORDER BY nome ASC').all() as unknown as CategoriaRow[];
};

export const getCategoriaById = (id: number) => {
  return db.prepare('SELECT * FROM categorias WHERE id = ?').get(id) as unknown as CategoriaRow | undefined;
};

export const insertCategoria = (nome: string, descricao?: string) => {
  const stmt = db.prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)');
  return stmt.run(nome, descricao || null);
};

// Apaga uma categoria, se houver itens associados, renomeia para a categoria "Geral" (id=1)
export const deleteCategoria = (id: number) => {
  if (id === 1) {
    throw new Error('Não é possível apagar a categoria Geral.');
  }
  const countItens = db.prepare('SELECT COUNT(*) as count FROM itens WHERE categoria_id = ?').get(id) as { count: number };
  if (countItens.count > 0) {
    // Atualiza os itens para a categoria Geral
    db.prepare('UPDATE itens SET categoria_id = 1 WHERE categoria_id = ?').run(id);
  }
  return db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
};

// Atualiza uma categoria em todos os itens associados
export const updateCategoria = (id: number, nome: string, descricao?: string) => {
  if (id === 1) {
    throw new Error('Não é possível atualizar a categoria Geral.');
  }
  return db.prepare('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?').run(nome, descricao || null, id);
};

// Helpers para Marcas
export const getMarcas = () => {
  return db.prepare('SELECT * FROM marcas ORDER BY nome ASC').all() as unknown as MarcaRow[];
};

export const getMarcaById = (id: number) => {
  return db.prepare('SELECT * FROM marcas WHERE id = ?').get(id) as unknown as MarcaRow | undefined;
};

export const insertMarca = (nome: string) => {
  const stmt = db.prepare('INSERT INTO marcas (nome) VALUES (?)');
  return stmt.run(nome);
};

// Deleta uma marca, se houver itens associados, renomeia para a marca "Outros" (id=1)
export const deleteMarca = (id: number) => {
  if (id === 1) {
    throw new Error('Não é possível apagar a marca Outros.');
  }
  const countItens = db.prepare('SELECT COUNT(*) as count FROM itens WHERE marca_id = ?').get(id) as { count: number };
  if (countItens.count > 0) {
    // Atualiza os itens para a marca Outros
    db.prepare('UPDATE itens SET marca_id = 1 WHERE marca_id = ?').run(id);
  }
  return db.prepare('DELETE FROM marcas WHERE id = ?').run(id);
};

// Atualiza uma marca em todos os itens associados
export const updateMarca = (id: number, nome: string) => {
  if (id === 1) {
    throw new Error('Não é possível atualizar a marca Outros.');
  }

  return db.prepare('UPDATE marcas SET nome = ? WHERE id = ?').run(nome || null, id);
};

// Helpers para Fornecedores
export const getFornecedores = () => {
  return db.prepare('SELECT * FROM fornecedores ORDER BY nome ASC').all() as unknown as FornecedorRow[];
};

export const getFornecedorById = (id: number) => {
  return db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id) as unknown as FornecedorRow | undefined;
};

export const insertFornecedor = (nome: string) => {
  const stmt = db.prepare('INSERT INTO fornecedores (nome) VALUES (?)');
  return stmt.run(nome);
};

// Deleta um fornecedor, se houver itens associados, renomeia para o fornecedor "Sem fornecedor" (id=1)
export const deleteFornecedor = (id: number) => {
  if (id === 1) {
    throw new Error('Não é possível apagar o fornecedor Sem fornecedor.');
  }
  const countItens = db.prepare('SELECT COUNT(*) as count FROM itens WHERE fornecedor_id = ?').get(id) as { count: number };
  if (countItens.count > 0) {
    // Atualiza os itens para o fornecedor Sem fornecedor
    db.prepare('UPDATE itens SET fornecedor_id = 1 WHERE fornecedor_id = ?').run(id);
  }
  return db.prepare('DELETE FROM fornecedores WHERE id = ?').run(id);
};

// Atualiza um fornecedor em todos os itens associados
export const updateFornecedor = (id: number, nome: string) => {
  if (id === 1) {
    throw new Error('Não é possível atualizar o fornecedor Sem fornecedor.');
  }

  return db.prepare('UPDATE fornecedores SET nome = ? WHERE id = ?').run(nome || null, id);
};

// Helpers para Unidades de Medida
export const getUnidadesMedida = () => {
  return db.prepare('SELECT * FROM unidades_medida ORDER BY sigla ASC').all() as unknown as UnidadeMedidaRow[];
};

export const getUnidadeMedidaById = (id: number) => {
  return db.prepare('SELECT * FROM unidades_medida WHERE id = ?').get(id) as unknown as UnidadeMedidaRow | undefined;
};

export const insertUnidadeMedida = (sigla: string, descricao?: string) => {
  const stmt = db.prepare('INSERT INTO unidades_medida (sigla, descricao) VALUES (?, ?)');
  return stmt.run(sigla, descricao || null);
};

export const updateUnidadeMedida = (id: number, sigla: string, descricao?: string) => {
  // Se a sigla estiver dentro de seedUoms, não pode ser atualizada
  if (seedUoms.some((uom) => uom.sigla === sigla)) {
    throw new Error('Não é possível atualizar a unidade de medida ' + sigla);
  }
  return db.prepare('UPDATE unidades_medida SET sigla = ?, descricao = ? WHERE id = ?').run(sigla || null, descricao || null, id);
};

export const deleteUnidadeMedida = (id: number) => {
  if (id === 1) {
    throw new Error('Não é possível apagar a unidade de medida UN.');
  }
  const countItens = db.prepare('SELECT COUNT(*) as count FROM itens WHERE unidade_medida_id = ?').get(id) as { count: number };
  if (countItens.count > 0) {
    // Atualiza os itens para a unidade de medida UN
    db.prepare('UPDATE itens SET unidade_medida_id = 1 WHERE unidade_medida_id = ?').run(id);
  }
  return db.prepare('DELETE FROM unidades_medida WHERE id = ?').run(id);
};

export interface ServicoData {
  id: number;
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos: number;
  data_criacao: string;
  data_atualizacao: string;
  categoria_nome?: string;
}

export interface ServicoInput {
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos?: number;
}

export interface MovimentacaoEstoqueData {
  id: number;
  item_id: number;
  item: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  estoque_final: number;
  descricao?: string;
  data_movimentacao: string;
}

export interface MovimentacaoEstoqueInput {
  item_id: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  descricao?: string;
}

const normalizeTipoMovimentacao = (tipo: string) => {
  const upper = String(tipo).trim().toUpperCase();
  if (upper !== 'ENTRADA' && upper !== 'SAIDA' && upper !== 'AJUSTE') {
    throw new Error('Tipo de movimentação inválido.');
  }
  return upper as 'ENTRADA' | 'SAIDA' | 'AJUSTE';
};

const insertMovimentacaoEstoqueRaw = (movement: MovimentacaoEstoqueInput) => {
  const itemRow = db.prepare('SELECT nome, estoque FROM itens WHERE id = ?').get(movement.item_id) as { nome: string; estoque: number } | undefined;
  if (!itemRow) {
    throw new Error('Item não encontrado para movimentação de estoque.');
  }

  const tipo = normalizeTipoMovimentacao(movement.tipo);
  const quantidade = Number(movement.quantidade);
  if (!Number.isFinite(quantidade)) {
    throw new Error('Quantidade inválida para movimentação de estoque.');
  }
  if ((tipo === 'ENTRADA' || tipo === 'SAIDA') && quantidade <= 0) {
    throw new Error('Quantidade deve ser maior que zero para entrada e saída.');
  }
  if (tipo === 'AJUSTE' && quantidade === 0) {
    throw new Error('Quantidade não pode ser zero para ajuste.');
  }

  let estoqueFinal = itemRow.estoque ?? 0;
  if (tipo === 'ENTRADA') {
    estoqueFinal += quantidade;
  } else if (tipo === 'SAIDA') {
    estoqueFinal -= quantidade;
  } else {
    estoqueFinal += quantidade;
  }

  db.prepare('UPDATE itens SET estoque = ? WHERE id = ?').run(estoqueFinal, movement.item_id);
  return db.prepare(`
    INSERT INTO movimentacoes_estoque (item_id, item, tipo, quantidade, estoque_final, descricao, data_movimentacao)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
  `).run(
    movement.item_id,
    itemRow.nome,
    tipo,
    quantidade,
    estoqueFinal,
    movement.descricao || null
  );
};

export const insertMovimentacaoEstoque = db.transaction(insertMovimentacaoEstoqueRaw);

export const getMovimentacoesEstoque = (itemId: number) => {
  return db.prepare(
    'SELECT id, item_id, item, tipo, quantidade, estoque_final, descricao, data_movimentacao FROM movimentacoes_estoque WHERE item_id = ? ORDER BY data_movimentacao DESC, id DESC'
  ).all(itemId) as MovimentacaoEstoqueData[];
};

// Validações de Unicidade
export const checkDuplicateCodigoInterno = (codigoInterno: string, excludeId?: number) => {
  if (!codigoInterno || !codigoInterno.trim()) return false;
  let query = 'SELECT id FROM itens WHERE LOWER(codigo_interno) = LOWER(?)';
  const params: unknown[] = [codigoInterno.trim()];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const row = db.prepare(query).get(...params);
  return !!row;
};

export const checkDuplicateBarcode = (barcodes: string[], excludeItemId?: number) => {
  const cleaned = barcodes.map(b => b.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;

  let query = 'SELECT codigo_barras FROM item_codigos_barras WHERE codigo_barras IN (';
  query += cleaned.map(() => '?').join(',');
  query += ')';

  const params: unknown[] = [...cleaned];
  if (excludeItemId) {
    query += ' AND item_id != ?';
    params.push(excludeItemId);
  }

  const row = db.prepare(query).get(...params) as { codigo_barras: string } | undefined;
  return row ? row.codigo_barras : null;
};

// CRUD de Serviços
export interface ServicoData {
  id: number;
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos: number;
  data_criacao: string;
  data_atualizacao: string;
  categoria_nome?: string;
}

export interface ServicoInput {
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos?: number;
}

export const checkDuplicateServicoCodigoInterno = (codigoInterno: string, excludeId?: number) => {
  if (!codigoInterno || !codigoInterno.trim()) return false;
  let query = 'SELECT id FROM servicos WHERE LOWER(codigo_interno) = LOWER(?)';
  const params: unknown[] = [codigoInterno.trim()];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const row = db.prepare(query).get(...params);
  return !!row;
};

export const getServicos = (options: {
  search?: string;
  categoria_id?: number;
  ativo?: number;
  page?: number;
  pageSize?: number;
}) => {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const queryConditions: string[] = [];
  const params: unknown[] = [];

  if (options.categoria_id) {
    queryConditions.push('s.categoria_id = ?');
    params.push(options.categoria_id);
  }

  if (options.search && options.search.trim()) {
    const searchLike = `%${options.search.trim()}%`;
    queryConditions.push('(s.nome LIKE ? OR s.codigo_interno LIKE ? OR s.referencia LIKE ?)');
    params.push(searchLike, searchLike, searchLike);
  }

  const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*) as count FROM servicos s ${whereClause}`;
  const totalCount = (db.prepare(countQuery).get(...params) as { count: number }).count;

  const servicesQuery = `
    SELECT
      s.id,
      s.nome,
      s.descricao,
      s.categoria_id,
      s.preco_venda,
      s.codigo_interno,
      s.referencia,
      s.duracao_minutos,
      s.data_criacao,
      s.data_atualizacao,
      c.nome as categoria_nome
    FROM servicos s
    JOIN categorias c ON s.categoria_id = c.id
    ${whereClause}
    ORDER BY s.nome ASC
    LIMIT ? OFFSET ?
  `;

  const services = db.prepare(servicesQuery).all(...params, pageSize, offset) as ServicoData[];

  return {
    services,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

export const getServicoById = (id: number) => {
  return db.prepare(`
    SELECT
      s.id,
      s.nome,
      s.descricao,
      s.categoria_id,
      s.preco_venda,
      s.codigo_interno,
      s.referencia,
      s.duracao_minutos,
      s.data_criacao,
      s.data_atualizacao,
      c.nome as categoria_nome
    FROM servicos s
    JOIN categorias c ON s.categoria_id = c.id
    WHERE s.id = ?
  `).get(id) as ServicoData | undefined;
};

export const insertServico = db.transaction((servicoData: ServicoInput) => {
  syncSharedAutoincrementSequence();

  const stmt = db.prepare(`
    INSERT INTO servicos (
      nome,
      descricao,
      categoria_id,
      preco_venda,
      codigo_interno,
      referencia,
      duracao_minutos,
      data_criacao,
      data_atualizacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
  `);

  const result = stmt.run(
    servicoData.nome,
    servicoData.descricao || null,
    servicoData.categoria_id,
    servicoData.preco_venda ?? 0,
    servicoData.codigo_interno ? servicoData.codigo_interno.trim() : null,
    servicoData.referencia || null,
    servicoData.duracao_minutos ?? 0,
  );

  if (!servicoData.codigo_interno) {
    const updateCodigoInterno = db.prepare(`
      UPDATE servicos
      SET codigo_interno = ?
      WHERE id = ?
    `);
    updateCodigoInterno.run((result.lastInsertRowid as number).toString(), result.lastInsertRowid as number);
  }

  return result.lastInsertRowid as number;
});

export const updateServico = db.transaction((id: number, servicoData: ServicoInput) => {
  const stmt = db.prepare(`
    UPDATE servicos
    SET nome = ?, descricao = ?, categoria_id = ?, preco_venda = ?, codigo_interno = ?, referencia = ?, duracao_minutos = ?, data_atualizacao = datetime('now', 'localtime')
    WHERE id = ?
  `);

  stmt.run(
    servicoData.nome,
    servicoData.descricao || null,
    servicoData.categoria_id,
    servicoData.preco_venda ?? 0,
    servicoData.codigo_interno ? servicoData.codigo_interno.trim() : null,
    servicoData.referencia || null,
    servicoData.duracao_minutos ?? 0,
    id
  );

  return true;
});

export const deleteServico = (id: number) => {
  return db.prepare('DELETE FROM servicos WHERE id = ?').run(id);
};

// CRUD de Produtos
export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemUnidadeData {
  unidade_medida_id: number;
  multiplicador_unidade: number;
  principal: number;
  sigla?: string;
  descricao?: string;
}

export interface ItemInput {
  tipo: 'PRODUTO';
  nome: string;
  descricao?: string;
  categoria_id: number;
  unidade_medida_id: number;
  marca_id: number;
  fornecedor_id: number;
  preco_compra: number;
  margem_lucro: number;
  preco_venda: number;
  estoque: number;
  multiplicador_unidade: number;
  codigo_interno?: string;
  referencia?: string | null;
  ativo?: number;
  codigos_barras?: BarcodeData[];
  unidades_medida?: ItemUnidadeData[];
}

export interface ItemRow extends ItemInput {
  id: number;
  data_criacao: string;
  data_atualizacao: string;
  categoria_nome: string;
  marca_nome: string;
  unidade_medida_sigla: string;
  unidade_medida_descricao: string;
  duracao_minutos?: number | null;
}

export const getItens = (options: {
  search?: string;
  categoria_id?: number;
  marca_id?: number;
  fornecedor_id?: number;
  ativo?: number; // 0 para Inativo, 1 para Ativo, undefined para Todos
  page?: number;
  pageSize?: number;
}) => {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const productConditions: string[] = [];
  const productParams: unknown[] = [];

  if (options.categoria_id) {
    productConditions.push('i.categoria_id = ?');
    productParams.push(options.categoria_id);
  }

  if (options.marca_id) {
    productConditions.push('i.marca_id = ?');
    productParams.push(options.marca_id);
  }

  if (options.fornecedor_id) {
    productConditions.push('i.fornecedor_id = ?');
    productParams.push(options.fornecedor_id);
  }

  if (options.ativo !== undefined) {
    productConditions.push('i.ativo = ?');
    productParams.push(options.ativo);
  }

  if (options.search && options.search.trim()) {
    const searchLike = `%${options.search.trim()}%`;
    productConditions.push('(i.nome LIKE ? OR i.codigo_interno LIKE ? OR i.referencia LIKE ? OR i.id IN (SELECT item_id FROM item_codigos_barras WHERE codigo_barras LIKE ?))');
    productParams.push(searchLike, searchLike, searchLike, searchLike);
  }

  const productWhereClause = productConditions.length > 0 ? `WHERE ${productConditions.join(' AND ')}` : '';

  const productQuery = `
    SELECT
      i.id,
      i.tipo,
      i.nome,
      i.descricao,
      i.categoria_id,
      i.unidade_medida_id,
      i.marca_id,
      i.fornecedor_id,
      i.preco_compra,
      i.margem_lucro,
      i.preco_venda,
      i.estoque,
      i.multiplicador_unidade,
      i.estoque * i.multiplicador_unidade as estoque_total,
      i.codigo_interno,
      i.referencia,
      i.ativo,
      i.data_criacao,
      i.data_atualizacao,
      c.nome as categoria_nome,
      m.nome as marca_nome,
      u.sigla as unidade_medida_sigla,
      u.descricao as unidade_medida_descricao,
      NULL as duracao_minutos
    FROM itens i
    JOIN categorias c ON i.categoria_id = c.id
    JOIN marcas m ON i.marca_id = m.id
    JOIN fornecedores f ON i.fornecedor_id = f.id
    JOIN unidades_medida u ON i.unidade_medida_id = u.id
    ${productWhereClause}
  `;

  const countQuery = `SELECT COUNT(*) as count FROM (${productQuery}) as product_items`;
  const totalCount = (db.prepare(countQuery).get(...productParams) as { count: number }).count;

  const itemsQuery = `
    SELECT * FROM (${productQuery}) as product_items
    ORDER BY nome ASC
    LIMIT ? OFFSET ?
  `;

  const items = db.prepare(itemsQuery).all(...productParams, pageSize, offset) as unknown as ItemRow[];

  const barcodesStmt = db.prepare('SELECT codigo_barras, principal FROM item_codigos_barras WHERE item_id = ? ORDER BY principal DESC');
  const unidadesStmt = db.prepare(`
    SELECT um.unidade_medida_id, um.multiplicador_unidade, um.principal, u.sigla, u.descricao
    FROM item_unidades_medida um
    JOIN unidades_medida u ON um.unidade_medida_id = u.id
    WHERE um.item_id = ?
    ORDER BY um.principal DESC, u.sigla ASC
  `);

  for (const item of items) {
    item.codigos_barras = barcodesStmt.all(item.id) as unknown as BarcodeData[];
    item.unidades_medida = unidadesStmt.all(item.id) as unknown as ItemUnidadeData[];
    if (!item.unidades_medida || item.unidades_medida.length === 0) {
      item.unidades_medida = [{
        unidade_medida_id: item.unidade_medida_id,
        multiplicador_unidade: item.multiplicador_unidade,
        principal: 1,
        sigla: item.unidade_medida_sigla,
        descricao: item.unidade_medida_descricao
      }];
    }
  }

  return {
    items,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

export const getItemById = (id: number) => {
  const item = db.prepare(`
    SELECT 
      i.id,
      i.tipo,
      i.nome,
      i.descricao,
      i.categoria_id,
      i.unidade_medida_id,
      i.marca_id,
      i.fornecedor_id,
      i.preco_compra,
      i.margem_lucro,
      i.preco_venda,
      i.estoque,
      i.multiplicador_unidade,
      i.estoque * i.multiplicador_unidade as estoque_total,
      i.codigo_interno,
      i.referencia,
      i.ativo,
      i.data_criacao,
      i.data_atualizacao,
      c.nome as categoria_nome,
      m.nome as marca_nome,
      u.sigla as unidade_medida_sigla,
      u.descricao as unidade_medida_descricao
    FROM itens i
    JOIN categorias c ON i.categoria_id = c.id
    JOIN marcas m ON i.marca_id = m.id
    JOIN fornecedores f ON i.fornecedor_id = f.id
    JOIN unidades_medida u ON i.unidade_medida_id = u.id
    WHERE i.id = ?
  `).get(id) as unknown as ItemRow | undefined;

  if (item) {
    item.codigos_barras = db.prepare('SELECT codigo_barras, principal FROM item_codigos_barras WHERE item_id = ? ORDER BY principal DESC').all(id) as unknown as BarcodeData[];
    const unidades = db.prepare(`
      SELECT um.unidade_medida_id, um.multiplicador_unidade, um.principal, u.sigla, u.descricao
      FROM item_unidades_medida um
      JOIN unidades_medida u ON um.unidade_medida_id = u.id
      WHERE um.item_id = ?
      ORDER BY um.principal DESC, u.sigla ASC
    `).all(id);

    if (unidades && unidades.length > 0) {
      item.unidades_medida = unidades as unknown as ItemUnidadeData[];
    } else {
      item.unidades_medida = [{
        unidade_medida_id: item.unidade_medida_id,
        multiplicador_unidade: item.multiplicador_unidade,
        principal: 1,
        sigla: item.unidade_medida_sigla,
        descricao: item.unidade_medida_descricao
      }];
    }
  }
  return item;
};

export const getItemByBarcode = (barcode: string) => {
  const codigo = String(barcode || '').trim();
  if (!codigo) return undefined;

  const row = db.prepare('SELECT item_id FROM item_codigos_barras WHERE codigo_barras = ?').get(codigo) as { item_id: number } | undefined;
  if (!row) return undefined;

  return getItemById(row.item_id);
};

export const insertItem = db.transaction((itemData: ItemInput) => {
  syncSharedAutoincrementSequence();

  const itemStmt = db.prepare(`
    INSERT INTO itens (tipo, nome, descricao, categoria_id, unidade_medida_id, marca_id, fornecedor_id, preco_compra, margem_lucro, preco_venda, estoque, multiplicador_unidade, codigo_interno, referencia, ativo, data_criacao, data_atualizacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
  `);

  const result = itemStmt.run(
    itemData.tipo,
    itemData.nome,
    itemData.descricao || null,
    itemData.categoria_id,
    itemData.unidade_medida_id,
    itemData.marca_id,
    itemData.fornecedor_id,
    itemData.preco_compra,
    itemData.margem_lucro,
    itemData.preco_venda,
    0, // Inicializa com 0 para que a movimentação some a quantidade correta depois
    itemData.multiplicador_unidade,
    itemData.codigo_interno ? itemData.codigo_interno.trim() : null,
    itemData.referencia ? itemData.referencia.trim() : null,
    itemData.ativo !== undefined ? itemData.ativo : 1
  );

  // Se não houve codigo_interno, coloca o id no lugar
  if (!itemData.codigo_interno) {
    const updateCodigoInterno = db.prepare(`
      UPDATE itens
      SET codigo_interno = ?
      WHERE id = ?
    `);
    updateCodigoInterno.run((result.lastInsertRowid as number).toString(), result.lastInsertRowid as number);
  }

  // Se for serviço, coloca o id 21 na unidade_medida
  const itemId = result.lastInsertRowid as number;

  if (itemData.codigos_barras && itemData.codigos_barras.length > 0) {
    const barcodeStmt = db.prepare(`
      INSERT INTO item_codigos_barras (item_id, codigo_barras, principal)
      VALUES (?, ?, ?)
    `);
    for (const cb of itemData.codigos_barras) {
      barcodeStmt.run(itemId, cb.codigo_barras.trim(), cb.principal ? 1 : 0);
    }
  }

  if (itemData.unidades_medida && itemData.unidades_medida.length > 0) {
    const umStmt = db.prepare(`
      INSERT INTO item_unidades_medida (item_id, unidade_medida_id, multiplicador_unidade, principal)
      VALUES (?, ?, ?, ?)
    `);
    for (const u of itemData.unidades_medida) {
      umStmt.run(itemId, u.unidade_medida_id, u.multiplicador_unidade, u.principal ? 1 : 0);
    }
  } else if (itemData.tipo === 'PRODUTO') {
    db.prepare(`
      INSERT INTO item_unidades_medida (item_id, unidade_medida_id, multiplicador_unidade, principal)
      VALUES (?, ?, ?, 1)
    `).run(itemId, itemData.unidade_medida_id, itemData.multiplicador_unidade);
  }

  const initialStock = Number(itemData.estoque);
  // Estoque inicial zero é válido; somente gera movimentação se houver entrada positiva.
  if (itemData.tipo === 'PRODUTO' && initialStock > 0) {
    insertMovimentacaoEstoqueRaw({
      item_id: itemId,
      tipo: 'ENTRADA',
      quantidade: initialStock,
      descricao: 'Estoque inicial via cadastro',
    });
  }

  return itemId;
});

export const updateItem = db.transaction((id: number, itemData: ItemInput) => {
  const currentStockRow = db.prepare('SELECT estoque FROM itens WHERE id = ?').get(id) as { estoque: number } | undefined;
  const currentStock = currentStockRow?.estoque ?? 0;
  const targetStock = Number(itemData.estoque);

  const itemStmt = db.prepare(`
    UPDATE itens 
    SET tipo = ?, nome = ?, descricao = ?, categoria_id = ?, unidade_medida_id = ?, marca_id = ?, fornecedor_id = ?, preco_compra = ?, margem_lucro = ?, preco_venda = ?, multiplicador_unidade = ?, referencia = ?, ativo = ?, data_atualizacao = datetime('now', 'localtime')
    WHERE id = ?
  `);

  itemStmt.run(
    itemData.tipo,
    itemData.nome,
    itemData.descricao || null,
    itemData.categoria_id,
    itemData.unidade_medida_id,
    itemData.marca_id,
    itemData.fornecedor_id,
    itemData.preco_compra,
    itemData.margem_lucro,
    itemData.preco_venda,
    itemData.multiplicador_unidade,
    itemData.referencia ? itemData.referencia.trim() : null,
    itemData.ativo !== undefined ? itemData.ativo : 1,
    id
  );

  if (currentStock !== targetStock) {
    const diff = targetStock - currentStock;
    insertMovimentacaoEstoqueRaw({
      item_id: id,
      tipo: 'AJUSTE',
      quantidade: diff,
      descricao: 'Ajuste via cadastro',
    });
  }

  // Delete existing barcodes
  db.prepare('DELETE FROM item_codigos_barras WHERE item_id = ?').run(id);

  // Insert new barcodes
  if (itemData.codigos_barras && itemData.codigos_barras.length > 0) {
    const barcodeStmt = db.prepare(`
      INSERT INTO item_codigos_barras (item_id, codigo_barras, principal)
      VALUES (?, ?, ?)
    `);
    for (const cb of itemData.codigos_barras) {
      barcodeStmt.run(id, cb.codigo_barras.trim(), cb.principal ? 1 : 0);
    }
  }

  db.prepare('DELETE FROM item_unidades_medida WHERE item_id = ?').run(id);
  if (itemData.unidades_medida && itemData.unidades_medida.length > 0) {
    const umStmt = db.prepare(`
      INSERT INTO item_unidades_medida (item_id, unidade_medida_id, multiplicador_unidade, principal)
      VALUES (?, ?, ?, ?)
    `);
    for (const u of itemData.unidades_medida) {
      umStmt.run(id, u.unidade_medida_id, u.multiplicador_unidade, u.principal ? 1 : 0);
    }
  } else if (itemData.tipo === 'PRODUTO') {
    db.prepare(`
      INSERT INTO item_unidades_medida (item_id, unidade_medida_id, multiplicador_unidade, principal)
      VALUES (?, ?, ?, 1)
    `).run(id, itemData.unidade_medida_id, itemData.multiplicador_unidade);
  }

  return true;
});

export const deleteItem = (id: number) => {
  const stmt = db.prepare('DELETE FROM itens WHERE id = ?');
  return stmt.run(id);
};

export const toggleItemStatus = (id: number, ativo: number) => {
  const stmt = db.prepare(`
    UPDATE itens 
    SET ativo = ?, data_atualizacao = datetime('now', 'localtime') 
    WHERE id = ?
  `);
  return stmt.run(ativo, id);
};

export default db;
