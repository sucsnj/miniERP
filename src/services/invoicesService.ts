export interface InvoiceDetails {
  id: string;
  supplierName: string;
  chave: string;
  issueDate: string;
  amount: number;
}

function mapInvoice(row: Record<string, unknown>): InvoiceDetails {
  return {
    id: String(row.id ?? ''),
    supplierName: String(row.supplierName ?? row.supplier_name ?? ''),
    chave: String(row.chave ?? row.accessKey ?? row.access_key ?? ''),
    issueDate: String(row.issueDate ?? row.issue_date ?? ''),
    amount: Number(row.amount ?? 0),
  };
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

export const fetchInvoicesByPeriod = async (year: number, month?: number): Promise<InvoiceDetails[]> => {
  const params = new URLSearchParams({ year: String(year) });
  if (month !== undefined) {
    params.append('month', String(month));
  }

  const response = await fetch(`/api/invoices?${params.toString()}`);
  const rows = await parseResponse<Array<Record<string, unknown>>>(response);
  return (Array.isArray(rows) ? rows : []).map(mapInvoice);
};

export const fetchInvoiceByAmount = async (amount: number): Promise<InvoiceDetails | null> => {
  const params = new URLSearchParams({ amount: String(amount) });
  const response = await fetch(`/api/invoices?${params.toString()}`);

  if (response.status === 404) {
    return null;
  }

  const body = await parseResponse<Record<string, unknown>>(response);
  return mapInvoice(body);
};

export const fetchAllInvoices = async (): Promise<InvoiceDetails[]> => {
  const response = await fetch('/api/invoices');
  const rows = await parseResponse<Array<Record<string, unknown>>>(response);
  return (Array.isArray(rows) ? rows : []).map(mapInvoice);
};

export const deleteInvoice = async (id: string | number) => {
  const response = await fetch('/api/invoices', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return parseResponse<{ message?: string; changes?: number; error?: string }>(response);
};
