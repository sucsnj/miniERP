import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword } from '../../../utils/password';
import { clearFailedLogin, isLoginRateLimited, recordFailedLogin } from '../../../utils/loginRateLimit';
import { getSupabaseServerClient } from '../../../database/supabase';
import {
  createSession,
  findUserByIdentifier,
  getAuthContext,
  isValidIdentifier,
  normalizeIdentifier,
  setSessionCookie,
} from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const identifier = normalizeIdentifier(req.body?.identifier ?? req.body?.login ?? req.body?.email);
  const password = String(req.body?.password ?? '');
  if (!isValidIdentifier(identifier) || !password) {
    return res.status(400).json({ error: 'Informe login ou e-mail e senha.' });
  }

  const ip = req.socket.remoteAddress ?? 'unknown';
  if (isLoginRateLimited(ip, identifier)) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
  }

  const user = await findUserByIdentifier(identifier);
  if (!user || !user.active) {
    recordFailedLogin(ip, identifier);
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    recordFailedLogin(ip, identifier);
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const client = getSupabaseServerClient();
  const { data: stores, error: storesError } = await client
    .from('stores')
    .select('id, name')
    .eq('company_id', user.company_id)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (storesError || !stores || stores.length === 0) {
    recordFailedLogin(ip, identifier);
    return res.status(403).json({ error: 'Nenhuma loja ativa disponível para esta empresa.' });
  }

  let authorizedStores = stores;
  if (user.role === 'merchant') {
    const { data: assignments, error: assignmentsError } = await client
      .from('user_stores')
      .select('store_id')
      .eq('user_id', user.id);

    if (assignmentsError || !assignments || assignments.length === 0) {
      recordFailedLogin(ip, identifier);
      return res.status(403).json({ error: 'Nenhuma loja autorizada para este vendedor.' });
    }

    const allowedIds = new Set(assignments.map((assignment) => String(assignment.store_id)));
    authorizedStores = stores.filter((store) => allowedIds.has(String(store.id)));
  }

  if (authorizedStores.length === 0) {
    recordFailedLogin(ip, identifier);
    return res.status(403).json({ error: 'Nenhuma loja autorizada para este vendedor.' });
  }

  const preferred = authorizedStores.find((store) => store.id === user.last_store_id) ?? authorizedStores[0];
  const token = await createSession(user.id, String(preferred.id));

  if (user.last_store_id !== preferred.id) {
    await client.from('users').update({ last_store_id: String(preferred.id) }).eq('id', user.id);
  }

  clearFailedLogin(ip, identifier);
  setSessionCookie(res, token);

  req.cookies = { ...req.cookies, minierp_session: token };
  const context = await getAuthContext(req);
  if (!context) {
    return res.status(500).json({ error: 'Não foi possível carregar a sessão.' });
  }

  return res.status(200).json({ user: context });
}
