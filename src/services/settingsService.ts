export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;
export type ThemeMode = 'system' | 'light' | 'dark';

export interface CompanySettings {
  themeMode: ThemeMode;
  timezone: string;
  recentSalesCount: RecentSalesCount;
  autoFocusSaleInput: boolean;
  autoFocusSaleInputDelay: number;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
}

export type CompanySettingsPatch = Partial<CompanySettings>;

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
