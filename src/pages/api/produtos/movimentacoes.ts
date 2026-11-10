import type { NextApiRequest, NextApiResponse } from 'next';
import { listStockMovements, applyStockMovement } from '../../../database/productsRepository';

const mapTypeToEnglish = (type: string): 'IN' | 'OUT' | 'ADJUST' => {
  const upper = type.trim().toUpperCase();
  if (upper === 'ENTRADA' || upper === 'IN') return 'IN';
  if (upper === 'SAIDA' || upper === 'OUT') return 'OUT';
  return 'ADJUST';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const productId = req.query.productId ?? req.query.item_id;
      if (!productId) {
        return res.status(400).json({ error: 'ID do item é obrigatório para buscar movimentações.' });
      }

      const movements = await listStockMovements(String(productId));
      return res.status(200).json(movements);
    } catch (error) {
      console.error('Erro ao buscar movimentações de estoque:', error);
      return res.status(500).json({ error: 'Erro ao buscar movimentações de estoque.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const productId = body.productId ?? body.item_id;
      const movementType = body.type ?? body.tipo;
      const quantity = body.quantity ?? body.quantidade;
      const description = body.description ?? body.descricao;

      if (!productId) {
        return res.status(400).json({ error: 'ID do item é obrigatório para registrar movimentação.' });
      }
      if (!movementType) {
        return res.status(400).json({ error: 'Tipo de movimentação é obrigatório.' });
      }

      const movement = await applyStockMovement(String(productId), mapTypeToEnglish(String(movementType)), Number(quantity), description ?? null);
      return res.status(201).json({ id: movement.id, message: 'Movimentação de estoque registrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao registrar movimentação de estoque:', error);
      return res.status(500).json({ error: 'Erro ao registrar movimentação de estoque.', details: String(error) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
