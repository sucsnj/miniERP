export interface AccountDetails {
  id: number;
  distribuidora: string;
  valor: number;
  vencimento: string;
  documento: string;
  status: 'Pendente' | 'Pago';
  banco_observacoes?: string;
  criado_em?: string;
}

// Função assíncrona exportada.
export const registerAccount = async (
  supplierName: string,
  amount: number,
  dueDate: string,
  document: string,
  bankNotes?: string,
) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      distribuidora: supplierName,
      valor: amount,
      vencimento: dueDate,
      documento: document,
      bancoObservacoes: bankNotes,
    }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const importAccountsFromXml = async (xml: string) => {
  const response = await fetch('/api/contas/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xml }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fetchAccounts = async (year: number, month?: number): Promise<AccountDetails[]> => {
  const params = new URLSearchParams({ ano: String(year) });
  if (month !== undefined) {
    params.append('mes', String(month));
  }

  const response = await fetch(`/api/contas?${params.toString()}`);
  return response.json();
};

// Função assíncrona exportada.
export const payAccount = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pagar', id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const cancelAccountPayment = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancelar', id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const updateAccount = async (
  id: number,
  supplierName: string,
  amount: number,
  dueDate: string,
  document: string,
  bankNotes?: string,
) => {
  const response = await fetch('/api/contas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      distribuidora: supplierName,
      valor: amount,
      vencimento: dueDate,
      documento: document,
      bancoObservacoes: bankNotes,
    }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const deleteAccount = async (id: number) => {
  const response = await fetch('/api/contas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const backupAccounts = async () => {
  const response = await fetch('/api/contas/backup', {
    method: 'POST',
  });
  return response.json();
};
