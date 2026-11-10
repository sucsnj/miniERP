export interface TabelaRow {
  substancia: string;
  laboratorio: string;
  ean: string;
  produto: string;
  apresentacao: string;
  classeTerapeutica: string;
  pf205: string;
  pmc205: string;
}

export interface TabelaSearchHistoryItem {
  id: number;
  query: string;
  result_count: number;
  updated_at: string;
}

export interface TabelaSearchResponse {
  source: 'history' | 'table';
  results: TabelaRow[];
  query: string;
}

export interface TabelaStatusResponse {
  loaded: boolean;
  rowCount: number;
}

const handleJsonResponse = async (response: Response) => {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Erro desconhecido ao comunicar com o servidor.');
  }
  return json;
};

// Função assíncrona exportada.
export const uploadTabela = async (formData: FormData) => {
  const response = await fetch('/api/tabela', {
    method: 'POST',
    body: formData,
  });
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const searchTabela = async (query: string): Promise<TabelaSearchResponse> => {
  const response = await fetch(`/api/tabela?query=${encodeURIComponent(query.trim())}`);
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const fetchTabelaHistory = async (): Promise<TabelaSearchHistoryItem[]> => {
  const response = await fetch('/api/tabela?history=1');
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const clearTabelaHistory = async () => {
  const response = await fetch('/api/tabela', {
    method: 'DELETE',
  });
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const fetchTabelaStatus = async (): Promise<TabelaStatusResponse> => {
  const response = await fetch('/api/tabela?status=1');
  return handleJsonResponse(response);
};
