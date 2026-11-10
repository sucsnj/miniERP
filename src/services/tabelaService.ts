export interface TableRow {
  substancia: string;
  laboratorio: string;
  ean: string;
  produto: string;
  apresentacao: string;
  classeTerapeutica: string;
  pf205: string;
  pmc205: string;
}

export interface TableSearchHistoryItem {
  id: number;
  query: string;
  result_count: number;
  updated_at: string;
}

export interface TabelaSearchResponse {
  source: 'history' | 'table';
  results: TableRow[];
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
export const uploadTable = async (formData: FormData) => {
  const response = await fetch('/api/tabela', {
    method: 'POST',
    body: formData,
  });
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const searchTable = async (query: string): Promise<TabelaSearchResponse> => {
  const response = await fetch(`/api/tabela?query=${encodeURIComponent(query.trim())}`);
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const fetchTableHistory = async (): Promise<TableSearchHistoryItem[]> => {
  const response = await fetch('/api/tabela?history=1');
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const clearTableHistory = async () => {
  const response = await fetch('/api/tabela', {
    method: 'DELETE',
  });
  return handleJsonResponse(response);
};

// Função assíncrona exportada.
export const fetchTableStatus = async (): Promise<TabelaStatusResponse> => {
  const response = await fetch('/api/tabela?status=1');
  return handleJsonResponse(response);
};
