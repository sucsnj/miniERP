import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi, isValidName, normalizeName } from '../../../utils/serverAuth';
import { createStore, listStores, updateStore } from '../../../database/adminRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    try {
      const stores = await listStores(ctx);
      return res.status(200).json({ stores });
    } catch (error) {
      console.error('Erro ao listar lojas:', error);
      return res.status(500).json({ error: 'Não foi possível listar as lojas.' });
    }
  }

  if (req.method === 'POST') {
    const name = normalizeName(req.body?.name);
    if (!isValidName(name)) {
      return res.status(400).json({ error: 'A loja deve ter entre 2 e 120 caracteres.' });
    }

    try {
      const store = await createStore(name, ctx);
      return res.status(201).json({ store });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar a loja.';
      return res.status(400).json({ error: message });
    }
  }

  if (req.method === 'PATCH') {
    const storeId = String(req.body?.id ?? '');
    const patch: { name?: string; active?: boolean } = {};

    if (req.body?.name !== undefined) {
      const name = normalizeName(req.body.name);
      if (!isValidName(name)) {
        return res.status(400).json({ error: 'A loja deve ter entre 2 e 120 caracteres.' });
      }
      patch.name = name;
    }

    if (req.body?.active !== undefined) {
      if (typeof req.body.active !== 'boolean') {
        return res.status(400).json({ error: 'Status da loja deve ser booleano.' });
      }
      patch.active = req.body.active;
    }

    if (!storeId || Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Informe a loja e a alteração desejada.' });
    }

    try {
      await updateStore(storeId, patch, ctx);
      return res.status(200).json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a loja.';
      return res.status(400).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
