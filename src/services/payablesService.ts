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

interface AccountResponse {
  id?: string;
  message?: string;
  error?: string;
}

interface ImportXmlResponse {
  sucesso?: boolean;
  message?: string;
  error?: string;
  registros?: Array<{
    supplierName: string;
    amount: number;
    dueDate: string;
    document: string;
  }>;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error?: unknown }).error)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

function mapAccount(row: Partial<AccountDetails> & Record<string, unknown>): AccountDetails {
  const status = String(row.status ?? 'PENDING').toUpperCase();
  return {
    id: String(row.id ?? ''),
    supplierName: String(row.supplierName ?? row.supplier_name ?? ''),
    amount: Number(row.amount ?? 0),
    dueDate: String(row.dueDate ?? row.due_date ?? ''),
    document: String(row.document ?? ''),
    status: status === 'PAID' || status === 'PAGO' || status === 'PAGO' ? 'Pago' : 'Pendente',
    bankNotes: row.bankNotes == null ? undefined : String(row.bankNotes),
    createdAt: row.createdAt == null ? undefined : String(row.createdAt),
  };
}

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
    body: JSON.stringify({ supplierName, amount, dueDate, document, bankNotes }),
  });
  return parseResponse<AccountResponse>(response);
};

export const importAccountsFromXml = async (xml: string) => {
  const response = await fetch('/api/payables/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xml }),
  });
  return parseResponse<ImportXmlResponse>(response);
};

export const fetchAccounts = async (year: number, month?: number): Promise<AccountDetails[]> => {
  const params = new URLSearchParams({ year: String(year) });
  if (month !== undefined) {
    params.append('month', String(month));
  }

  const response = await fetch(`/api/payables?${params.toString()}`);
  const rows = await parseResponse<Array<Record<string, unknown>>>(response);
  return (Array.isArray(rows) ? rows : []).map(mapAccount);
};

export const payAccount = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pagar', id }),
  });
  return parseResponse<AccountResponse>(response);
};

export const cancelAccountPayment = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancelar', id }),
  });
  return parseResponse<AccountResponse>(response);
};

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
    body: JSON.stringify({ id, supplierName, amount, dueDate, document, bankNotes }),
  });
  return parseResponse<AccountResponse>(response);
};

export const deleteAccount = async (id: string | number) => {
  const response = await fetch('/api/payables', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return parseResponse<AccountResponse>(response);
};
