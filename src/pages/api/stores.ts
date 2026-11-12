import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthContext, listAuthorizedStores, setCurrentStore } from '../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: 'Não autenticado.' });

  if (req.method === 'GET') {
    const stores = await listAuthorizedStores(ctx);
    return res.status(200).json({ stores, currentStoreId: ctx.storeId });
  }

  if (req.method === 'POST') {
    const storeId = String(req.body?.storeId ?? '');
    if (!storeId) return res.status(400).json({ error: 'Loja é obrigatória.' });

    const store = await setCurrentStore(ctx, storeId);
    if (!store) return res.status(403).json({ error: 'Loja não autorizada.' });

    const user = { ...ctx, storeId: store.id, storeName: store.name };
    return res.status(200).json({ store, user });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
