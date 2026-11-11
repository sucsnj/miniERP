/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BarcodeData {
  codigo_barras: string;
  principal: number;
}

export interface ItemData {
  id: string;
  tipo: 'PRODUTO' | 'SERVICO';
  name: string;
  descricao?: string;
  categoryId: string;
  unidade_medida_id: string;
  brandId: string;
  supplierId: string;
  purchasePrice: number;
  profitMargin: number;
  salePrice: number;
  estoque: number;
  multiplicador_unidade: number;
  totalStock?: number;
  internalCode?: string;
  referencia: string;
  ativo?: number;
  duracao_minutos?: number;
  createdAt?: string;
  updatedAt?: string;
  categoria_nome?: string;
  marca_nome?: string;
  unidade_medida_sigla?: string;
  unidade_medida_descricao?: string;
  codigos_barras?: BarcodeData[];
  unidades_medida?: { unidade_medida_id: string; multiplicador_unidade: number; principal: number }[];
}

export interface ServiceData {
  id: string;
  name: string;
  descricao?: string;
  categoryId: string;
  salePrice: number;
  internalCode?: string;
  referencia?: string;
  duracao_minutos: number;
  createdAt?: string;
  updatedAt?: string;
  categoria_nome?: string;
}

export interface ServiceInput {
  name: string;
  descricao?: string;
  categoryId: string | number;
  salePrice: number;
  internalCode?: string;
  referencia?: string;
  duracao_minutos?: number;
}

export interface StockMovementData {
  id: string;
  item_id: string;
  item: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantity: number;
  estoque_final: number;
  descricao?: string;
  data_movimentacao: string;
}

export interface StockMovementInput {
  item_id: string | number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantity: number;
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
  name: string;
  descricao?: string;
}

export interface BrandData {
  id: string;
  name: string;
}

export interface SupplierData {
  id: string;
  name: string;
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
    name: String(row.name ?? row.name ?? ''),
    descricao: row.description ?? row.descricao ?? undefined,
    categoryId: String(row.categoryId ?? row.category_id ?? row.categoryId ?? ''),
    unidade_medida_id: String(row.baseUnitId ?? row.base_unit_id ?? row.unidade_medida_id ?? ''),
    brandId: String(row.brandId ?? row.brand_id ?? row.brandId ?? ''),
    supplierId: String(row.supplierId ?? row.supplier_id ?? row.supplierId ?? ''),
    purchasePrice: Number(row.purchasePrice ?? row.purchase_price ?? row.purchasePrice ?? 0),
    profitMargin: Number(row.profitMargin ?? row.profit_margin ?? row.profitMargin ?? 0),
    salePrice: Number(row.salePrice ?? row.sale_price ?? row.salePrice ?? 0),
    estoque: Number(row.stock ?? row.estoque ?? 0),
    multiplicador_unidade: Number(row.unitMultiplier ?? row.unit_multiplier ?? row.multiplicador_unidade ?? 1),
    totalStock: Number(row.totalStock ?? row.total_stock ?? row.totalStock ?? 0),
    internalCode: row.internalCode ?? row.internal_code ?? row.internalCode ?? undefined,
    referencia: String(row.reference ?? row.referencia ?? ''),
    ativo: row.active === undefined ? 1 : (row.active ? 1 : 0),
    createdAt: row.createdAt ?? row.created_at ?? row.createdAt,
    updatedAt: row.updatedAt ?? row.updated_at ?? row.updatedAt,
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
    name: String(row.name ?? row.name ?? ''),
    descricao: row.description ?? row.descricao ?? undefined,
    categoryId: String(row.categoryId ?? row.category_id ?? row.categoryId ?? ''),
    salePrice: Number(row.salePrice ?? row.sale_price ?? row.salePrice ?? 0),
    internalCode: row.internalCode ?? row.internal_code ?? row.internalCode ?? undefined,
    referencia: row.reference ?? row.referencia ?? undefined,
    duracao_minutos: Number(row.durationMinutes ?? row.duration_minutes ?? row.duracao_minutos ?? 0),
    createdAt: row.createdAt ?? row.created_at ?? row.createdAt,
    updatedAt: row.updatedAt ?? row.updated_at ?? row.updatedAt,
    categoria_nome: row.categoryName ?? row.category_name ?? row.categoria_nome,
  };
}

