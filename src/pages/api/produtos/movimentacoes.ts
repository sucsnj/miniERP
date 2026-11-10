import type { NextApiRequest, NextApiResponse } from 'next';
import { insertMovimentacaoEstoque, getMovimentacoesEstoque, getItemById } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { item_id } = req.query;
      if (!item_id || isNaN(Number(item_id))) {
        return res.status(400).json({ error: 'ID do item é obrigatório para buscar movimentações.' });
      }

      const movements = getMovimentacoesEstoque(Number(item_id));
      return res.status(200).json(movements);
    } catch (error) {
      console.error('Erro ao buscar movimentações de estoque:', error);
      return res.status(500).json({ error: 'Erro ao buscar movimentações de estoque.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { item_id, tipo, quantidade, descricao } = req.body;
      if (!item_id || isNaN(Number(item_id))) {
        return res.status(400).json({ error: 'ID do item é obrigatório para registrar movimentação.' });
      }
      if (!tipo || ['ENTRADA', 'SAIDA', 'AJUSTE'].indexOf(String(tipo).toUpperCase()) === -1) {
        return res.status(400).json({ error: 'Tipo de movimentação deve ser ENTRADA, SAIDA ou AJUSTE.' });
      }
      if (!quantidade || isNaN(Number(quantidade))) {
        return res.status(400).json({ error: 'Quantidade deve ser um número válido.' });
      }

      const item = getItemById(Number(item_id));
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      const movement = insertMovimentacaoEstoque({
        item_id: Number(item_id),
        tipo: String(tipo).toUpperCase() as 'ENTRADA' | 'SAIDA' | 'AJUSTE',
        quantidade: Number(quantidade),
        descricao,
      });

      return res.status(201).json({ id: movement.lastInsertRowid, message: 'Movimentação de estoque registrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao registrar movimentação de estoque:', error);
      return res.status(500).json({ error: 'Erro ao registrar movimentação de estoque.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
