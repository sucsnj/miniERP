// Camada de serviço do cliente para comunicar a interface com as APIs internas de vendas.
import { getDateArray } from '../utils/date';
import dayjs from 'dayjs';
dayjs.locale('pt-br');

export interface VendaDiaria {
  id: number;
  data: string;
  valor: number;
  observacoes?: string;
  criado_em: string;
}

export interface VendaItemData {
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

export interface VendaItemInput {
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

export interface VendaMensal {
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
export const registrarVenda = async (
  data: string,
  valor: number,
  observacoes?: string,
  itens?: VendaItemInput[]
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor, observacoes, itens }),
  });
  return response.json();
};

// Vai ser usado exclusivamente para importar vendas de um arquivo XLSX
export const registrarVendaComCriadoEm = async (
  data: string,
  valor: number,
  observacoes?: string,
  criado_em?: string
) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, valor, observacoes, criado_em }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const buscarVendasDiarias = async (
  mes: number,
  ano: number,
  filtro: 'positivas' | 'negativas' | 'todas' = 'todas'
): Promise<VendaDiaria[]> => {
  const response = await fetch(`/api/vendas?mes=${mes}&ano=${ano}&filtro=${filtro}`);
  return response.json();
};

// Função assíncrona exportada.
export const atualizarVenda = async (id: number, data: string, valor: number, observacoes?: string, itens?: VendaItemInput[]) => {
  const response = await fetch('/api/vendas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, data, valor, observacoes, itens }),
  });
  return response.json();
};

// Busca os itens associados a uma venda específica.
export const buscarVendaItens = async (vendaId: number): Promise<VendaItemData[]> => {
  const response = await fetch(`/api/venda-itens?vendaId=${vendaId}`);
  if (!response.ok) return [];
  return response.json();
};

// Função assíncrona exportada.
export const excluirVenda = async (id: number) => {
  const response = await fetch('/api/vendas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const buscarTotalMensal = async (mes: number, ano: number): Promise<VendaMensal | null> => {
  const response = await fetch(`/api/mensais?mes=${mes}&ano=${ano}`);
  return response.json();
};

// Função assíncrona exportada.
export const buscarTodosMensais = async (): Promise<VendaMensal[]> => {
  const response = await fetch('/api/mensais');
  return response.json();
};

// Função assíncrona exportada.
export const consolidarMensal = async (mes: number, ano: number) => {
  const response = await fetch('/api/mensais', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes, ano }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const verificarConsolidado = async (mes: number, ano: number): Promise<boolean> => {
  const response = await fetch(`/api/mensais?mes=${mes}&ano=${ano}`);

  // Se não houver corpo, retorna false
  if (!response.ok) return false;

  const text = await response.text();
  if (!text) return false;

  const data = JSON.parse(text);
  return !!data && data.total !== undefined;
};

// Função assíncrona exportada.
export const autoConsolidar = async () => {
  const [day, month, initialYear] = getDateArray();
  if (!day || !month || !initialYear) return;
  let year = initialYear;

  let mesAnterior = month - 1;
  if (month === 1) {
    year = year - 1;
    mesAnterior = 12;
  }

  // Todo dia 03 do mês atual faz uma consolidação
  if (day === 3) {
    await consolidarMensal(mesAnterior, year);
  }

  const jaConsolidado = await verificarConsolidado(mesAnterior, year);
  if (jaConsolidado) {
    return;
  }

  if (day > 2) {
    await consolidarMensal(mesAnterior, year);
  }
};

// Função assíncrona exportada.
export const excluirMensal = async (id: number) => {
  const response = await fetch('/api/mensais', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fazerBackup = async () => {
  const response = await fetch('/api/backup', {
    method: 'POST',
  });
  return response.json();
};
