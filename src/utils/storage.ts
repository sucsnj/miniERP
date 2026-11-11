export function readStoredString(key: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function readStoredNumber(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const saved = window.localStorage.getItem(key);
  const parsed = saved ? Number(saved) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function writeStoredValue(key: string, value: string | number | boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(value));
}

export function removeStoredValue(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}
