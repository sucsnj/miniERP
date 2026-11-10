// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import { getDateArray } from '../utils/date';
import dayjs from 'dayjs';
dayjs.locale('pt-br');

export interface DailySale {
  id: number;
  data: string;
  valor: number;
  observacoes?: string;
  criado_em: string;
}

export interface SaleItemData {
  id: number;
  venda_id: number;
  item_id?: number | null;
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
  id?: number;
  item_id?: number | null;
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
  id: number;
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

// Função assíncrona exportada.
export const registerSale = async (
  data: string,
  amount: number,
  notes?: string,
  items?: SaleItemInput[]
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor: amount, observacoes: notes, itens: items }),
  });
  return response.json();
};

// Vai ser usado exclusivamente para importar vendas de um arquivo XLSX
export const registerSaleWithCreatedAt = async (
  data: string,
  amount: number,
  notes?: string,
  createdAt?: string
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor: amount, observacoes: notes, criado_em: createdAt }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fetchDailySales = async (
  month: number,
  year: number,
  filter: 'positivas' | 'negativas' | 'todas' = 'todas'
): Promise<DailySale[]> => {
  const response = await fetch(`/api/vendas?mes=${month}&ano=${year}&filtro=${filter}`);
  return response.json();
};

// Função assíncrona exportada.
export const updateSale = async (id: number, data: string, amount: number, notes?: string, items?: SaleItemInput[]) => {
  const response = await fetch('/api/vendas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, data, valor: amount, observacoes: notes, itens: items }),
  });
  return response.json();
};

// Busca os itens associados a uma venda específica.
export const fetchSaleItems = async (saleId: number): Promise<SaleItemData[]> => {
  const response = await fetch(`/api/venda-itens?vendaId=${saleId}`);
  if (!response.ok) return [];
  return response.json();
};

// Função assíncrona exportada.
export const deleteSale = async (id: number) => {
  const response = await fetch('/api/vendas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fetchMonthlyTotal = async (month: number, year: number): Promise<MonthlySale | null> => {
  const response = await fetch(`/api/mensais?mes=${month}&ano=${year}`);
  return response.json();
};

// Função assíncrona exportada.
export const fetchAllMonthly = async (): Promise<MonthlySale[]> => {
  const response = await fetch('/api/mensais');
  return response.json();
};

// Função assíncrona exportada.
export const consolidateMonthly = async (month: number, year: number) => {
  const response = await fetch('/api/mensais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes: month, ano: year }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const isConsolidated = async (month: number, year: number): Promise<boolean> => {
  const response = await fetch(`/api/mensais?mes=${month}&ano=${year}`);

  // Se não houver corpo, retorna false
  if (!response.ok) return false;

  const text = await response.text();
  if (!text) return false;

  const data = JSON.parse(text);
  return !!data && data.total !== undefined;
};

// Função assíncrona exportada.
export const autoConsolidate = async () => {
  const [day, month, initialYear] = getDateArray();
  if (!day || !month || !initialYear) return;
  let year = initialYear;

  let previousMonth = month - 1;
  if (month === 1) {
    year = year - 1;
    previousMonth = 12;
  }

  // Todo dia 03 do mês atual faz uma consolidação
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

// Função assíncrona exportada.
export const deleteMonthly = async (id: number) => {
  const response = await fetch('/api/mensais', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const backupDatabase = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};
