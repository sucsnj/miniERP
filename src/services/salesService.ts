/* eslint-disable @typescript-eslint/no-explicit-any */
// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import { readStoredString, removeStoredValue, writeStoredValue } from '../utils/storage';
import { getDateArray } from '../utils/date';
import dayjs from 'dayjs';
dayjs.locale('pt-br');

export interface DailySale {
  id: string;
  date: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface SaleItemData {
  id: string;
  venda_id: string;
  item_id?: string | null;
  kind: 'PRODUCT' | 'SERVICE';
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  internalCode?: string | null;
  reference?: string | null;
  createdAt: string;
}

export interface SaleItemInput {
  id?: string | number;
  item_id?: string | number | null;
  kind: 'PRODUCT' | 'SERVICE';
  name: string;
  quantity: number;
  unitPrice?: number;
  salePrice?: number;
  internalCode?: string | null;
  reference?: string | null;
  stock?: number;
}

export interface MonthlySale {
  id: string;
  month: number;
  year: number;
  ticketMedio: number;
  mediaClientes: number;
  mediaClientesEsp: number;
  melhorDia: string | null;
  melhorDiaValor: number;
  maiorVenda: number;
  qtdVendas: number;
  qtdVendasEsp: number;
  total: number;
  totalEsp: number;
}

function mapDailySale(row: any): DailySale {
  return {
    id: String(row.id),
    date: String(row.saleDate ?? row.sale_date ?? row.date ?? ''),
    amount: Number(row.amount ?? row.amount ?? 0),
    notes: row.notes ?? row.notes ?? undefined,
    createdAt: String(row.createdAt ?? row.created_at ?? row.createdAt ?? ''),
  };
}

function mapSaleItem(row: any): SaleItemData {
  return {
    id: String(row.id),
    venda_id: String(row.saleId ?? row.sale_id ?? row.venda_id ?? ''),
    item_id: row.productId ?? row.product_id ?? row.serviceId ?? row.service_id ?? row.item_id ?? null,
    kind: String(row.kind ?? row.kind ?? 'PRODUCT').toUpperCase() === 'SERVICE' || String(row.kind ?? row.kind ?? '').toUpperCase() === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
    name: String(row.name ?? row.name ?? ''),
    quantity: Number(row.quantity ?? row.quantity ?? 0),
    unitPrice: Number(row.unitPrice ?? row.unit_price ?? row.unitPrice ?? row.salePrice ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    internalCode: row.internalCode ?? row.internal_code ?? row.internalCode ?? null,
    reference: row.reference ?? row.reference ?? null,
    createdAt: String(row.createdAt ?? row.created_at ?? row.createdAt ?? ''),
  };
}

function mapMonthlySale(row: any): MonthlySale {
  return {
    id: String(row.id),
    month: Number(row.month ?? row.month ?? 0),
    year: Number(row.year ?? row.year ?? 0),
    ticketMedio: Number(row.averageTicket ?? row.average_ticket ?? row.ticketMedio ?? 0),
    mediaClientes: Number(row.averageCustomers ?? row.average_customers ?? row.mediaClientes ?? 0),
    mediaClientesEsp: Number(row.averageSpecialCustomers ?? row.average_special_customers ?? row.mediaClientesEsp ?? 0),
    melhorDia: row.bestDay ?? row.best_day ?? row.melhorDia ?? null,
    melhorDiaValor: Number(row.bestDayAmount ?? row.best_day_amount ?? row.melhorDiaValor ?? 0),
    maiorVenda: Number(row.largestSale ?? row.largest_sale ?? row.maiorVenda ?? 0),
    qtdVendas: Number(row.salesCount ?? row.sales_count ?? row.qtdVendas ?? 0),
    qtdVendasEsp: Number(row.specialSalesCount ?? row.special_sales_count ?? row.qtdVendasEsp ?? 0),
    total: Number(row.total ?? 0),
    totalEsp: Number(row.specialTotal ?? row.special_total ?? row.totalEsp ?? 0),
  };
}

function toSaleItemPayload(item: SaleItemInput) {
  const kind = (item.kind ?? 'PRODUCT').toString().toUpperCase() === 'SERVICE' ? 'SERVICE' : 'PRODUCT';
  const quantity = Number(item.quantity ?? (item as any).quantity ?? 0);
  const unitPrice = Number(item.unitPrice ?? item.salePrice ?? (item as any).unitPrice ?? 0);
  const id = item.item_id ?? item.id ?? null;
  return {
    kind,
    productId: kind === 'PRODUCT' && id !== null ? String(id) : null,
    serviceId: kind === 'SERVICE' && id !== null ? String(id) : null,
    name: item.name,
    quantity,
    unitPrice,
    subtotal: unitPrice * quantity,
    internalCode: item.internalCode ?? null,
    reference: item.reference ?? null,
  };
}

export const registerSale = async (
  date: string,
  amount: number,
  notes?: string,
  items?: SaleItemInput[]
) => {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      saleDate: date,
      amount,
      notes,
      items: (items ?? []).map(toSaleItemPayload),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível registrar a venda: ${response.status} ${body}`);
  }
  return response.json();
};

export const registerSaleWithCreatedAt = async (
  date: string,
  amount: number,
  notes?: string,
  createdAt?: string
) => {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saleDate: date, amount, notes, createdAt, items: [] }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível registrar a venda importada: ${response.status} ${body}`);
  }

  return response.json();
};

export const fetchDailySales = async (
  month: number,
  year: number,
  filter: 'positivas' | 'negativas' | 'todas' = 'todas'
): Promise<DailySale[]> => {
  const response = await fetch(`/api/sales?month=${month}&year=${year}&filtro=${filter}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível carregar as vendas: ${response.status} ${body}`);
  }

  const text = await response.text();
  const date = text ? JSON.parse(text) : [];
  return Array.isArray(date) ? date.map(mapDailySale) : [];
};

