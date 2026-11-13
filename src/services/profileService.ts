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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

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

export const uploadProfileAvatar = async (file: File) => {
  if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
    throw new Error('Selecione uma imagem PNG, JPEG, GIF ou WebP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('A foto deve ter no máximo 5 MB.');
  }

  const dataUrl = await readFileAsDataUrl(file);
  return fetchJson<{ user: AuthUser }>('/api/auth/profile/avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  });
};
