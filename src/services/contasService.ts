export interface AccountDetails {
  id: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  document: string;
  status: 'Pendente' | 'Pago';
  bankNotes?: string;
  createdAt?: string;
}

// Função assíncrona exportada.
export const registerAccount = async (
  supplierName: string,
  amount: number,
  dueDate: string,
  document: string,
  bankNotes?: string,
) => {
  const response = await fetch('/api/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplierName: supplierName,
      amount: amount,
      dueDate: dueDate,
      document: document,
      bankNotes: bankNotes,
    }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const importAccountsFromXml = async (xml: string) => {
  const response = await fetch('/api/payables/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xml }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const fetchAccounts = async (year: number, month?: number): Promise<AccountDetails[]> => {
  const params = new URLSearchParams({ year: String(year) });
  if (month !== undefined) {
    params.append('month', String(month));
  }

  const response = await fetch(`/api/payables?${params.toString()}`);
  return response.json();
};

// Função assíncrona exportada.
export const payAccount = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pagar', id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const cancelAccountPayment = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancelar', id }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const updateAccount = async (
  id: string | number,
  supplierName: string,
  amount: number,
  dueDate: string,
  document: string,
  bankNotes?: string,
) => {
  const response = await fetch('/api/payables', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      supplierName: supplierName,
      amount: amount,
      dueDate: dueDate,
      document: document,
      bankNotes: bankNotes,
    }),
  });
  return response.json();
};

// Função assíncrona exportada.
export const deleteAccount = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};

// Função assíncrona exportada.
// placeholder
