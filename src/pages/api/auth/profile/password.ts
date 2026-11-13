import type { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, validatePassword, verifyPassword } from '../../../../utils/password';
import { getSupabaseServerClient } from '../../../../database/supabase';
import {
  getAuthContext,
  requireAdminApi,
  revokeUserSessions,
} from '../../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  const currentPassword = String(req.body?.currentPassword ?? '');
  const newPassword = String(req.body?.newPassword ?? '');

  if (!currentPassword) return res.status(400).json({ error: 'Informe a senha atual.' });

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.ok) return res.status(400).json({ error: passwordCheck.message });

  const client = getSupabaseServerClient();
  const { data: user, error } = await client
    .from('users')
    .select('password_hash')
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId)
    .maybeSingle();

  if (error || !user) return res.status(500).json({ error: 'Não foi possível validar a senha atual.' });

  const matches = await verifyPassword(currentPassword, String(user.password_hash));
  if (!matches) return res.status(401).json({ error: 'Senha atual inválida.' });

  const passwordHash = await hashPassword(newPassword);
  const { error: updateError } = await client
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId);

  if (updateError) return res.status(500).json({ error: 'Não foi possível atualizar a senha.' });

  const revoked = await revokeUserSessions(ctx.userId, ctx.sessionId);
  if (!revoked) {
    return res.status(500).json({
      error: 'Senha alterada, mas não foi possível revogar as outras sessões.',
    });
  }

  const refreshed = await getAuthContext(req);
  if (!refreshed) {
    return res.status(500).json({
      error: 'Senha alterada, mas não foi possível renovar a sessão atual.',
    });
  }

  return res.status(200).json({ user: refreshed });
}
