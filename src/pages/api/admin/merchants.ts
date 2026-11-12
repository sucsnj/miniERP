import type { NextApiRequest, NextApiResponse } from 'next';
import {
  isValidEmail,
  isValidName,
  normalizeEmail,
  normalizeIdentifier,
  normalizeName,
  requireAdminApi,
} from '../../../utils/serverAuth';
import { validateLogin, validatePassword } from '../../../utils/password';
import { createMerchant, listMerchants, updateMerchant } from '../../../database/adminRepository';

function normalizeStoreIds(value: unknown): string[] {
  return Array.isArray(value) ? value.map((id) => String(id)).filter(Boolean) : [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    try {
      const merchants = await listMerchants(ctx);
      return res.status(200).json({ merchants });
    } catch (error) {
      console.error('Erro ao listar vendedores:', error);
      return res.status(500).json({ error: 'Não foi possível listar os vendedores.' });
    }
  }

  if (req.method === 'POST') {
    const name = normalizeName(req.body?.name);
    const login = normalizeIdentifier(req.body?.login);
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? '');
    const storeIds = normalizeStoreIds(req.body?.storeIds);

    if (!isValidName(name)) {
      return res.status(400).json({ error: 'O nome deve ter entre 2 e 120 caracteres.' });
    }
    if (!validateLogin(login)) {
      return res.status(400).json({ error: 'O login deve ter no mínimo 4 letras e apenas letras.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      return res.status(400).json({ error: passwordCheck.message });
    }
    if (storeIds.length === 0) {
      return res.status(400).json({ error: 'Selecione ao menos uma loja para o vendedor.' });
    }

    try {
      const merchant = await createMerchant({ name, login, email, password, storeIds }, ctx);
      return res.status(201).json({ merchant });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar o vendedor.';
      return res.status(400).json({ error: message });
    }
  }

  if (req.method === 'PATCH') {
    const merchantId = String(req.body?.id ?? '');
    if (!merchantId) return res.status(400).json({ error: 'Informe o vendedor.' });

    const input: {
      name?: string;
      login?: string;
      email?: string;
      active?: boolean;
      storeIds?: string[];
      password?: string;
    } = {};

    if (req.body?.name !== undefined) {
      const name = normalizeName(req.body.name);
      if (!isValidName(name)) return res.status(400).json({ error: 'O nome deve ter entre 2 e 120 caracteres.' });
      input.name = name;
    }
    if (req.body?.login !== undefined) {
      const login = normalizeIdentifier(req.body.login);
      if (!validateLogin(login)) return res.status(400).json({ error: 'O login deve ter no mínimo 4 letras e apenas letras.' });
      input.login = login;
    }
    if (req.body?.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Informe um e-mail válido.' });
      input.email = email;
    }
    if (req.body?.active !== undefined) {
      if (typeof req.body.active !== 'boolean') return res.status(400).json({ error: 'Status do vendedor deve ser booleano.' });
      input.active = req.body.active;
    }
    if (req.body?.storeIds !== undefined) {
      const storeIds = normalizeStoreIds(req.body.storeIds);
      if (storeIds.length === 0) return res.status(400).json({ error: 'Selecione ao menos uma loja para o vendedor.' });
      input.storeIds = storeIds;
    }
    if (req.body?.password !== undefined) {
      const passwordCheck = validatePassword(String(req.body.password));
      if (!passwordCheck.ok) return res.status(400).json({ error: passwordCheck.message });
      input.password = String(req.body.password);
    }

    if (Object.keys(input).length === 0) {
      return res.status(400).json({ error: 'Informe a alteração desejada.' });
    }

    try {
      await updateMerchant(merchantId, input, ctx);
      return res.status(200).json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o vendedor.';
      return res.status(400).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
