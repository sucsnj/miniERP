/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemData {
  id: string;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  descricao?: string;
  categoria_id: string;
  unidade_medida_id: string;
  marca_id: string;
  fornecedor_id: string;
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
  unidades_medida?: { unidade_medida_id: string; multiplicador_unidade: number; principal: number }[];
}

export interface ServiceData {
  id: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
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
  categoria_id: string | number;
  preco_venda: number;
  codigo_interno?: string;
  referencia?: string;
  duracao_minutos?: number;
}

export interface StockMovementData {
  id: string;
  item_id: string;
  item: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  estoque_final: number;
  descricao?: string;
  data_movimentacao: string;
}

export interface StockMovementInput {
  item_id: string | number;
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
  id: string;
  nome: string;
  descricao?: string;
}

export interface BrandData {
  id: string;
  nome: string;
}

export interface SupplierData {
  id: string;
  nome: string;
}

export interface UnitOfMeasureData {
  id: string;
  sigla: string;
  descricao?: string;
}

function mapProduct(row: any): ItemData {
  return {
    id: String(row.id),
    tipo: 'PRODUTO',
    nome: String(row.name ?? row.nome ?? ''),
    descricao: row.description ?? row.descricao ?? undefined,
    categoria_id: String(row.categoryId ?? row.category_id ?? row.categoria_id ?? ''),
    unidade_medida_id: String(row.baseUnitId ?? row.base_unit_id ?? row.unidade_medida_id ?? ''),
    marca_id: String(row.brandId ?? row.brand_id ?? row.marca_id ?? ''),
    fornecedor_id: String(row.supplierId ?? row.supplier_id ?? row.fornecedor_id ?? ''),
    preco_compra: Number(row.purchasePrice ?? row.purchase_price ?? row.preco_compra ?? 0),
    margem_lucro: Number(row.profitMargin ?? row.profit_margin ?? row.margem_lucro ?? 0),
    preco_venda: Number(row.salePrice ?? row.sale_price ?? row.preco_venda ?? 0),
    estoque: Number(row.stock ?? row.estoque ?? 0),
    multiplicador_unidade: Number(row.unitMultiplier ?? row.unit_multiplier ?? row.multiplicador_unidade ?? 1),
    estoque_total: Number(row.totalStock ?? row.total_stock ?? row.estoque_total ?? 0),
    codigo_interno: row.internalCode ?? row.internal_code ?? row.codigo_interno ?? undefined,
    referencia: String(row.reference ?? row.referencia ?? ''),
    ativo: row.active === undefined ? 1 : (row.active ? 1 : 0),
    data_criacao: row.createdAt ?? row.created_at ?? row.data_criacao,
    data_atualizacao: row.updatedAt ?? row.updated_at ?? row.data_atualizacao,
    categoria_nome: row.categoryName ?? row.category_name ?? row.categoria_nome,
    marca_nome: row.brandName ?? row.brand_name ?? row.marca_nome,
    unidade_medida_sigla: row.baseUnitAbbreviation ?? row.base_unit_abbreviation ?? row.unidade_medida_sigla,
    unidade_medida_descricao: row.baseUnitDescription ?? row.base_unit_description ?? row.unidade_medida_descricao,
    codigos_barras: Array.isArray(row.barcodes)
      ? row.barcodes.map((b: any) => ({ codigo_barras: String(b.barcode ?? b.codigo_barras ?? ''), principal: b.isPrimary ? 1 : 0 }))
      : row.codigos_barras,
    unidades_medida: Array.isArray(row.units)
      ? row.units.map((u: any) => ({ unidade_medida_id: String(u.unitId ?? u.unit_id ?? u.unidade_medida_id ?? ''), multiplicador_unidade: Number(u.unitMultiplier ?? u.unit_multiplier ?? u.multiplicador_unidade ?? 1), principal: u.isPrimary ? 1 : 0 }))
      : row.unidades_medida,
  };
}

function mapService(row: any): ServiceData {
  return {
    id: String(row.id),
    nome: String(row.name ?? row.nome ?? ''),
    descricao: row.description ?? row.descricao ?? undefined,
    categoria_id: String(row.categoryId ?? row.category_id ?? row.categoria_id ?? ''),
    preco_venda: Number(row.salePrice ?? row.sale_price ?? row.preco_venda ?? 0),
    codigo_interno: row.internalCode ?? row.internal_code ?? row.codigo_interno ?? undefined,
    referencia: row.reference ?? row.referencia ?? undefined,
    duracao_minutos: Number(row.durationMinutes ?? row.duration_minutes ?? row.duracao_minutos ?? 0),
    data_criacao: row.createdAt ?? row.created_at ?? row.data_criacao,
    data_atualizacao: row.updatedAt ?? row.updated_at ?? row.data_atualizacao,
    categoria_nome: row.categoryName ?? row.category_name ?? row.categoria_nome,
  };
}

