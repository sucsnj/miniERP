import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../database/supabase';
import { hashPassword, validateLogin, validatePassword } from '../../../utils/password';
import {
  createSession,
  getBootstrapUserContext,
  isValidEmail,
  isValidName,
  normalizeEmail,
  normalizeIdentifier,
  normalizeName,
  setSessionCookie,
  verifyMasterPin,
} from '../../../utils/serverAuth';

const EMAIL_MAX_LENGTH = 254;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const available = Boolean(process.env.PIN_MASTER?.trim());
    return res.status(200).json({ available });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  if (!verifyMasterPin(req.body?.pinMaster)) {
    return res.status(403).json({ error: 'PIN_MASTER inválido.' });
  }

  if (!process.env.PIN_MASTER?.trim()) {
    return res.status(500).json({ error: 'PIN_MASTER não configurado.' });
  }

  const body = req.body ?? {};
  const companyName = normalizeName(body.companyName);
  const firstStoreName = normalizeName(body.firstStoreName);
  const adminName = normalizeName(body.adminName);
  const login = normalizeIdentifier(body.login);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  if (!isValidName(companyName) || !isValidName(firstStoreName) || !isValidName(adminName)) {
    return res.status(400).json({ error: 'Empresa, loja e nome do administrador devem ter entre 2 e 120 caracteres.' });
  }
  if (!validateLogin(login)) {
    return res.status(400).json({ error: 'O login deve ter no mínimo 4 letras e apenas letras.' });
  }
  if (!isValidEmail(email) || email.length > EMAIL_MAX_LENGTH) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return res.status(400).json({ error: passwordCheck.message });
  }

  try {
    const passwordHash = await hashPassword(password);
    const client = getSupabaseServerClient();
    const { data, error } = await client.rpc('bootstrap_company_admin', {
      p_company_name: companyName,
      p_first_store_name: firstStoreName,
      p_admin_name: adminName,
      p_login: login,
      p_email: email,
      p_password_hash: passwordHash,
    });

    if (error) {
      if (String(error.message).includes('Bootstrap already completed')) {
        return res.status(403).json({ error: 'O bootstrap já foi concluído.' });
      }
      console.error('Erro no bootstrap do primeiro administrador:', error);
      return res.status(500).json({ error: 'Não foi possível criar o primeiro administrador.' });
    }

    const result = typeof data === 'string' ? JSON.parse(data) : data;
    const companyId = String(result?.companyId ?? '');
    const storeId = String(result?.storeId ?? '');
    const userId = String(result?.userId ?? '');
    if (!companyId || !storeId || !userId) {
      return res.status(500).json({ error: 'Resposta inválida do bootstrap.' });
    }

    const token = await createSession(userId, storeId);
    setSessionCookie(res, token);

    const context = await getBootstrapUserContext(companyId, storeId, userId);
    if (!context) {
      return res.status(500).json({ error: 'Não foi possível autenticar o administrador criado.' });
    }

    return res.status(201).json({ user: context });
  } catch (error) {
    console.error('Erro no bootstrap do primeiro administrador:', error);
    return res.status(500).json({ error: 'Não foi possível criar o primeiro administrador.' });
  }
}
