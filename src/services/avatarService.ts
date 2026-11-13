import type { AuthUser } from '../contexts/AuthContext';

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

export interface AvatarUploadResponse {
  avatarUrl: string;
  userId: string;
  user?: AuthUser;
}

export const validateAvatarFile = (file: File): void => {
  if (!AVATAR_MIME_TYPES.includes(file.type)) {
    throw new Error('Selecione uma imagem PNG, JPEG, GIF ou WebP.');
  }
  if (file.size > AVATAR_MAX_FILE_SIZE) {
    throw new Error('A foto deve ter no máximo 5 MB.');
  }
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

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

export const uploadAvatar = async (file: File, targetUserId?: string): Promise<AvatarUploadResponse> => {
  validateAvatarFile(file);
  const dataUrl = await readFileAsDataUrl(file);

  return fetchJson<AvatarUploadResponse>('/api/avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataUrl,
      ...(targetUserId ? { userId: targetUserId } : {}),
    }),
  });
};
