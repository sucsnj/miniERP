const COMPANY_NAME_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function readCompanyNameCache(companyId: string): string | null {
  const entry = cache.get(companyId);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(companyId);
    return null;
  }
  return entry.value;
}

export function writeCompanyNameCache(companyId: string, value: string): void {
  cache.set(companyId, { value, expiresAt: Date.now() + COMPANY_NAME_TTL_MS });
}

export function invalidateCompanyNameCache(companyId: string): void {
  cache.delete(companyId);
}
