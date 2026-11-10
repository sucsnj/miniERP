import { getSupabaseServerClient } from './supabase';

type SupabaseClient = ReturnType<typeof getSupabaseServerClient>;

function sb(): SupabaseClient {
  return getSupabaseServerClient();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text === '' ? null : text;
}

export interface Payable {
  id: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  document: string;
  status: 'PENDING' | 'PAID';
  bankNotes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  accessKey: string;
  issueDate: string;
  amount: number;
  createdAt: string;
}

export interface MedicineSearchHistory {
  id: string;
  query: string;
  normalizedQuery: string;
  results: unknown[];
  resultCount: number;
  updatedAt: string;
}

// Payables
export async function listPayablesByPeriod(year: number, month?: number): Promise<Payable[]> {
  const startDate = `${year}-${String(month ?? 1).padStart(2, '0')}-01`;
  const endDate = month
    ? new Date(year, month, 0).toISOString().slice(0, 10)
    : `${year}-12-31`;

  const { data, error } = await sb()
    .from('payables')
    .select('*')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      supplierName: String(r.supplier_name ?? ''),
      amount: toNumber(r.amount),
      dueDate: String(r.due_date ?? ''),
      document: String(r.document ?? ''),
      status: String(r.status ?? 'PENDING').toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
      bankNotes: toStringOrNull(r.bank_notes),
      paidAt: toStringOrNull(r.paid_at),
      createdAt: String(r.created_at ?? ''),
      updatedAt: toStringOrNull(r.updated_at) ?? undefined,
    };
  });
}

export async function listAllPayables(): Promise<Payable[]> {
  const { data, error } = await sb().from('payables').select('*').order('due_date', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      supplierName: String(r.supplier_name ?? ''),
      amount: toNumber(r.amount),
      dueDate: String(r.due_date ?? ''),
      document: String(r.document ?? ''),
      status: String(r.status ?? 'PENDING').toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
      bankNotes: toStringOrNull(r.bank_notes),
      paidAt: toStringOrNull(r.paid_at),
      createdAt: String(r.created_at ?? ''),
      updatedAt: toStringOrNull(r.updated_at) ?? undefined,
    };
  });
}

export async function getPayableById(id: string): Promise<Payable | null> {
  const { data, error } = await sb().from('payables').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = asRecord(data);
  return {
    id: String(r.id),
    supplierName: String(r.supplier_name ?? ''),
    amount: toNumber(r.amount),
    dueDate: String(r.due_date ?? ''),
    document: String(r.document ?? ''),
    status: String(r.status ?? 'PENDING').toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
    bankNotes: toStringOrNull(r.bank_notes),
    paidAt: toStringOrNull(r.paid_at),
    createdAt: String(r.created_at ?? ''),
    updatedAt: toStringOrNull(r.updated_at) ?? undefined,
  };
}

