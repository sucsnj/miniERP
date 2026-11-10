import type { NextApiRequest, NextApiResponse } from 'next';
import { getSaleItems } from '../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { vendaId: saleId } = req.query;
    if (!saleId || isNaN(Number(saleId))) {
      return res.status(400).json({ error: 'vendaId inválido' });
    }
    try {
      const items = getSaleItems(Number(saleId));
      return res.status(200).json(items);
    } catch (error) {
      console.error('Erro na API GET /api/venda-itens:', error);
      return res.status(500).json({ error: 'Erro ao buscar itens da venda', details: String(error) });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
