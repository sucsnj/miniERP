export interface NotaDetalhe {
  id: number;
  distribuidora: string;
  chave: string;
  data_emissao: string;
  valor_nota: number;
}

// Função assíncrona exportada.
export const buscarNotasPorPeriodo = async (ano: number, mes?: number): Promise<NotaDetalhe[]> => {
  const params = new URLSearchParams({ ano: String(ano) });
  if (mes !== undefined) {
    params.append('mes', String(mes));
  }

  const response = await fetch(`/api/notas?${params.toString()}`);
  return response.json();
};

// Função assíncrona exportada.
export const buscarNotaPorValor = async (valor: number): Promise<NotaDetalhe | null> => {
  const params = new URLSearchParams({ valor: String(valor) });
  const response = await fetch(`/api/notas?${params.toString()}`);
  if (response.status === 404) {
    return null;
  }
  return response.json();
};

// Função assíncrona exportada.
export const buscarTodasNotas = async (): Promise<NotaDetalhe[]> => {
  const response = await fetch('/api/notas');
  return response.json();
};

// Função assíncrona exportada.
export const excluirNota = async (id: number) => {
  const response = await fetch('/api/notas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};
