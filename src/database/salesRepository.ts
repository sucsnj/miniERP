
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

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text === '' ? null : text;
}

export interface DailySale {
  id: string;
  saleDate: string;
  amount: number;
  notes: string | null;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  kind: 'PRODUCT' | 'SERVICE';
  productId: string | null;
  serviceId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  internalCode: string | null;
  reference: string | null;
  createdAt: string;
}

export interface SaleItemInput {
  kind: 'PRODUCT' | 'SERVICE';
  productId?: string | null;
  serviceId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  internalCode?: string | null;
  reference?: string | null;
}

export interface MonthlySale {
  id: string;
  month: number;
  year: number;
  averageTicket: number;
  averageCustomers: number;
  averageSpecialCustomers: number;
  bestDay: string | null;
  bestDayAmount: number;
  largestSale: number;
  salesCount: number;
  specialSalesCount: number;
  total: number;
  specialTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapDailySale(row: unknown): DailySale {
  const r = asRecord(row);
  return {
    id: String(r.id),
    saleDate: String(r.sale_date ?? r.saleDate ?? ''),
    amount: toNumber(r.amount ?? r.amount),
    notes: toStringOrNull(r.notes ?? r.notes),
    createdAt: String(r.created_at ?? r.createdAt ?? ''),
  };
}

function mapSaleItem(row: unknown): SaleItem {
  const r = asRecord(row);
  return {
    id: String(r.id),
    saleId: String(r.sale_id ?? r.saleId ?? ''),
    kind: String(r.kind ?? r.tipo ?? 'PRODUCT').toUpperCase() as SaleItem['kind'],
    productId: toStringOrNull(r.product_id ?? r.productId ?? r.item_id),
    serviceId: toStringOrNull(r.service_id ?? r.serviceId),
    name: String(r.name ?? r.name ?? ''),
    quantity: toNumber(r.quantity ?? r.quantity),
    unitPrice: toNumber(r.unit_price ?? r.unitPrice ?? r.salePrice),
    subtotal: toNumber(r.subtotal),
    internalCode: toStringOrNull(r.internal_code ?? r.internalCode),
    reference: toStringOrNull(r.reference ?? r.referencia),
    createdAt: String(r.created_at ?? r.createdAt ?? ''),
  };
}

function mapMonthlySale(row: unknown): MonthlySale {
  const r = asRecord(row);
  return {
    id: String(r.id),
    month: toNumber(r.month ?? r.month),
    year: toNumber(r.year ?? r.year),
    averageTicket: toNumber(r.average_ticket ?? r.ticketMedio),
    averageCustomers: toNumber(r.average_customers ?? r.mediaClientes),
    averageSpecialCustomers: toNumber(r.average_special_customers ?? r.mediaClientesEsp),
    bestDay: toStringOrNull(r.best_day ?? r.melhorDia),
    bestDayAmount: toNumber(r.best_day_amount ?? r.melhorDiaValor),
    largestSale: toNumber(r.largest_sale ?? r.maiorVenda),
    salesCount: toNumber(r.sales_count ?? r.qtdVendas),
    specialSalesCount: toNumber(r.special_sales_count ?? r.qtdVendasEsp),
    total: toNumber(r.total),
    specialTotal: toNumber(r.special_total ?? r.totalEsp),
    createdAt: toStringOrNull(r.created_at) ?? undefined,
    updatedAt: toStringOrNull(r.updated_at) ?? undefined,
  };
}

export async function listDailySales(month: number, year: number, filter: 'positivas' | 'negativas' | 'todas' = 'todas'): Promise<DailySale[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const query = sb().from('sales').select('*').gte('sale_date', startDate).lte('sale_date', endDate).order('sale_date', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;

  let sales = asArray(data).map(mapDailySale);
  if (filter === 'positivas') sales = sales.filter((sale) => sale.amount > 0);
  if (filter === 'negativas') sales = sales.filter((sale) => sale.amount <= 0);
  return sales;
}

export async function getDailySaleById(id: string): Promise<DailySale | null> {
  const { data, error } = await sb().from('sales').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDailySale(data) : null;
}

export async function createSale(input: {
  saleDate: string;
  amount: number;
  notes?: string | null;
  createdAt?: string | null;
  items?: SaleItemInput[];
}): Promise<string> {
  const { data, error } = await sb().rpc('create_sale', {
    p_sale_date: input.saleDate,
    p_amount: input.amount,
    p_notes: input.notes ?? null,
    p_created_at: input.createdAt ?? null,
    p_items: (input.items ?? []).map((item) => ({
      kind: item.kind,
      productId: item.productId ?? null,
      serviceId: item.serviceId ?? null,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal ?? Number((item.unitPrice * item.quantity).toFixed(2)),
      internalCode: item.internalCode ?? null,
      reference: item.reference ?? null,
    })),
  });
  if (error) throw error;
  return String(data);
}

export async function updateSale(input: {
  id: string;
  saleDate: string;
  amount: number;
  notes?: string | null;
  items?: SaleItemInput[];
}): Promise<void> {
  const { error } = await sb().rpc('update_sale', {
    p_id: input.id,
    p_sale_date: input.saleDate,
    p_amount: input.amount,
    p_notes: input.notes ?? null,
    p_items: (input.items ?? []).map((item) => ({
      kind: item.kind,
      productId: item.productId ?? null,
      serviceId: item.serviceId ?? null,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal ?? Number((item.unitPrice * item.quantity).toFixed(2)),
      internalCode: item.internalCode ?? null,
      reference: item.reference ?? null,
    })),
  });
  if (error) throw error;
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await sb().rpc('delete_sale', { p_id: id });
  if (error) throw error;
}

export async function getSaleItems(saleId: string): Promise<SaleItem[]> {
  const { data, error } = await sb().from('sale_items').select('*').eq('sale_id', saleId).order('created_at', { ascending: true });
  if (error) throw error;
  return asArray(data).map(mapSaleItem);
}

export async function getMonthlyTotal(month: number, year: number): Promise<MonthlySale | null> {
  const { data, error } = await sb().from('monthly_sales').select('*').eq('month', month).eq('year', year).maybeSingle();
  if (error) throw error;
  return data ? mapMonthlySale(data) : null;
}

export async function listMonthlySales(): Promise<MonthlySale[]> {
  const { data, error } = await sb().from('monthly_sales').select('*').order('year', { ascending: false }).order('month', { ascending: false });
  if (error) throw error;
  return asArray(data).map(mapMonthlySale);
}

export async function deleteMonthlySale(id: string): Promise<void> {
  const { error } = await sb().from('monthly_sales').delete().eq('id', id);
  if (error) throw error;
}

export async function consolidateMonthly(month: number, year: number): Promise<void> {
  const sales = await listDailySales(month, year, 'todas');
  const specialSales = sales.filter((sale) => sale.amount <= 0);

  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const averageTicket = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length : 0;
  const positiveSales = sales.filter((sale) => sale.amount > 0);
  const negativeSales = specialSales;

  const positiveDays = [...new Set(positiveSales.map((sale) => sale.saleDate))];
  const negativeDays = [...new Set(negativeSales.map((sale) => sale.saleDate))];
  const averageCustomers = positiveSales.length > 0 && positiveDays.length > 0 ? positiveSales.length / positiveDays.length : 0;
  const averageSpecialCustomers = negativeSales.length > 0 && negativeDays.length > 0 ? negativeSales.length / negativeDays.length : 0;

  const grouped = sales.reduce<Record<string, number>>((acc, sale) => {
    acc[sale.saleDate] = (acc[sale.saleDate] ?? 0) + sale.amount;
    return acc;
  }, {});
  const bestEntry = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
  const bestDay = bestEntry ? bestEntry[0] : `${year}-${String(month).padStart(2, '0')}-01`;
  const bestDayAmount = bestEntry ? bestEntry[1] : 0;
  const largestSale = sales.reduce((acc, sale) => (acc > sale.amount ? acc : sale.amount), 0);
  const salesCount = positiveSales.length;
  const specialSalesCount = specialSales.length;
  const specialTotal = specialSales.reduce((sum, sale) => sum + sale.amount, 0);

  const { error } = await sb().from('monthly_sales').upsert(
    {
      month,
      year,
      average_ticket: averageTicket,
      average_customers: averageCustomers,
      average_special_customers: averageSpecialCustomers,
      best_day: bestDay,
      best_day_amount: bestDayAmount,
      largest_sale: largestSale,
      sales_count: salesCount,
      special_sales_count: specialSalesCount,
      total,
      special_total: specialTotal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'year,month' }
  );
  if (error) throw error;
}

export async function getAverageTicketForSales(sales: { amount: number }[]): Promise<number> {
  return sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length : 0;
}
