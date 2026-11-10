import type { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyTotal, getAllMonthly, consolidateMonthly, deleteMonthly } from '../../database/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { mes, ano } = req.query;
    if (mes && ano) {
      try {
        const total = getMonthlyTotal(parseInt(mes as string), parseInt(ano as string));
        res.status(200).json(total);
      } catch {
        res.status(500).json({ error: 'Erro ao buscar total mensal' });
      }
    } else {
      try {
        const all = getAllMonthly();
        res.status(200).json(all);
      } catch {
        res.status(500).json({ error: 'Erro ao buscar totais mensais' });
      }
    }
  } else if (req.method === 'POST') {
    const { mes, ano } = req.body;
    try {
      consolidateMonthly(mes, ano);
      res.status(200).json({ message: 'Consolidação realizada' });
    } catch {
      res.status(500).json({ error: 'Erro na consolidação' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID do mês é obrigatório para exclusão' });
    }
    try {
      deleteMonthly(id);
      res.status(200).json({ message: 'Mês excluído com sucesso' });
    } catch (error) {
      console.error('Erro na API DELETE /api/mensais:', error);
      res.status(500).json({ error: 'Erro ao excluir mês', details: String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
