
import { getSupabaseServerClient } from './supabase';

type SupabaseClient = ReturnType<typeof getSupabaseServerClient>;

function sb(): SupabaseClient {
  return getSupabaseServerClient();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text === '' ? null : text;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  isDefault: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  isDefault: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitOfMeasure {
  id: string;
  abbreviation: string;
  description: string | null;
  isDefault: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductBarcode {
  barcode: string;
  isPrimary: boolean;
}

export interface ProductUnit {
  unitId: string;
  unitMultiplier: number;
  isPrimary: boolean;
  abbreviation?: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  baseUnitId: string;
  brandId: string;
  supplierId: string;
  purchasePrice: number;
  profitMargin: number;
  salePrice: number;
  stock: number;
  unitMultiplier: number;
  totalStock: number;
  internalCode: string | null;
  reference: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  categoryName?: string;
  brandName?: string;
  baseUnitAbbreviation?: string;
  baseUnitDescription?: string | null;
  barcodes: ProductBarcode[];
  units: ProductUnit[];
}

export interface ProductInput {
  name: string;
  description?: string | null;
  categoryId: string;
  baseUnitId: string;
  brandId: string;
  supplierId: string;
  purchasePrice: number;
  profitMargin: number;
  salePrice: number;
  stock: number;
  unitMultiplier: number;
  internalCode?: string | null;
  reference?: string | null;
  active?: boolean;
  barcodes?: ProductBarcode[];
  units?: Array<{ unitId: string; unitMultiplier: number; isPrimary: boolean }>;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  salePrice: number;
  internalCode: string | null;
  reference: string | null;
  durationMinutes: number;
  createdAt?: string;
  updatedAt?: string;
  categoryName?: string;
}

export interface ServiceInput {
  name: string;
  description?: string | null;
  categoryId: string;
  salePrice: number;
  internalCode?: string | null;
  reference?: string | null;
  durationMinutes?: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  finalStock: number;
  description: string | null;
  movedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function mapCategory(row: unknown): Category {
  const r = asRecord(row);
  return {
    id: String(r.id),
    name: String(r.name ?? r.name ?? ''),
    description: toStringOrNull(r.description ?? r.description),
    isDefault: toBoolean(r.is_default ?? r.isDefault),
    isSystem: toBoolean(r.is_system ?? r.isSystem),
    createdAt: toStringOrNull(r.created_at ?? r.createdAt) ?? undefined,
    updatedAt: toStringOrNull(r.updated_at ?? r.updatedAt) ?? undefined,
  };
}

function mapBrand(row: unknown): Brand {
  const r = asRecord(row);
  return {
    id: String(r.id),
    name: String(r.name ?? r.name ?? ''),
    isDefault: toBoolean(r.is_default ?? r.isDefault),
    isSystem: toBoolean(r.is_system ?? r.isSystem),
    createdAt: toStringOrNull(r.created_at ?? r.createdAt) ?? undefined,
    updatedAt: toStringOrNull(r.updated_at ?? r.updatedAt) ?? undefined,
  };
}

function mapSupplier(row: unknown): Supplier {
  const r = asRecord(row);
  return {
    id: String(r.id),
    name: String(r.name ?? r.name ?? ''),
    isDefault: toBoolean(r.is_default ?? r.isDefault),
    isSystem: toBoolean(r.is_system ?? r.isSystem),
    createdAt: toStringOrNull(r.created_at ?? r.createdAt) ?? undefined,
    updatedAt: toStringOrNull(r.updated_at ?? r.updatedAt) ?? undefined,
  };
}

function mapUnit(row: unknown): UnitOfMeasure {
  const r = asRecord(row);
  return {
    id: String(r.id),
    abbreviation: String(r.abbreviation ?? r.sigla ?? ''),
    description: toStringOrNull(r.description ?? r.description),
    isDefault: toBoolean(r.is_default ?? r.isDefault),
    isSystem: toBoolean(r.is_system ?? r.isSystem),
    createdAt: toStringOrNull(r.created_at ?? r.createdAt) ?? undefined,
    updatedAt: toStringOrNull(r.updated_at ?? r.updatedAt) ?? undefined,
  };
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await sb().from('categories').select('*').order('name', { ascending: true });
  if (error) throw error;
  return asArray(data).map(mapCategory);
}

export async function createCategory(name: string, description?: string): Promise<string> {
  const { data, error } = await sb()
    .from('categories')
    .insert({ name: name.trim(), description: description?.trim() || null })
    .select('id')
    .single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function updateCategory(id: string, name: string, description?: string): Promise<void> {
  const { error } = await sb().rpc('update_category', {
    p_id: id,
    p_name: name.trim(),
    p_description: description?.trim() || null,
  });
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_category', { p_id: id });
  if (error) throw error;
}

export async function listBrands(): Promise<Brand[]> {
  const { data, error } = await sb().from('brands').select('*').order('name', { ascending: true });
  if (error) throw error;
  return asArray(data).map(mapBrand);
}

export async function createBrand(name: string): Promise<string> {
  const { data, error } = await sb().from('brands').insert({ name: name.trim() }).select('id').single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function updateBrand(id: string, name: string): Promise<void> {
  const { error } = await sb().rpc('update_brand', { p_id: id, p_name: name.trim() });
  if (error) throw error;
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_brand', { p_id: id });
  if (error) throw error;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const { data, error } = await sb().from('suppliers').select('*').order('name', { ascending: true });
  if (error) throw error;
  return asArray(data).map(mapSupplier);
}

export async function createSupplier(name: string): Promise<string> {
  const { data, error } = await sb().from('suppliers').insert({ name: name.trim() }).select('id').single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function updateSupplier(id: string, name: string): Promise<void> {
  const { error } = await sb().rpc('update_supplier', { p_id: id, p_name: name.trim() });
  if (error) throw error;
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_supplier', { p_id: id });
  if (error) throw error;
}

export async function listUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
  const { data, error } = await sb().from('units_of_measure').select('*').order('abbreviation', { ascending: true });
  if (error) throw error;
  return asArray(data).map(mapUnit);
}

export async function createUnitOfMeasure(abbreviation: string, description?: string): Promise<string> {
  const { data, error } = await sb()
    .from('units_of_measure')
    .insert({ abbreviation: abbreviation.trim(), description: description?.trim() || null })
    .select('id')
    .single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function updateUnitOfMeasure(id: string, abbreviation: string, description?: string): Promise<void> {
  const { error } = await sb().rpc('update_unit_of_measure', {
    p_id: id,
    p_abbreviation: abbreviation.trim(),
    p_description: description?.trim() || null,
  });
  if (error) throw error;
}

export async function deleteUnitOfMeasure(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_unit_of_measure', { p_id: id });
  if (error) throw error;
}

function mapProduct(row: unknown): Product {
  const r = asRecord(row);
  const barcodes = asArray(r.barcodes).map((b) => {
    const br = asRecord(b);
    return { barcode: String(br.barcode ?? ''), isPrimary: toBoolean(br.isPrimary ?? br.is_primary) };
  });
  const units = asArray(r.units).map((u) => {
    const ur = asRecord(u);
    return {
      unitId: String(ur.unitId ?? ur.unit_id ?? ''),
      unitMultiplier: toNumber(ur.unitMultiplier ?? ur.unit_multiplier),
      isPrimary: toBoolean(ur.isPrimary ?? ur.is_primary),
      abbreviation: toStringOrNull(ur.abbreviation) ?? undefined,
      description: toStringOrNull(ur.description),
    };
  });
  return {
    id: String(r.id),
    name: String(r.name ?? r.name ?? ''),
    description: toStringOrNull(r.description ?? r.description),
    categoryId: String(r.categoryId ?? r.category_id ?? ''),
    baseUnitId: String(r.baseUnitId ?? r.base_unit_id ?? ''),
    brandId: String(r.brandId ?? r.brand_id ?? ''),
    supplierId: String(r.supplierId ?? r.supplier_id ?? ''),
    purchasePrice: toNumber(r.purchasePrice ?? r.purchase_price),
    profitMargin: toNumber(r.profitMargin ?? r.profit_margin),
    salePrice: toNumber(r.salePrice ?? r.sale_price),
    stock: toNumber(r.stock ?? r.stock),
    unitMultiplier: toNumber(r.unitMultiplier ?? r.unit_multiplier ?? r.multiplicador_unidade),
    totalStock: toNumber(r.totalStock ?? r.total_stock ?? r.totalStock),
    internalCode: toStringOrNull(r.internalCode ?? r.internal_code ?? r.internalCode),
    reference: toStringOrNull(r.reference ?? r.reference),
    active: r.active === undefined && r.active === undefined ? true : toBoolean(r.active ?? r.active ?? 1),
    createdAt: toStringOrNull(r.createdAt ?? r.created_at ?? r.createdAt) ?? undefined,
    updatedAt: toStringOrNull(r.updatedAt ?? r.updated_at ?? r.updatedAt) ?? undefined,
    categoryName: toStringOrNull(r.categoryName ?? r.category_name ?? r.categoryName) ?? undefined,
    brandName: toStringOrNull(r.brandName ?? r.brand_name ?? r.brandName) ?? undefined,
    baseUnitAbbreviation: toStringOrNull(r.baseUnitAbbreviation ?? r.base_unit_abbreviation ?? r.unitAbbreviation) ?? undefined,
    baseUnitDescription: toStringOrNull(r.baseUnitDescription ?? r.base_unit_description ?? r.unitDescription),
    barcodes,
    units,
  };
}

export async function listProducts(options: {
  search?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  active?: boolean | null;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<Product>> {
  const { data, error } = await sb().rpc('list_products', {
    p_search: options.search ?? null,
    p_category_id: options.categoryId ?? null,
    p_brand_id: options.brandId ?? null,
    p_supplier_id: options.supplierId ?? null,
    p_active: options.active ?? null,
    p_page: options.page ?? 1,
    p_page_size: options.pageSize ?? 10,
  });
  if (error) throw error;
  const result = asRecord(data);
  return {
    items: asArray(result.items).map(mapProduct),
    total: toNumber(result.total),
    page: toNumber(result.page) || 1,
    pageSize: toNumber(result.pageSize) || 10,
    totalPages: toNumber(result.totalPages),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await sb()
    .from('products')
    .select(
      '*, categories(name), brands(name), units_of_measure:base_unit_id(abbreviation, description), product_barcodes(barcode, is_primary), product_units(unit_id, unit_multiplier, is_primary, units_of_measure(abbreviation, description))'
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = asRecord(data);
  const product = mapProduct({
    ...row,
    categoryName: asRecord(row.categories).name,
    brandName: asRecord(row.brands).name,
    baseUnitAbbreviation: asRecord(row.units_of_measure).abbreviation,
    baseUnitDescription: asRecord(row.units_of_measure).description,
    barcodes: asArray(row.product_barcodes).map((b) => {
      const br = asRecord(b);
      return { barcode: br.barcode, isPrimary: br.is_primary };
    }),
    units: asArray(row.product_units).map((u) => {
      const ur = asRecord(u);
      const unit = asRecord(ur.units_of_measure);
      return {
        unitId: ur.unit_id,
        unitMultiplier: ur.unit_multiplier,
        isPrimary: ur.is_primary,
        abbreviation: unit.abbreviation,
        description: unit.description,
      };
    }),
  });
  return product;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const barcodes = (input.barcodes ?? []).map((b) => ({ barcode: b.barcode, isPrimary: b.isPrimary }));
  const units = (input.units ?? []).map((u) => ({
    unitId: u.unitId,
    unitMultiplier: u.unitMultiplier,
    isPrimary: u.isPrimary,
  }));
  const { data, error } = await sb().rpc('create_product', {
    p_name: input.name,
    p_description: input.description ?? null,
    p_category_id: input.categoryId,
    p_base_unit_id: input.baseUnitId,
    p_brand_id: input.brandId,
    p_supplier_id: input.supplierId,
    p_purchase_price: input.purchasePrice,
    p_profit_margin: input.profitMargin,
    p_sale_price: input.salePrice,
    p_stock: input.stock,
    p_unit_multiplier: input.unitMultiplier,
    p_internal_code: input.internalCode ?? null,
    p_reference: input.reference ?? null,
    p_active: input.active ?? true,
    p_barcodes: barcodes,
    p_units: units,
  });
  if (error) throw error;
  return String(data);
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const barcodes = (input.barcodes ?? []).map((b) => ({ barcode: b.barcode, isPrimary: b.isPrimary }));
  const units = (input.units ?? []).map((u) => ({
    unitId: u.unitId,
    unitMultiplier: u.unitMultiplier,
    isPrimary: u.isPrimary,
  }));
  const { error } = await sb().rpc('update_product', {
    p_id: id,
    p_name: input.name,
    p_description: input.description ?? null,
    p_category_id: input.categoryId,
    p_base_unit_id: input.baseUnitId,
    p_brand_id: input.brandId,
    p_supplier_id: input.supplierId,
    p_purchase_price: input.purchasePrice,
    p_profit_margin: input.profitMargin,
    p_sale_price: input.salePrice,
    p_stock: input.stock,
    p_unit_multiplier: input.unitMultiplier,
    p_reference: input.reference ?? null,
    p_active: input.active ?? true,
    p_barcodes: barcodes,
    p_units: units,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_product', { p_id: id });
  if (error) throw error;
}

export async function toggleProductStatus(id: string, active: boolean): Promise<void> {
  const { error } = await sb().from('products').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function checkDuplicateInternalCode(internalCode: string, excludeId?: string): Promise<boolean> {
  if (!internalCode.trim()) return false;
  let query = sb().from('products').select('id').ilike('internal_code', internalCode.trim());
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  return asArray(data).length > 0;
}

export async function checkDuplicateBarcode(barcodes: string[], excludeProductId?: string): Promise<string | null> {
  const cleaned = barcodes.map((b) => b.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;
  let query = sb().from('product_barcodes').select('barcode').in('barcode', cleaned);
  if (excludeProductId) query = query.neq('product_id', excludeProductId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  const row = asRecord(asArray(data)[0]);
  return row.barcode ? String(row.barcode) : null;
}

export async function listServices(options: { search?: string; categoryId?: string; page?: number; pageSize?: number } = {}): Promise<PagedResult<Service>> {
  const { data, error } = await sb().rpc('list_services', {
    p_search: options.search ?? null,
    p_category_id: options.categoryId ?? null,
    p_page: options.page ?? 1,
    p_page_size: options.pageSize ?? 10,
  });
  if (error) throw error;
  const result = asRecord(data);
  const items = asArray(result.items).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      name: String(r.name ?? ''),
      description: toStringOrNull(r.description),
      categoryId: String(r.categoryId ?? r.category_id ?? ''),
      salePrice: toNumber(r.salePrice ?? r.sale_price),
      internalCode: toStringOrNull(r.internalCode ?? r.internal_code),
      reference: toStringOrNull(r.reference),
      durationMinutes: toNumber(r.durationMinutes ?? r.duration_minutes),
      createdAt: toStringOrNull(r.createdAt ?? r.created_at) ?? undefined,
      updatedAt: toStringOrNull(r.updatedAt ?? r.updated_at) ?? undefined,
      categoryName: toStringOrNull(r.categoryName ?? r.category_name) ?? undefined,
    } as Service;
  });
  return {
    items,
    total: toNumber(result.total),
    page: toNumber(result.page) || 1,
    pageSize: toNumber(result.pageSize) || 10,
    totalPages: toNumber(result.totalPages),
  };
}

export async function getService(id: string): Promise<Service | null> {
  const { data, error } = await sb()
    .from('services')
    .select('*, categories(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = asRecord(data);
  const category = asRecord(row.categories);
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: toStringOrNull(row.description),
    categoryId: String(row.category_id ?? ''),
    salePrice: toNumber(row.sale_price),
    internalCode: toStringOrNull(row.internal_code),
    reference: toStringOrNull(row.reference),
    durationMinutes: toNumber(row.duration_minutes),
    createdAt: toStringOrNull(row.created_at) ?? undefined,
    updatedAt: toStringOrNull(row.updated_at) ?? undefined,
    categoryName: toStringOrNull(category.name) ?? undefined,
  };
}

export async function createService(input: ServiceInput): Promise<string> {
  const { data, error } = await sb().rpc('create_service', {
    p_name: input.name,
    p_description: input.description ?? null,
    p_category_id: input.categoryId,
    p_sale_price: input.salePrice,
    p_internal_code: input.internalCode ?? null,
    p_reference: input.reference ?? null,
    p_duration_minutes: input.durationMinutes ?? 0,
  });
  if (error) throw error;
  return String(data);
}

export async function updateService(id: string, input: ServiceInput): Promise<void> {
  const { error } = await sb().rpc('update_service', {
    p_id: id,
    p_name: input.name,
    p_description: input.description ?? null,
    p_category_id: input.categoryId,
    p_sale_price: input.salePrice,
    p_internal_code: input.internalCode ?? null,
    p_reference: input.reference ?? null,
    p_duration_minutes: input.durationMinutes ?? 0,
  });
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_service', { p_id: id });
  if (error) throw error;
}

export async function listStockMovements(productId: string): Promise<StockMovement[]> {
  const { data, error } = await sb()
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('moved_at', { ascending: false });
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      productId: String(r.product_id),
      productName: String(r.product_name ?? r.item ?? ''),
      type: String(r.type ?? 'ADJUST').toUpperCase() as StockMovement['type'],
      quantity: toNumber(r.quantity),
      finalStock: toNumber(r.final_stock ?? r.estoque_final),
      description: toStringOrNull(r.description),
      movedAt: String(r.moved_at ?? r.data_movimentacao ?? ''),
    };
  });
}

export async function applyStockMovement(
  productId: string,
  type: 'IN' | 'OUT' | 'ADJUST',
  quantity: number,
  description?: string | null
): Promise<StockMovement> {
  const { data, error } = await sb().rpc('apply_stock_movement', {
    p_product_id: productId,
    p_type: type,
    p_quantity: quantity,
    p_description: description ?? null,
  });
  if (error) throw error;
  const row = asRecord(data);
  return {
    id: String(row.id),
    productId: String(row.product_id),
    productName: String(row.product_name ?? ''),
    type: String(row.type).toUpperCase() as StockMovement['type'],
    quantity: toNumber(row.quantity),
    finalStock: toNumber(row.final_stock),
    description: toStringOrNull(row.description),
    movedAt: String(row.moved_at ?? ''),
  };
}

export async function findProductByBarcode(barcode: string): Promise<Product | null> {
  const cleaned = barcode.trim();
  if (!cleaned) return null;
  const { data: barcodeRow, error: barcodeError } = await sb()
    .from('product_barcodes')
    .select('product_id')
    .eq('barcode', cleaned)
    .maybeSingle();
  if (barcodeError) throw barcodeError;
  const productId = barcodeRow ? String(asRecord(barcodeRow).product_id) : null;
  if (!productId) return null;
  return getProduct(productId);
}

export async function findProductByInternalCode(code: string): Promise<Product | null> {
  const cleaned = code.trim();
  if (!cleaned) return null;
  const { data, error } = await sb().from('products').select('id').ilike('internal_code', cleaned).limit(1).maybeSingle();
  if (error) throw error;
  const id = data ? String(asRecord(data).id) : null;
  if (!id) return null;
  return getProduct(id);
}

export async function findProductByName(name: string): Promise<Product | null> {
  const cleaned = name.trim();
  if (!cleaned) return null;
  const { data, error } = await sb().from('products').select('id').ilike('name', cleaned).limit(1).maybeSingle();
  if (error) throw error;
  const id = data ? String(asRecord(data).id) : null;
  if (!id) return null;
  return getProduct(id);
}

export async function findServiceByInternalCode(code: string): Promise<Service | null> {
  const cleaned = code.trim();
  if (!cleaned) return null;
  const { data, error } = await sb().from('services').select('id').ilike('internal_code', cleaned).limit(1).maybeSingle();
  if (error) throw error;
  const id = data ? String(asRecord(data).id) : null;
  if (!id) return null;
  return getService(id);
}

export async function findServiceByName(name: string): Promise<Service | null> {
  const cleaned = name.trim();
  if (!cleaned) return null;
  const { data, error } = await sb().from('services').select('id').ilike('name', cleaned).limit(1).maybeSingle();
  if (error) throw error;
  const id = data ? String(asRecord(data).id) : null;
  if (!id) return null;
  return getService(id);
}
