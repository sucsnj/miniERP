export interface CompanySummary {
  id: string;
  name: string;
}

export interface StoreAdmin {
  id: string;
  name: string;
  active: boolean;
}

export interface MerchantAdmin {
  id: string;
  name: string;
  login: string;
  email: string;
  active: boolean;
  lastStoreId: string | null;
  storeIds: string[];
  avatarUrl?: string | null;
}

export interface UpdateMerchantPatch {
  name?: string;
  login?: string;
  email?: string;
  active?: boolean;
  storeIds?: string[];
  password?: string;
  avatarUrl?: string | null;
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

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  return parseResponse<T>(response);
}

export const fetchCompany = () =>
  fetchJson<{ company: CompanySummary }>('/api/admin/company');

export const updateCompanyName = (name: string) =>
  fetchJson<{ company: CompanySummary }>('/api/admin/company', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const fetchStores = () =>
  fetchJson<{ stores: StoreAdmin[] }>('/api/admin/stores');

export const createStore = (name: string) =>
  fetchJson<{ store: StoreAdmin }>('/api/admin/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const updateStore = (input: { id: string; name?: string; active?: boolean }) =>
  fetchJson<{ ok: true }>('/api/admin/stores', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const fetchMerchants = () =>
  fetchJson<{ merchants: MerchantAdmin[] }>('/api/admin/merchants');

export const createMerchant = (input: {
  name: string;
  login: string;
  email: string;
  password: string;
  storeIds: string[];
  avatarUrl?: string | null;
}) =>
  fetchJson<{ merchant: MerchantAdmin }>('/api/admin/merchants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const updateMerchant = (input: UpdateMerchantPatch & { id: string }) =>
  fetchJson<{ ok: true }>('/api/admin/merchants', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
