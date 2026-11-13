export interface CompanySummary {
  id: string;
  name: string;
  phone: string;
  taxId: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

export interface StoreAdmin {
  id: string;
  name: string;
  phone: string;
  taxId: string;
  addressStreet: string;
  addressNumber: string;
  addressDistrict: string;
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
}

export type CompanyProfileInput = Omit<CompanySummary, 'id'>;
export type StoreProfileInput = Omit<StoreAdmin, 'id' | 'active'>;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error?: unknown }).error)
        : 'Não foi possível concluir a operação.';
    throw new Error(message);
  }

  return body as T;
}

export const fetchCompany = () =>
  fetchJson<{ company: CompanySummary }>('/api/admin/company');

export const updateCompanyProfile = (input: CompanyProfileInput) =>
  fetchJson<{ company: CompanySummary }>('/api/admin/company', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const fetchStores = () =>
  fetchJson<{ stores: StoreAdmin[] }>('/api/admin/stores');

export const createStore = (name: string) =>
  fetchJson<{ store: StoreAdmin }>('/api/admin/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const updateStoreProfile = (input: StoreProfileInput & { id: string }) =>
  fetchJson<{ store: StoreAdmin }>('/api/admin/stores', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const toggleStoreStatus = (input: { id: string; active: boolean }) =>
  fetchJson<{ ok: true }>('/api/admin/stores', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, statusOnly: true }),
  });

export const fetchMerchants = () =>
  fetchJson<{ merchants: MerchantAdmin[] }>('/api/admin/merchants');

export const createMerchant = (input: {
  name: string;
  login: string;
  email: string;
  password: string;
  storeIds: string[];
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
