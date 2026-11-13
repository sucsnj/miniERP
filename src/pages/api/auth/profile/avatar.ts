import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthContext, requireAdminApi } from '../../../../utils/serverAuth';
import { getSupabaseServerClient } from '../../../../database/supabase';

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

const removeOldAvatar = async (avatarUrl: string | null | undefined, companyId: string, userId: string): Promise<void> => {
  const marker = `/object/public/${AVATAR_BUCKET}/`;
  if (!avatarUrl) return;
  const markerIndex = avatarUrl.indexOf(marker);
  if (markerIndex < 0) return;

  const path = avatarUrl.slice(markerIndex + marker.length).split('?')[0];
  if (!path.startsWith(`${companyId}/${userId}/avatar-`)) return;

  const client = getSupabaseServerClient();
  await client.storage.from(AVATAR_BUCKET).remove([path]);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  const match = String(req.body?.dataUrl ?? '').trim().match(DATA_URL_PATTERN);
  if (!match) {
    return res.status(400).json({ error: 'Selecione uma imagem PNG, JPEG, GIF ou WebP.' });
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const file = Buffer.from(base64, 'base64');

  if (file.length === 0 || file.length > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'A foto deve ter no máximo 5 MB.' });
  }

  const client = getSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('users')
    .select('avatar_url')
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId)
    .maybeSingle();

  if (currentError) {
    return res.status(500).json({ error: 'Não foi possível carregar o perfil atual.' });
  }

  const filePath = `${ctx.companyId}/${ctx.userId}/avatar-${Date.now()}.${extensionFor(mimeType)}`;
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
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId);

  if (updateError) {
    await client.storage.from(AVATAR_BUCKET).remove([filePath]);
    return res.status(500).json({ error: 'Não foi possível atualizar a foto do perfil.' });
  }

  try {
    await removeOldAvatar(typeof current?.avatar_url === 'string' ? current.avatar_url : null, ctx.companyId, ctx.userId);
  } catch (cleanupError) {
    console.warn('Não foi possível remover o avatar anterior:', cleanupError);
  }

  const refreshed = await getAuthContext(req);
  return res.status(200).json({ user: refreshed });
}
