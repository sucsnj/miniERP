interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function key(ip: string, identifier: string): string {
  return `${ip}:${identifier}`;
}

export function isLoginRateLimited(ip: string, identifier: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key(ip, identifier));
  if (!entry || entry.resetAt <= now) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string, identifier: string): void {
  const now = Date.now();
  const current = attempts.get(key(ip, identifier));
  if (!current || current.resetAt <= now) {
    attempts.set(key(ip, identifier), { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  attempts.set(key(ip, identifier), { count: current.count + 1, resetAt: current.resetAt });
}

export function clearFailedLogin(ip: string, identifier: string): void {
  attempts.delete(key(ip, identifier));
}
