/* eslint-disable @typescript-eslint/no-explicit-any */
// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import { getDateArray } from '../utils/date';
import dayjs from 'dayjs';
dayjs.locale('pt-br');

export interface DailySale {
  id: string;
  data: string;
  valor: number;
  observacoes?: string;
  criado_em: string;
}

export interface SaleItemData {
  id: string;
  venda_id: string;
  item_id?: string | null;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  codigo_interno?: string | null;
  referencia?: string | null;
  criado_em: string;
}

export interface SaleItemInput {
  id?: string | number;
  item_id?: string | number | null;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  quantidade: number;
  preco_unitario?: number;
  preco_venda?: number;
  codigo_interno?: string | null;
  referencia?: string | null;
  estoque?: number;
}

export interface MonthlySale {
  id: string;
  mes: number;
  ano: number;
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
    data: String(row.saleDate ?? row.sale_date ?? row.data ?? ''),
    valor: Number(row.amount ?? row.valor ?? 0),
    observacoes: row.notes ?? row.observacoes ?? undefined,
    criado_em: String(row.createdAt ?? row.created_at ?? row.criado_em ?? ''),
  };
}

function mapSaleItem(row: any): SaleItemData {
  return {
    id: String(row.id),
    venda_id: String(row.saleId ?? row.sale_id ?? row.venda_id ?? ''),
    item_id: row.productId ?? row.product_id ?? row.serviceId ?? row.service_id ?? row.item_id ?? null,
    tipo: String(row.kind ?? row.tipo ?? 'PRODUTO').toUpperCase() === 'SERVICE' || String(row.kind ?? row.tipo ?? '').toUpperCase() === 'SERVICO' ? 'SERVICO' : 'PRODUTO',
    nome: String(row.name ?? row.nome ?? ''),
    quantidade: Number(row.quantity ?? row.quantidade ?? 0),
    preco_unitario: Number(row.unitPrice ?? row.unit_price ?? row.preco_unitario ?? row.preco_venda ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    codigo_interno: row.internalCode ?? row.internal_code ?? row.codigo_interno ?? null,
    referencia: row.reference ?? row.referencia ?? null,
    criado_em: String(row.createdAt ?? row.created_at ?? row.criado_em ?? ''),
  };
}

function mapMonthlySale(row: any): MonthlySale {
  return {
    id: String(row.id),
    mes: Number(row.month ?? row.mes ?? 0),
    ano: Number(row.year ?? row.ano ?? 0),
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
  const tipo = (item.tipo ?? 'PRODUTO').toString().toUpperCase();
  const kind = tipo === 'SERVICO' || tipo === 'SERVICE' ? 'SERVICE' : 'PRODUCT';
  const quantity = Number(item.quantidade ?? (item as any).quantity ?? 0);
  const unitPrice = Number(item.preco_unitario ?? item.preco_venda ?? (item as any).unitPrice ?? 0);
  const id = item.item_id ?? item.id ?? null;
  return {
    kind,
    productId: kind === 'PRODUCT' && id !== null ? String(id) : null,
    serviceId: kind === 'SERVICE' && id !== null ? String(id) : null,
    name: item.nome,
    quantity,
    unitPrice,
    subtotal: unitPrice * quantity,
    internalCode: item.codigo_interno ?? null,
    reference: item.referencia ?? null,
  };
}

export const registerSale = async (
  data: string,
  amount: number,
  notes?: string,
  items?: SaleItemInput[]
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      saleDate: data,
      amount,
      notes,
      items: (items ?? []).map(toSaleItemPayload),
    }),
  });
  return response.json();
};

export const registerSaleWithCreatedAt = async (
  data: string,
  amount: number,
  notes?: string,
  createdAt?: string
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saleDate: data, amount, notes, createdAt, items: [] }),
  });
  return response.json();
};

export const fetchDailySales = async (
  month: number,
  year: number,
  filter: 'positivas' | 'negativas' | 'todas' = 'todas'
): Promise<DailySale[]> => {
  const response = await fetch(`/api/vendas?mes=${month}&ano=${year}&filtro=${filter}`);
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDailySale) : [];
};

export const updateSale = async (id: string | number, data: string, amount: number, notes?: string, items?: SaleItemInput[]) => {
  const response = await fetch('/api/vendas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: String(id),
      saleDate: data,
      amount,
      notes,
      items: (items ?? []).map(toSaleItemPayload),
    }),
  });
  return response.json();
};

export const fetchSaleItems = async (saleId: string | number): Promise<SaleItemData[]> => {
  const response = await fetch(`/api/venda-itens?saleId=${saleId}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapSaleItem) : [];
};

export const deleteSale = async (id: string | number) => {
  const response = await fetch('/api/vendas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(id) }),
  });
  return response.json();
};

export const fetchMonthlyTotal = async (month: number, year: number): Promise<MonthlySale | null> => {
  const response = await fetch(`/api/mensais?mes=${month}&ano=${year}`);
  const data = await response.json();
  if (!data) return null;
  return mapMonthlySale(data);
};

export const fetchAllMonthly = async (): Promise<MonthlySale[]> => {
  const response = await fetch('/api/mensais');
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapMonthlySale) : [];
};

export const consolidateMonthly = async (month: number, year: number) => {
  const response = await fetch('/api/mensais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, year }),
  });
  return response.json();
};

export const isConsolidated = async (month: number, year: number): Promise<boolean> => {
  const response = await fetch(`/api/mensais?mes=${month}&ano=${year}`);
  if (!response.ok) return false;
  const text = await response.text();
  if (!text) return false;
  const data = JSON.parse(text);
  return !!data && data.total !== undefined;
};

export const autoConsolidate = async () => {
  const [day, month, initialYear] = getDateArray();
  if (!day || !month || !initialYear) return;
  let year = initialYear;

  let previousMonth = month - 1;
  if (month === 1) {
    year = year - 1;
    previousMonth = 12;
  }

  if (day === 3) {
    await consolidateMonthly(previousMonth, year);
  }

  const jaConsolidado = await isConsolidated(previousMonth, year);
  if (jaConsolidado) {
    return;
  }

  if (day > 2) {
    await consolidateMonthly(previousMonth, year);
  }
};

export const deleteMonthly = async (id: string | number) => {
  const response = await fetch('/api/mensais', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: String(id) }),
  });
  return response.json();
};

export const backupDatabase = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};
