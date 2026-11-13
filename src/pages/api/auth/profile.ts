import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAuthContext,
  isValidEmail,
  isValidName,
  normalizeEmail,
  normalizeIdentifier,
  normalizeName,
  requireAdminApi,
} from '../../../utils/serverAuth';
import { validateLogin } from '../../../utils/password';
import { getSupabaseServerClient } from '../../../database/supabase';

const buildProfile = (ctx: Awaited<ReturnType<typeof getAuthContext>>) => {
  if (!ctx) return null;
  return {
    userId: ctx.userId,
    companyId: ctx.companyId,
    companyName: ctx.companyName,
    role: ctx.role,
    name: ctx.name,
    login: ctx.login,
    email: ctx.email,
    avatarUrl: ctx.avatarUrl ?? null,
    storeId: ctx.storeId,
    storeName: ctx.storeName,
    sessionId: ctx.sessionId,
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const name = normalizeName(req.body?.name);
  const login = normalizeIdentifier(req.body?.login);
  const email = normalizeEmail(req.body?.email);

  if (!isValidName(name)) {
    return res.status(400).json({ error: 'O nome deve ter entre 2 e 120 caracteres.' });
  }
  if (!validateLogin(login)) {
    return res.status(400).json({ error: 'O apelido deve ter no mínimo 4 letras e apenas letras.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  const client = getSupabaseServerClient();
  const { error } = await client
    .from('users')
    .update({ name, login, email })
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId);

  if (error) {
    const message = error.code === '23505'
      ? 'Este apelido ou e-mail já está em uso.'
      : 'Não foi possível atualizar o perfil.';
    return res.status(error.code === '23505' ? 400 : 500).json({ error: message });
  }

  const refreshed = await getAuthContext(req);
  return res.status(200).json({ user: buildProfile(refreshed) });
}
