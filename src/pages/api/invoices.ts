import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getInvoiceById,
  getInvoiceByAmount,
  listInvoicesByPeriod,
  listAllInvoices,
  createInvoice,
  deleteInvoice,
} from '../../database/payablesRepository';
import parseNumber from '../../utils/number';
import { isAdmin, requireApiAuth } from '../../utils/serverAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(inv: any) {
  return {
    id: inv.id,
    supplierName: inv.supplierName,
    chave: inv.accessKey,
    issueDate: inv.issueDate,
    amount: inv.amount,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;
  if (req.method !== 'GET' && !isAdmin(ctx)) {
    return res.status(403).json({ error: 'Ação permitida apenas para administradores.' });
  }

  if (req.method === 'GET') {
    const { year: yearParam, month: monthParam, id, amount: amountParam } = req.query;
    if (id) {
      const invoice = await getInvoiceById(String(id), ctx);
      if (!invoice) return res.status(404).json({ error: 'Nota não encontrada' });
      return res.status(200).json(mapInvoice(invoice));
    }
    if (amountParam) {
      const invoice = await getInvoiceByAmount(parseNumber(amountParam as string), ctx);
      if (!invoice) return res.status(404).json({ error: 'Nenhuma nota encontrada com esse valor' });
      return res.status(200).json(mapInvoice(invoice));
    }

    if (!yearParam) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }
    const invoices = await listInvoicesByPeriod(parseInt(yearParam as string), monthParam ? parseInt(monthParam as string) : undefined, ctx);

    const allInvoices = await listAllInvoices(ctx);
    if (allInvoices.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(invoices.map(mapInvoice));
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    const distributor = body.supplierName ?? body.supplierName;
    const key = body.chave ?? body.accessKey;
    const issueDate = body.issueDate ?? body.issueDate;
    const invoiceAmount = body.amount ?? body.amount;
    if (!distributor || !key || !issueDate || !invoiceAmount) {
      return res.status(400).json({ error: 'Data de emissão e valor da nota são obrigatórios' });
    }
    const id = await createInvoice({ supplierName: distributor, accessKey: key, issueDate, amount: invoiceAmount }, ctx);
    return res.status(201).json({ id });
  }

  if (req.method === 'DELETE') {
    const body = req.body ?? {};
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório para exclusão' });
    await deleteInvoice(String(id), ctx);
    return res.status(200).json({ changes: 1 });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
