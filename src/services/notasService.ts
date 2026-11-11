export interface InvoiceDetails {
  id: string;
  supplierName: string;
  chave: string;
  issueDate: string;
  amount: number;
}

// Função assíncrona exportada.
export const fetchInvoicesByPeriod = async (year: number, month?: number): Promise<InvoiceDetails[]> => {
  const params = new URLSearchParams({ year: String(year) });
  if (month !== undefined) {
    params.append('month', String(month));
  }

  const response = await fetch(`/api/invoices?${params.toString()}`);
  return response.json();
};

// Função assíncrona exportada.
export const fetchInvoiceByAmount = async (amount: number): Promise<InvoiceDetails | null> => {
  const params = new URLSearchParams({ amount: String(amount) });
  const response = await fetch(`/api/invoices?${params.toString()}`);
  if (response.status === 404) {
    return null;
  }
  return response.json();
};

// Função assíncrona exportada.
export const fetchAllInvoices = async (): Promise<InvoiceDetails[]> => {
  const response = await fetch('/api/invoices');
  return response.json();
};

// Função assíncrona exportada.
export const deleteInvoice = async (id: string | number) => {
  const response = await fetch('/api/invoices', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.json();
};
