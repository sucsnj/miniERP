import type { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, validatePassword, verifyPassword } from '../../../utils/password';
import { getSupabaseServerClient } from '../../../database/supabase';
import {
  getAuthContext,
  revokeUserSessions,
} from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const context = await getAuthContext(req);
  if (!context) return res.status(401).json({ error: 'Não autenticado.' });

  const currentPassword = String(req.body?.currentPassword ?? '');
  const newPassword = String(req.body?.newPassword ?? '');
  if (!currentPassword) return res.status(400).json({ error: 'Informe a senha atual.' });

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.ok) return res.status(400).json({ error: passwordCheck.message });

  const client = getSupabaseServerClient();
  const { data: user, error } = await client
    .from('users')
    .select('password_hash')
    .eq('id', context.userId)
    .eq('company_id', context.companyId)
    .maybeSingle();

  if (error || !user) return res.status(500).json({ error: 'Não foi possível validar a senha atual.' });

  const matches = await verifyPassword(currentPassword, String(user.password_hash));
  if (!matches) return res.status(401).json({ error: 'Senha atual inválida.' });

  const nextHash = await hashPassword(newPassword);
  const { error: updateError } = await client
    .from('users')
    .update({ password_hash: nextHash })
    .eq('id', context.userId)
    .eq('company_id', context.companyId);

  if (updateError) return res.status(500).json({ error: 'Não foi possível atualizar a senha.' });

  const revoked = await revokeUserSessions(context.userId, context.sessionId);
  if (!revoked) {
    return res.status(500).json({
      error: 'Senha alterada, mas não foi possível revogar as outras sessões.',
    });
  }

  return res.status(200).json({ ok: true });
}
