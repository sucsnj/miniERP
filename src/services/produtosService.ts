export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemData {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
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
  estoque_total?: number;
  codigo_interno?: string;
  referencia: string;
  ativo?: number;
  duracao_minutos?: number;
  data_criacao?: string;
  data_atualizacao?: string;
  categoria_nome?: string;
  marca_nome?: string;
  unidade_medida_sigla?: string;
  unidade_medida_descricao?: string;
  codigos_barras?: BarcodeData[];
  unidades_medida?: { unidade_medida_id: number; multiplicador_unidade: number; principal: number }[];
}

export interface ServiceData {
  id: number;
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos: number;
  data_criacao?: string;
  data_atualizacao?: string;
  categoria_nome?: string;
}

export interface ServiceInput {
  nome: string;
  descricao?: string;
  categoria_id: number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos?: number;
}

export interface StockMovementData {
  id: number;
  item_id: number;
  item: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  estoque_final: number;
  descricao?: string;
  data_movimentacao: string;
}

export interface StockMovementInput {
  item_id: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  descricao?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryData {
  id: number;
  nome: string;
  descricao?: string;
}

export interface BrandData {
  id: number;
  nome: string;
}

export interface SupplierData {
  id: number;
  nome: string;
}

export interface UnitOfMeasureData {
  id: number;
  sigla: string;
  descricao?: string;
}

export const fetchProducts = async (options: {
  search?: string;
  categoria_id?: number;
  marca_id?: number;
  fornecedor_id?: number;
  preco_venda?: number;
  ativo?: 'ATIVO' | 'INATIVO' | 'TODOS';
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ItemData>> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.categoria_id) params.append('categoria_id', String(options.categoria_id));
  if (options.marca_id) params.append('marca_id', String(options.marca_id));
  if (options.fornecedor_id) params.append('fornecedor_id', String(options.fornecedor_id));
  if (options.preco_venda) params.append('preco_venda', String(options.preco_venda));
  if (options.ativo) params.append('ativo', options.ativo);
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const response = await fetch(`/api/produtos?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar produtos.');
  }
  return response.json();
};

export const registerProduct = async (data: Omit<ItemData, 'id' | 'ativo'> & { ativo?: number }) => {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar produto.');
  }
  return response.json();
};

export const updateProduct = async (id: number, data: Omit<ItemData, 'id'>) => {
  const response = await fetch('/api/produtos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar produto.');
  }
  return response.json();
};

export const deleteProduct = async (id: number) => {
  const response = await fetch('/api/produtos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir produto.');
  }
  return response.json();
};

export const toggleProductStatus = async (id: number, active: number) => {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle-status', id, ativo: active, tipo: 'PRODUTO' }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao alterar status do produto.');
  }
  return response.json();
};

// Chamadas de API para Serviços
export const fetchServices = async (options: {
  search?: string;
  categoria_id?: number;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ServiceData>> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.categoria_id) params.append('categoria_id', String(options.categoria_id));
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const response = await fetch(`/api/produtos/servicos?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar serviços.');
  }
  return response.json();
};

export const fetchServiceById = async (id: number): Promise<ServiceData | null> => {
  const response = await fetch(`/api/produtos/servicos?id=${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar serviço.');
  }
  return response.json();
};

export const registerService = async (data: ServiceInput) => {
  const response = await fetch('/api/produtos/servicos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar serviço.');
  }
  return response.json();
};

export const updateService = async (id: number, data: ServiceInput) => {
  const response = await fetch(`/api/produtos/servicos?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar serviço.');
  }
  return response.json();
};

export const deleteService = async (id: number) => {
  const response = await fetch(`/api/produtos/servicos?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir serviço.');
  }
  return response.json();
};

// Chamadas de API para Movimentações de Estoque
export const fetchStockMovements = async (itemId: number): Promise<StockMovementData[]> => {
  const response = await fetch(`/api/produtos/movimentacoes?item_id=${itemId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar movimentações de estoque.');
  }
  return response.json();
};

export const registerStockMovement = async (data: StockMovementInput) => {
  const response = await fetch('/api/produtos/movimentacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar movimentação de estoque.');
  }
  return response.json();
};

// Chamadas de API para Categorias
export const fetchCategories = async (): Promise<CategoryData[]> => {
  const response = await fetch('/api/produtos/categorias');
  if (!response.ok) throw new Error('Erro ao buscar categorias.');
  return response.json();
};

export const createCategory = async (name: string, description?: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar categoria.');
  }
  return response.json();
};