export async function createPayable(input: {
  supplierName: string;
  amount: number;
  dueDate: string;
  document: string;
  bankNotes?: string | null;
}): Promise<string> {
  const { data, error } = await sb()
    .from('payables')
    .insert({
      supplier_name: input.supplierName,
      amount: input.amount,
      due_date: input.dueDate,
      document: input.document,
      bank_notes: input.bankNotes ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function updatePayable(input: {
  id: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  document: string;
  bankNotes?: string | null;
}): Promise<void> {
  const { error } = await sb()
    .from('payables')
    .update({
      supplier_name: input.supplierName,
      amount: input.amount,
      due_date: input.dueDate,
      document: input.document,
      bank_notes: input.bankNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function deletePayable(id: string): Promise<void> {
  const { error } = await sb().from('payables').delete().eq('id', id);
  if (error) throw error;
}

export async function payPayable(id: string): Promise<void> {
  const { error } = await sb().from('payables').update({ status: 'PAID', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function cancelPayablePayment(id: string): Promise<void> {
  const { error } = await sb().from('payables').update({ status: 'PENDING', paid_at: null, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// Invoices
export async function listInvoicesByPeriod(year: number, month?: number): Promise<Invoice[]> {
  const startDate = `${year}-${String(month ?? 1).padStart(2, '0')}-01`;
  const endDate = month
    ? new Date(year, month, 0).toISOString().slice(0, 10)
    : `${year}-12-31`;

  const { data, error } = await sb()
    .from('invoices')
    .select('*')
    .gte('issue_date', startDate)
    .lte('issue_date', endDate)
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      supplierName: String(r.supplier_name ?? ''),
      accessKey: String(r.access_key ?? ''),
      issueDate: String(r.issue_date ?? ''),
      amount: toNumber(r.amount),
      createdAt: String(r.created_at ?? ''),
    };
  });
}

export async function listAllInvoices(): Promise<Invoice[]> {
  const { data, error } = await sb().from('invoices').select('*').order('issue_date', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      supplierName: String(r.supplier_name ?? ''),
      accessKey: String(r.access_key ?? ''),
      issueDate: String(r.issue_date ?? ''),
      amount: toNumber(r.amount),
      createdAt: String(r.created_at ?? ''),
    };
  });
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await sb().from('invoices').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = asRecord(data);
  return {
    id: String(r.id),
    supplierName: String(r.supplier_name ?? ''),
    accessKey: String(r.access_key ?? ''),
    issueDate: String(r.issue_date ?? ''),
    amount: toNumber(r.amount),
    createdAt: String(r.created_at ?? ''),
  };
}

export async function getInvoiceByAmount(amount: number): Promise<Invoice | null> {
  const { data, error } = await sb().from('invoices').select('*').eq('amount', amount).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = asRecord(data);
  return {
    id: String(r.id),
    supplierName: String(r.supplier_name ?? ''),
    accessKey: String(r.access_key ?? ''),
    issueDate: String(r.issue_date ?? ''),
    amount: toNumber(r.amount),
    createdAt: String(r.created_at ?? ''),
  };
}

export async function createInvoice(input: { supplierName: string; accessKey: string; issueDate: string; amount: number }): Promise<string> {
  const { data, error } = await sb()
    .from('invoices')
    .insert({
      supplier_name: input.supplierName,
      access_key: input.accessKey,
      issue_date: input.issueDate,
      amount: input.amount,
    })
    .select('id')
    .single();
  if (error) throw error;
  return String(asRecord(data).id);
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await sb().from('invoices').delete().eq('id', id);
  if (error) throw error;
}

export async function getInvoiceSumByYear(year: number): Promise<number> {
  const { data, error } = await sb().from('invoices').select('amount').gte('issue_date', `${year}-01-01`).lte('issue_date', `${year}-12-31`);
  if (error) throw error;
  return asArray(data).reduce((sum: number, row) => sum + toNumber(asRecord(row).amount), 0);
}

// Medicine search history
export async function findMedicineSearchHistory(normalizedQuery: string): Promise<MedicineSearchHistory | null> {
  const { data, error } = await sb().from('medicine_search_history').select('*').eq('normalized_query', normalizedQuery).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = asRecord(data);
  return {
    id: String(r.id),
    query: String(r.query ?? ''),
    normalizedQuery: String(r.normalized_query ?? ''),
    results: asArray(r.results),
    resultCount: toNumber(r.result_count),
    updatedAt: String(r.updated_at ?? ''),
  };
}

export async function saveMedicineSearchHistory(query: string, normalizedQuery: string, results: unknown[]): Promise<void> {
  const { error } = await sb().from('medicine_search_history').upsert({
    query,
    normalized_query: normalizedQuery,
    results,
    result_count: results.length,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'normalized_query' });
  if (error) throw error;

  // prune to 25
  const { data } = await sb().from('medicine_search_history').select('id').order('updated_at', { ascending: false });
  const ids = asArray(data).map((row) => String(asRecord(row).id));
  const toDelete = ids.slice(25);
  if (toDelete.length > 0) {
    await sb().from('medicine_search_history').delete().in('id', toDelete);
  }
}

export async function listMedicineSearchHistory(): Promise<Array<{ id: string; query: string; result_count: number; updated_at: string }>> {
  const { data, error } = await sb().from('medicine_search_history').select('id, query, result_count, updated_at').order('updated_at', { ascending: false }).limit(25);
  if (error) throw error;
  return asArray(data).map((row) => {
    const r = asRecord(row);
    return {
      id: String(r.id),
      query: String(r.query ?? ''),
      result_count: toNumber(r.result_count),
      updated_at: String(r.updated_at ?? ''),
    };
  });
}

export async function clearMedicineSearchHistory(): Promise<void> {
  const { error } = await sb().from('medicine_search_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
