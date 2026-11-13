import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthContext, requireAdminApi } from '../../utils/serverAuth';
import { getSupabaseServerClient } from '../../database/supabase';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_BUCKET = 'avatars';
const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/=]+)$/i;

const extensionFor = (mimeType: string): string => {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/gif') return 'gif';
  return 'webp';
};

const removeOldAvatar = async (
  avatarUrl: string | null | undefined,
  companyId: string,
  userId: string
): Promise<void> => {
  const marker = `/object/public/${AVATAR_BUCKET}/`;
  if (!avatarUrl) return;
  const markerIndex = avatarUrl.indexOf(marker);
  if (markerIndex < 0) return;

  const path = avatarUrl.slice(markerIndex + marker.length).split('?')[0];
  if (!path.startsWith(`${companyId}/${userId}/avatar-`)) return;

  const client = getSupabaseServerClient();
  await client.storage.from(AVATAR_BUCKET).remove([path]);
};

const removeStaleAvatars = async (companyId: string, userId: string, keepPath: string): Promise<void> => {
  const client = getSupabaseServerClient();
  const folder = `${companyId}/${userId}`;
  const { data, error } = await client.storage.from(AVATAR_BUCKET).list(folder, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'asc' },
  });

  if (error) {
    console.warn('Não foi possível listar avatares antigos:', error);
    return;
  }

  const stalePaths = (data ?? [])
    .map((entry) => entry.name)
    .filter((name) => name.startsWith('avatar-'))
    .map((name) => `${folder}/${name}`)
    .filter((path) => path !== keepPath);

  if (stalePaths.length > 0) {
    const { error: removeError } = await client.storage.from(AVATAR_BUCKET).remove(stalePaths);
    if (removeError) console.warn('Não foi possível limpar avatares antigos:', removeError);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  const targetUserId = String(req.body?.userId ?? ctx.userId).trim();
  const match = String(req.body?.dataUrl ?? '').trim().match(DATA_URL_PATTERN);
  if (!match) {
    return res.status(400).json({ error: 'Selecione uma imagem PNG, JPEG, GIF ou WebP.' });
  }

  const mimeType = match[1].toLowerCase();
  const file = Buffer.from(match[2], 'base64');

  if (file.length === 0 || file.length > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'A foto deve ter no máximo 5 MB.' });
  }

  const client = getSupabaseServerClient();
  const { data: target, error: targetError } = await client
    .from('users')
    .select('id, avatar_url')
    .eq('id', targetUserId)
    .eq('company_id', ctx.companyId)
    .maybeSingle();

  if (targetError || !target) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const filePath = `${ctx.companyId}/${targetUserId}/avatar-${crypto.randomUUID()}.${extensionFor(mimeType)}`;
  const { error: uploadError } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      contentType: mimeType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ error: 'Não foi possível enviar a foto para o armazenamento.' });
  }

  const { data: publicUrlData } = client.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  const avatarUrl = publicUrlData.publicUrl;

  const { error: updateError } = await client
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', targetUserId)
    .eq('company_id', ctx.companyId);

  if (updateError) {
    await client.storage.from(AVATAR_BUCKET).remove([filePath]);
    return res.status(500).json({ error: 'Não foi possível atualizar a foto.' });
  }

  try {
    await removeOldAvatar(typeof target.avatar_url === 'string' ? target.avatar_url : null, ctx.companyId, targetUserId);
    await removeStaleAvatars(ctx.companyId, targetUserId, filePath);
  } catch (cleanupError) {
    console.warn('Não foi possível remover o avatar anterior:', cleanupError);
  }

  const response: Record<string, unknown> = { avatarUrl, userId: targetUserId };
  if (targetUserId === ctx.userId) {
    response.user = await getAuthContext(req);
  }

  return res.status(200).json(response);
}
