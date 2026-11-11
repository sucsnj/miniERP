import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthContext } from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  const context = await getAuthContext(req);
  if (!context) return res.status(401).json({ error: 'Não autenticado.' });
  return res.status(200).json({ user: context });
}
