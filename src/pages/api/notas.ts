import type { NextApiRequest, NextApiResponse } from 'next';
import parseNumber from '../../utils/number';
import {
  insertInvoice,
  getInvoicesById,
  getInvoicesByAmount,
  getInvoicesByPeriod,
  getAllInvoices,
  deleteInvoice,
} from '../../database/notasDb';

// Handler de API ou componente exportado.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ano: yearParam, mes: monthParam, id, valor: amountParam } = req.query;
    if (id) {
      const invoice = getInvoicesById(parseInt(id as string));
      if (!invoice) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }
      return res.status(200).json(invoice);
    }
    // Buscar por valor
    if (amountParam) {
      const invoice = getInvoicesByAmount(parseNumber(amountParam as string));
      if (!invoice) {
        return res.status(404).json({ error: 'Nenhuma nota encontrada com esse valor' });
      }
      return res.status(200).json(invoice);
    }

    // Buscar por período (ano/mês)
    if (!yearParam) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }
    const invoices = getInvoicesByPeriod(
      parseInt(yearParam as string),
      monthParam ? parseInt(monthParam as string) : undefined
    );

    // Buscar todas as notas
    const allInvoices = getAllInvoices();
    if (allInvoices.length === 0) {
      return res.status(200).json([]);
    }

    // console.log(notas); // debug
    return res.status(200).json(invoices);
  }

  if (req.method === 'POST') {
    const { distribuidora: distributor, chave: key, dataEmissao: issueDate, valorNota: invoiceAmount } = req.body;
    if (!distributor || !key || !issueDate || !invoiceAmount) {
      return res.status(400).json({ error: 'Data de emissão e valor da nota são obrigatórios' });
    }
    const result = insertInvoice(distributor, key, issueDate, invoiceAmount);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID é obrigatório para exclusão' });
    }
    const result = deleteInvoice(parseInt(id as string));
    return res.status(200).json({ changes: result.changes });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
