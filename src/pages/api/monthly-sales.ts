import type { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyTotal, listMonthlySales, consolidateMonthly, deleteMonthlySale } from '../../database/salesRepository';
import { requireApiAuth } from '../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    const { month: monthParam, year: yearParam } = req.query;
    if (monthParam && yearParam) {
      try {
        const total = await getMonthlyTotal(parseInt(monthParam as string), parseInt(yearParam as string), ctx);
        res.status(200).json(total);
      } catch {
        res.status(500).json({ error: 'Erro ao buscar total mensal' });
      }
    } else {
      try {
        const all = await listMonthlySales(ctx);
        res.status(200).json(all);
      } catch {
        res.status(500).json({ error: 'Erro ao buscar totais mensais' });
      }
    }
  } else if (req.method === 'POST') {
    const body = req.body ?? {};
    const month = body.month ?? body.month;
    const year = body.year ?? body.year;
    try {
      await consolidateMonthly(Number(month), Number(year), ctx);
      res.status(200).json({ message: 'Consolidação realizada' });
    } catch {
      res.status(500).json({ error: 'Erro na consolidação' });
    }
  } else if (req.method === 'DELETE') {
    const body = req.body ?? {};
    const id = body.id;
    if (!id) {
      return res.status(400).json({ error: 'ID do mês é obrigatório para exclusão' });
    }
    try {
      await deleteMonthlySale(String(id), ctx);
      res.status(200).json({ message: 'Mês excluído com sucesso' });
    } catch (error) {
      console.error('Erro na API DELETE /api/monthly-sales:', error);
      res.status(500).json({ error: 'Erro ao excluir mês', details: String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