export const fetchProducts = async (options: {
  search?: string;
  categoria_id?: number | string;
  marca_id?: number | string;
  fornecedor_id?: number | string;
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
  const data = await response.json();
  return {
    items: Array.isArray(data.items) ? data.items.map(mapProduct) : [],
    total: Number(data.total ?? 0),
    page: Number(data.page ?? 1),
    pageSize: Number(data.pageSize ?? 10),
    totalPages: Number(data.totalPages ?? 0),
  };
};

export const registerProduct = async (data: Omit<ItemData, 'id' | 'ativo'> & { ativo?: number }) => {
  const payload = {
    tipo: 'PRODUTO',
    nome: data.nome,
    descricao: data.descricao,
    categoria_id: data.categoria_id,
    unidade_medida_id: data.unidade_medida_id,
    marca_id: data.marca_id,
    fornecedor_id: data.fornecedor_id,
    preco_compra: data.preco_compra,
    margem_lucro: data.margem_lucro,
    preco_venda: data.preco_venda,
    estoque: data.estoque,
    multiplicador_unidade: data.multiplicador_unidade,
    codigo_interno: data.codigo_interno,
    referencia: data.referencia,
    ativo: data.ativo,
    codigos_barras: data.codigos_barras,
    unidades_medida: data.unidades_medida,
  };
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar produto.');
  }
  return response.json();
};

export const updateProduct = async (id: string | number, data: Omit<ItemData, 'id'>) => {
  const payload = {
    id: String(id),
    tipo: 'PRODUTO',
    nome: data.nome,
    descricao: data.descricao,
    categoria_id: data.categoria_id,
    unidade_medida_id: data.unidade_medida_id,
    marca_id: data.marca_id,
    fornecedor_id: data.fornecedor_id,
    preco_compra: data.preco_compra,
    margem_lucro: data.margem_lucro,
    preco_venda: data.preco_venda,
    estoque: data.estoque,
    multiplicador_unidade: data.multiplicador_unidade,
    codigo_interno: data.codigo_interno,
    referencia: data.referencia,
    ativo: data.ativo,
    codigos_barras: data.codigos_barras,
    unidades_medida: data.unidades_medida,
  };
  const response = await fetch('/api/produtos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar produto.');
  }
  return response.json();
};

export const deleteProduct = async (id: string | number) => {
  const response = await fetch('/api/produtos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(id) }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir produto.');
  }
  return response.json();
};

export const toggleProductStatus = async (id: string | number, active: number) => {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle-status', id: String(id), ativo: active, tipo: 'PRODUTO' }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao alterar status do produto.');
  }
  return response.json();
};

