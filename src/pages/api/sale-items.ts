import type { NextApiRequest, NextApiResponse } from 'next';
import { getSaleItems } from '../../database/salesRepository';
import { requireApiAuth } from '../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ctx = await requireApiAuth(req, res);
    if (!ctx) return;

    const saleId = req.query.saleId ?? req.query.vendaId;
    if (!saleId) {
      return res.status(400).json({ error: 'saleId inválido' });
    }
    try {
      const items = await getSaleItems(String(saleId), ctx);
      return res.status(200).json(items);
    } catch (error) {
      console.error('Erro na API GET /api/sale-items:', error);
      return res.status(500).json({ error: 'Erro ao buscar itens da venda', details: String(error) });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
