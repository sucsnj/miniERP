export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;
export type ThemeMode = 'system' | 'light' | 'dark';
export type FieldScale = 1.2 | 1.5 | 2 | 2.5;

export interface PixPreset {
  id: string;
  label: string;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
}

export interface CompanySettings {
  themeMode: ThemeMode;
  timezone: string;
  recentSalesCount: RecentSalesCount;
  autoFocusSaleInput: boolean;
  autoFocusSaleInputDelay: number;
  autoConsolidationEnabled: boolean;
  autoConsolidationDay: number;
  autoConsolidationMode: 'all-previous' | 'previous-month';
  fieldScaleDate: FieldScale;
  fieldScaleValue: FieldScale;
  fieldScaleObservations: FieldScale;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
  pixPresets: PixPreset[];
}

export type CompanySettingsPatch = Omit<Partial<CompanySettings>, 'pixPresets'>;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { credentials: 'same-origin', ...init });
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

export const fetchCompanySettings = () =>
  fetchJson<{ companySettings: CompanySettings }>('/api/settings');

export const patchCompanySettings = (patch: CompanySettingsPatch) =>
  fetchJson<{ companySettings: CompanySettings }>('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

export const clearPixData = () =>
  patchCompanySettings({ pixKey: '', pixName: '', pixBank: '', pixCity: '' });

export const upsertPixPreset = (preset: PixPreset) =>
  fetchJson<{ companySettings: CompanySettings }>('/api/settings/pix-presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset }),
  });

export const deletePixPreset = (id: string) =>
  fetchJson<{ companySettings: CompanySettings }>('/api/settings/pix-presets', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