export const fetchProducts = async (options: {
  search?: string;
  categoryId?: number | string;
  brandId?: number | string;
  supplierId?: number | string;
  salePrice?: number;
  ativo?: 'ATIVO' | 'INATIVO' | 'TODOS';
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ItemData>> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.categoryId) params.append('categoria_id', String(options.categoryId));
  if (options.brandId) params.append('marca_id', String(options.brandId));
  if (options.supplierId) params.append('fornecedor_id', String(options.supplierId));
  if (options.salePrice) params.append('preco_venda', String(options.salePrice));
  if (options.ativo) params.append('ativo', options.ativo);
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar produtos.');
  }
  const date = await response.json();
  return {
    items: Array.isArray(date.items) ? date.items.map(mapProduct) : [],
    total: Number(date.total ?? 0),
    page: Number(date.page ?? 1),
    pageSize: Number(date.pageSize ?? 10),
    totalPages: Number(date.totalPages ?? 0),
  };
};

export const registerProduct = async (date: Omit<ItemData, 'id' | 'ativo'> & { ativo?: number }) => {
  const payload = {
    tipo: 'PRODUTO',
    name: date.name,
    descricao: date.descricao,
    categoryId: date.categoryId,
    unidade_medida_id: date.unidade_medida_id,
    brandId: date.brandId,
    supplierId: date.supplierId,
    purchasePrice: date.purchasePrice,
    profitMargin: date.profitMargin,
    salePrice: date.salePrice,
    estoque: date.estoque,
    multiplicador_unidade: date.multiplicador_unidade,
    internalCode: date.internalCode,
    referencia: date.referencia,
    ativo: date.ativo,
    codigos_barras: date.codigos_barras,
    unidades_medida: date.unidades_medida,
  };
  const response = await fetch('/api/products', {
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

export const updateProduct = async (id: string | number, date: Omit<ItemData, 'id'>) => {
  const payload = {
    id: String(id),
    tipo: 'PRODUTO',
    name: date.name,
    descricao: date.descricao,
    categoryId: date.categoryId,
    unidade_medida_id: date.unidade_medida_id,
    brandId: date.brandId,
    supplierId: date.supplierId,
    purchasePrice: date.purchasePrice,
    profitMargin: date.profitMargin,
    salePrice: date.salePrice,
    estoque: date.estoque,
    multiplicador_unidade: date.multiplicador_unidade,
    internalCode: date.internalCode,
    referencia: date.referencia,
    ativo: date.ativo,
    codigos_barras: date.codigos_barras,
    unidades_medida: date.unidades_medida,
  };
  const response = await fetch('/api/products', {
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
  const response = await fetch('/api/products', {
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
  const response = await fetch('/api/products', {
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
  categoryId?: number | string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ServiceData>> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.categoryId) params.append('categoria_id', String(options.categoryId));
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));

  const response = await fetch(`/api/products/servicos?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar serviços.');
  }
  const date = await response.json();
  return {
    items: Array.isArray(date.items) ? date.items.map(mapService) : [],
    total: Number(date.total ?? 0),
    page: Number(date.page ?? 1),
    pageSize: Number(date.pageSize ?? 10),
    totalPages: Number(date.totalPages ?? 0),
  };
};

export const fetchServiceById = async (id: string | number): Promise<ServiceData | null> => {
  const response = await fetch(`/api/products/servicos?id=${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar serviço.');
  }
  const date = await response.json();
  return date ? mapService(date) : null;
};

export const registerService = async (date: ServiceInput) => {
  const payload = {
    name: date.name,
    descricao: date.descricao,
    categoryId: date.categoryId,
    salePrice: date.salePrice,
    internalCode: date.internalCode,
    referencia: date.referencia,
    duracao_minutos: date.duracao_minutos,
  };
  const response = await fetch('/api/products/servicos', {
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

export const updateService = async (id: string | number, date: ServiceInput) => {
  const payload = {
    name: date.name,
    descricao: date.descricao,
    categoryId: date.categoryId,
    salePrice: date.salePrice,
    internalCode: date.internalCode,
    referencia: date.referencia,
    duracao_minutos: date.duracao_minutos,
  };
  const response = await fetch(`/api/products/servicos?id=${id}`, {
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
  const response = await fetch(`/api/products/servicos?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao excluir serviço.');
  }
  return response.json();
};

export const fetchStockMovements = async (itemId: string | number): Promise<StockMovementData[]> => {
  const response = await fetch(`/api/products/movimentacoes?item_id=${itemId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao buscar movimentações de estoque.');
  }
  const date = await response.json();
  return Array.isArray(date)
    ? date.map((row: any) => ({
        id: String(row.id),
        item_id: String(row.productId ?? row.product_id ?? row.item_id ?? itemId),
        item: String(row.productName ?? row.product_name ?? row.item ?? ''),
        tipo: String(row.type ?? row.tipo ?? 'ADJUST').toUpperCase() === 'IN' || String(row.type ?? row.tipo ?? '').toUpperCase() === 'ENTRADA' ? 'ENTRADA' : String(row.type ?? row.tipo ?? '').toUpperCase() === 'OUT' || String(row.type ?? row.tipo ?? '').toUpperCase() === 'SAIDA' ? 'SAIDA' : 'AJUSTE',
        quantity: Number(row.quantity ?? row.quantity ?? 0),
        estoque_final: Number(row.finalStock ?? row.final_stock ?? row.estoque_final ?? 0),
        descricao: row.description ?? row.descricao ?? undefined,
        data_movimentacao: String(row.movedAt ?? row.moved_at ?? row.data_movimentacao ?? ''),
      }))
    : [];
};

export const registerStockMovement = async (date: StockMovementInput) => {
  const response = await fetch('/api/products/movimentacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: date.item_id, tipo: date.tipo, quantity: date.quantity, descricao: date.descricao }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao registrar movimentação de estoque.');
  }
  return response.json();
};

export const fetchCategories = async (): Promise<CategoryData[]> => {
  const response = await fetch('/api/products/categorias');
  if (!response.ok) throw new Error('Erro ao buscar categorias.');
  const date = await response.json();
  return Array.isArray(date)
    ? date.map((row: any) => ({ id: String(row.id), name: String(row.name ?? row.name ?? ''), descricao: row.description ?? row.descricao ?? undefined }))
    : [];
};

export const createCategory = async (name: string, description?: string): Promise<{ id: string; message: string }> => {
  const response = await fetch('/api/products/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar categoria.');
  }
  return response.json();
};

export const deleteCategory = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/categorias?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar categoria.');
  }
  return response.json();
};

export const updateCategory = async (id: string | number, name: string, description?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/categorias?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, descricao: description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar categoria.');
  }
  return response.json();
};

export const fetchBrands = async (): Promise<BrandData[]> => {
  const response = await fetch('/api/products/marcas');
  if (!response.ok) throw new Error('Erro ao buscar marcas.');
  const date = await response.json();
  return Array.isArray(date) ? date.map((row: any) => ({ id: String(row.id), name: String(row.name ?? row.name ?? '') })) : [];
};

export const createBrand = async (name: string): Promise<{ id: string; message: string }> => {
  const response = await fetch('/api/products/marcas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar marca.');
  }
  return response.json();
};

export const deleteBrand = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/marcas?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar marca.');
  }
  return response.json();
};

export const updateBrand = async (id: string | number, name: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/marcas?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar marca.');
  }
  return response.json();
};

export const fetchSuppliers = async (): Promise<SupplierData[]> => {
  const response = await fetch('/api/products/fornecedores');
  if (!response.ok) throw new Error('Erro ao buscar fornecedores.');
  const date = await response.json();
  return Array.isArray(date) ? date.map((row: any) => ({ id: String(row.id), name: String(row.name ?? row.name ?? '') })) : [];
};

export const createSupplier = async (name: string): Promise<{ id: string; message: string }> => {
  const response = await fetch('/api/products/fornecedores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar fornecedor.');
  }
  return response.json();
};

export const deleteSupplier = async (id: string | number): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/fornecedores?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar fornecedor.');
  }
  return response.json();
};

export const updateSupplier = async (id: string | number, name: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/fornecedores?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar fornecedor.');
  }
  return response.json();
};

export const fetchUnitsOfMeasure = async (): Promise<UnitOfMeasureData[]> => {
  const response = await fetch('/api/products/unidades-medida');
  if (!response.ok) throw new Error('Erro ao buscar unidades de medida.');
  const date = await response.json();
  return Array.isArray(date) ? date.map((row: any) => ({ id: String(row.id), sigla: String(row.abbreviation ?? row.sigla ?? ''), descricao: row.description ?? row.descricao ?? undefined })) : [];
};

export const createUnitOfMeasure = async (abbreviation: string, description?: string): Promise<{ id: string; message: string }> => {
  const response = await fetch('/api/products/unidades-medida', {
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
  const response = await fetch(`/api/products/unidades-medida?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar unidade de medida.');
  }
  return response.json();
};

export const updateUnitOfMeasure = async (id: string | number, abbreviation: string, description?: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/unidades-medida?id=${id}`, {
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
  quantity: number;
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
  const response = await fetch('/api/products/itens', {
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
  const response = await fetch('/api/products/itens', {
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