export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/categorias?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar categoria.');
  }
  return response.json();
};

export const updateCategory = async (id: number, name: string, description?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/categorias?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar categoria.');
  }
  return response.json();
};

// Chamadas de API para Marcas
export const fetchBrands = async (): Promise<BrandData[]> => {
  const response = await fetch('/api/produtos/marcas');
  if (!response.ok) throw new Error('Erro ao buscar marcas.');
  return response.json();
};

export const createBrand = async (name: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/marcas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar marca.');
  }
  return response.json();
};

export const deleteBrand = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/marcas?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar marca.');
  }
  return response.json();
};

export const updateBrand = async (id: number, name: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/marcas?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar marca.');
  }
  return response.json();
};

// Chamadas de API para Fornecedores
export const fetchSuppliers = async (): Promise<SupplierData[]> => {
  const response = await fetch('/api/produtos/fornecedores');
  if (!response.ok) throw new Error('Erro ao buscar fornecedores.');
  return response.json();
};

export const createSupplier = async (name: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/fornecedores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar fornecedor.');
  }
  return response.json();
};

export const deleteSupplier = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/fornecedores?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar fornecedor.');
  }
  return response.json();
};

export const updateSupplier = async (id: number, name: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/fornecedores?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar fornecedor.');
  }
  return response.json();
};

// Chamadas de API para Unidade de Medida
export const fetchUnitsOfMeasure = async (): Promise<UnitOfMeasureData[]> => {
  const response = await fetch('/api/produtos/unidades-medida');
  if (!response.ok) throw new Error('Erro ao buscar unidades de medida.');
  return response.json();
};

export const createUnitOfMeasure = async (abbreviation: string, description?: string): Promise<{ id: number; message: string }> => {
  const response = await fetch('/api/produtos/unidades-medida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sigla: abbreviation, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar unidade de medida.');
  }
  return response.json();
};

export const deleteUnitOfMeasure = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/unidades-medida?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar unidade de medida.');
  }
  return response.json();
};

export const updateUnitOfMeasure = async (id: number, abbreviation: string, description?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/unidades-medida?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sigla: abbreviation, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar unidade de medida.');
  }
  return response.json();
};

// Importação de itens via XML de NF-e (/api/produtos/itens)
export interface ImportedProduct {
  cProd?: string;
  ean: string;
  descricao: string;
  descricaoOriginal?: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  ncm?: string;
  cfop?: string;
  existe?: boolean;
  itemIdExistente?: number;
}

export interface InvoiceItemsPreviewResult {
  ok: boolean;
  produtos?: ImportedProduct[];
  error?: string;
}

/** Pré-visualiza os itens de uma nota fiscal a partir do XML (modo preview). */
export async function previewInvoiceItems(xml: string): Promise<InvoiceItemsPreviewResult> {
  const response = await fetch('/api/produtos/itens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xml, preview: true }),
  });
  const result = await response.json();
  if (!response.ok || result.error) {
    return { ok: false, error: result.error || 'Erro ao processar o arquivo XML.' };
  }
  return { ok: true, produtos: result.produtos as ImportedProduct[] };
}

export interface InvoiceItemImportResult {
  ok: boolean;
  estoqueAtualizado?: boolean;
  duplicado?: boolean;
  error?: string;
}

/** Importa (ou apenas atualiza o estoque de) um item extraído da nota fiscal. */
export async function importInvoiceItem(product: ImportedProduct): Promise<InvoiceItemImportResult> {
  const response = await fetch('/api/produtos/itens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ importar: true, produto: product }),
  });
  const result = await response.json();
  if (!response.ok || result.error) {
    return { ok: false, duplicado: Boolean(result.duplicado), error: result.error };
  }
  return { ok: true, estoqueAtualizado: Boolean(result.estoqueAtualizado) };
}