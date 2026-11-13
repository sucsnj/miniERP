import type { AuthUser } from '../contexts/AuthContext';

export interface ProfilePatch {
  name: string;
  login: string;
  email: string;
}

export interface PasswordPatch {
  currentPassword: string;
  newPassword: string;
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { credentials: 'same-origin', ...init });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error?: unknown }).error)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export const updateProfile = (patch: ProfilePatch) =>
  fetchJson<{ user: AuthUser }>('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

export const changeProfilePassword = (patch: PasswordPatch) =>
  fetchJson<{ user: AuthUser }>('/api/auth/profile/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