export const updateSale = async (id: string | number, date: string, amount: number, notes?: string, items?: SaleItemInput[]) => {
  const response = await fetch('/api/sales', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: String(id),
      saleDate: date,
      amount,
      notes,
      items: (items ?? []).map(toSaleItemPayload),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível atualizar a venda: ${response.status} ${body}`);
  }
  return response.json();
};

export const fetchSaleItems = async (saleId: string | number): Promise<SaleItemData[]> => {
  const response = await fetch(`/api/sale-items?saleId=${saleId}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível carregar os itens da venda: ${response.status} ${body}`);
  }

  const date = await response.json();
  return Array.isArray(date) ? date.map(mapSaleItem) : [];
};

export const deleteSale = async (id: string | number) => {
  const response = await fetch('/api/sales', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(id) }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível excluir a venda: ${response.status} ${body}`);
  }
  return response.json();
};

export const fetchMonthlyTotal = async (month: number, year: number): Promise<MonthlySale | null> => {
  const response = await fetch(`/api/monthly-sales?month=${month}&year=${year}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível carregar o total mensal: ${response.status} ${body}`);
  }

  const text = await response.text();
  const date = text ? JSON.parse(text) : null;
  if (!date || date.total === undefined) return null;
  return mapMonthlySale(date);
};

export const fetchAllMonthly = async (): Promise<MonthlySale[]> => {
  const response = await fetch('/api/monthly-sales');
  if (!response.ok) {
    throw new Error(`Não foi possível carregar as consolidações mensais: ${response.status}`);
  }
  const text = await response.text();
  const rows = text ? JSON.parse(text) : [];
  return Array.isArray(rows) ? rows.map(mapMonthlySale) : [];
};

const AUTO_CONSOLIDATION_TTL_MS = 60 * 60 * 1000;

const consolidationCacheKey = (storeId: string, month: number, year: number) =>
  `auto-consolidation:v1:${storeId}:${year}-${String(month).padStart(2, '0')}`;

export const isConsolidationChecked = (storeId: string, month: number, year: number): boolean => {
  const checkedAt = Number(readStoredString(consolidationCacheKey(storeId, month, year), '0'));
  return Number.isFinite(checkedAt) && checkedAt > 0 && Date.now() - checkedAt < AUTO_CONSOLIDATION_TTL_MS;
};

export const markConsolidationChecked = (storeId: string, month: number, year: number) => {
  writeStoredValue(consolidationCacheKey(storeId, month, year), Date.now());
};

export const invalidateConsolidationCache = (storeId: string, month: number, year: number) => {
  removeStoredValue(consolidationCacheKey(storeId, month, year));
};

export const invalidateAllConsolidationCache = () => {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith('auto-consolidation:v1:'))
    .forEach((key) => removeStoredValue(key));
};

export const consolidateMonthly = async (month: number, year: number, storeId?: string) => {
  const response = await fetch('/api/monthly-sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, year }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível consolidar: ${body || response.statusText}`);
  }
  if (storeId) markConsolidationChecked(storeId, month, year);
  return response.json();
};

export const isConsolidated = async (month: number, year: number): Promise<boolean> => {
  const response = await fetch(`/api/monthly-sales?month=${month}&year=${year}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível verificar o mês consolidado: ${response.status} ${body}`);
  }

  const text = await response.text();
  if (!text) return false;
  const date = JSON.parse(text);
  return !!date && date.total !== undefined;
};

export const fetchMissingMonthlyConsolidationMonths = async (): Promise<Array<{ month: number; year: number }>> => {
  const response = await fetch('/api/monthly-sales?action=missing');
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Não foi possível listar meses pendentes de consolidação: ${response.status} ${text}`);
  }

  const text = await response.text();
  const date = text ? JSON.parse(text) : [];
  if (!Array.isArray(date)) return [];

  return date
    .map((entry) => ({
      month: Number(entry.month),
      year: Number(entry.year),
    }))
    .filter((entry) => Number.isInteger(entry.month) && entry.month >= 1 && entry.month <= 12 && Number.isInteger(entry.year));
};

export const autoConsolidate = async (
  storeId?: string,
  consolidationDay = 1,
  mode: 'all-previous' | 'previous-month' = 'all-previous',
) => {
  const [day, month, initialYear] = getDateArray();
  const threshold = Math.min(28, Math.max(1, Math.floor(consolidationDay) || 1));
  if (!day || !month || !initialYear || day < threshold || !storeId) return;
  let year = initialYear;

  if (mode === 'all-previous') {
    const missingMonths = await fetchMissingMonthlyConsolidationMonths();
    for (const missing of missingMonths) {
      await consolidateMonthly(missing.month, missing.year, storeId);
    }
    return;
  }

  let previousMonth = month - 1;
  if (month === 1) {
    year = year - 1;
    previousMonth = 12;
  }

  if (isConsolidationChecked(storeId, previousMonth, year)) {
    return;
  }

  const alreadyConsolidated = await isConsolidated(previousMonth, year);
  if (alreadyConsolidated) {
    markConsolidationChecked(storeId, previousMonth, year);
    return;
  }

  await consolidateMonthly(previousMonth, year, storeId);
};

export const deleteMonthly = async (id: string | number) => {
  invalidateAllConsolidationCache();
  const response = await fetch('/api/monthly-sales', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Não foi possível excluir a consolidação: ${response.status} ${body}`);
  }
  return response.json();
};


