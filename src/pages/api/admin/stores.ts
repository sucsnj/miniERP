import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi, isValidName, normalizeName } from '../../../utils/serverAuth';
import { createStore, listStores, updateStoreProfile, updateStoreStatus } from '../../../database/adminRepository';
import { normalizeStoreProfile } from '../../../utils/businessProfile';

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
    if (!storeId) {
      return res.status(400).json({ error: 'Informe a loja.' });
    }

    if (req.body?.statusOnly === true) {
      if (typeof req.body?.active !== 'boolean') {
        return res.status(400).json({ error: 'Status da loja deve ser booleano.' });
      }

      try {
        await updateStoreStatus(storeId, req.body.active, ctx);
        return res.status(200).json({ ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível atualizar a loja.';
        return res.status(400).json({ error: message });
      }
    }

    const parsed = normalizeStoreProfile({ ...(req.body ?? {}), id: storeId });
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.message });
    }

    try {
      const store = await updateStoreProfile(storeId, parsed.value, ctx);
      return res.status(200).json({ store });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a loja.';
      return res.status(400).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