export const fetchServices = async (options: {
  search?: string;
  categoria_id?: number | string;
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
  const data = await response.json();
  return {
    items: Array.isArray(data.items) ? data.items.map(mapService) : [],
    total: Number(data.total ?? 0),
    page: Number(data.page ?? 1),
    pageSize: Number(data.pageSize ?? 10),
    totalPages: Number(data.totalPages ?? 0),
  };
};

export const fetchServiceById = async (id: string | number): Promise<ServiceData | null> => {
  const response = await fetch(`/api/produtos/servicos?id=${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar serviço.');
  }
  const data = await response.json();
  return data ? mapService(data) : null;
};

export const registerService = async (data: ServiceInput) => {
  const payload = {
    nome: data.nome,
    descricao: data.descricao,
    categoria_id: data.categoria_id,
    preco_venda: data.preco_venda,
    codigo_interno: data.codigo_interno,
    referencia: data.referencia,
    duracao_minutos: data.duracao_minutos,
  };
  const response = await fetch('/api/produtos/servicos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar serviço.');
  }
  const result = await response.json();
  return result;
};

export const updateService = async (id: string | number, data: ServiceInput) => {
  const payload = {
    nome: data.nome,
    descricao: data.descricao,
    categoria_id: data.categoria_id,
    preco_venda: data.preco_venda,
    codigo_interno: data.codigo_interno,
    referencia: data.referencia,
    duracao_minutos: data.duracao_minutos,
  };
  const response = await fetch(`/api/produtos/servicos?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar serviço.');
  }
  return response.json();
};

export const deleteService = async (id: string | number) => {
  const response = await fetch(`/api/produtos/servicos?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir serviço.');
  }
  return response.json();
};

export const fetchStockMovements = async (itemId: string | number): Promise<StockMovementData[]> => {
  const response = await fetch(`/api/produtos/movimentacoes?item_id=${itemId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar movimentações de estoque.');
  }
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((row: any) => ({
        id: String(row.id),
        item_id: String(row.productId ?? row.product_id ?? row.item_id ?? itemId),
        item: String(row.productName ?? row.product_name ?? row.item ?? ''),
        tipo: String(row.type ?? row.tipo ?? 'ADJUST').toUpperCase() === 'IN' || String(row.type ?? row.tipo ?? '').toUpperCase() === 'ENTRADA' ? 'ENTRADA' : String(row.type ?? row.tipo ?? '').toUpperCase() === 'OUT' || String(row.type ?? row.tipo ?? '').toUpperCase() === 'SAIDA' ? 'SAIDA' : 'AJUSTE',
        quantidade: Number(row.quantity ?? row.quantidade ?? 0),
        estoque_final: Number(row.finalStock ?? row.final_stock ?? row.estoque_final ?? 0),
        descricao: row.description ?? row.descricao ?? undefined,
        data_movimentacao: String(row.movedAt ?? row.moved_at ?? row.data_movimentacao ?? ''),
      }))
    : [];
};

export const registerStockMovement = async (data: StockMovementInput) => {
  const response = await fetch('/api/produtos/movimentacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: data.item_id, tipo: data.tipo, quantidade: data.quantidade, descricao: data.descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar movimentação de estoque.');
  }
  return response.json();
};

export const fetchCategories = async (): Promise<CategoryData[]> => {
  const response = await fetch('/api/produtos/categorias');
  if (!response.ok) throw new Error('Erro ao buscar categorias.');
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((row: any) => ({ id: String(row.id), nome: String(row.name ?? row.nome ?? ''), descricao: row.description ?? row.descricao ?? undefined }))
    : [];
};

export const createCategory = async (name: string, description?: string): Promise<{ id: string; message: string }> => {
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

export const deleteCategory = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/categorias?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar categoria.');
  }
  return response.json();
};

export const updateCategory = async (id: string | number, name: string, description?: string): Promise<{ message: string }> => {
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

export const fetchBrands = async (): Promise<BrandData[]> => {
  const response = await fetch('/api/produtos/marcas');
  if (!response.ok) throw new Error('Erro ao buscar marcas.');
  const data = await response.json();
  return Array.isArray(data) ? data.map((row: any) => ({ id: String(row.id), nome: String(row.name ?? row.nome ?? '') })) : [];
};

export const createBrand = async (name: string): Promise<{ id: string; message: string }> => {
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

export const deleteBrand = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/marcas?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar marca.');
  }
  return response.json();
};

export const updateBrand = async (id: string | number, name: string): Promise<{ message: string }> => {
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

export const fetchSuppliers = async (): Promise<SupplierData[]> => {
  const response = await fetch('/api/produtos/fornecedores');
  if (!response.ok) throw new Error('Erro ao buscar fornecedores.');
  const data = await response.json();
  return Array.isArray(data) ? data.map((row: any) => ({ id: String(row.id), nome: String(row.name ?? row.nome ?? '') })) : [];
};

export const createSupplier = async (name: string): Promise<{ id: string; message: string }> => {
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

export const deleteSupplier = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/fornecedores?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar fornecedor.');
  }
  return response.json();
};

export const updateSupplier = async (id: string | number, name: string): Promise<{ message: string }> => {
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

export const fetchUnitsOfMeasure = async (): Promise<UnitOfMeasureData[]> => {
  const response = await fetch('/api/produtos/unidades-medida');
  if (!response.ok) throw new Error('Erro ao buscar unidades de medida.');
  const data = await response.json();
  return Array.isArray(data) ? data.map((row: any) => ({ id: String(row.id), sigla: String(row.abbreviation ?? row.sigla ?? ''), descricao: row.description ?? row.descricao ?? undefined })) : [];
};

export const createUnitOfMeasure = async (abbreviation: string, description?: string): Promise<{ id: string; message: string }> => {
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

export const deleteUnitOfMeasure = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/produtos/unidades-medida?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar unidade de medida.');
  }
  return response.json();
};

export const updateUnitOfMeasure = async (id: string | number, abbreviation: string, description?: string): Promise<{ message: string }> => {
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
  itemIdExistente?: string | number;
}

export interface InvoiceItemsPreviewResult {
  ok: boolean;
  produtos?: ImportedProduct[];
  error?: string;
}

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
