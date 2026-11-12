import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listPayablesByPeriod,
  listAllPayables,
  getPayableById,
  createPayable,
  updatePayable,
  deletePayable,
  payPayable,
  cancelPayablePayment,
} from '../../database/payablesRepository';
import { isAdmin, requireApiAuth } from '../../utils/serverAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPayable(p: any) {
  return {
    id: String(p.id),
    supplierName: p.supplierName,
    amount: p.amount,
    dueDate: p.dueDate,
    document: p.document,
    status: p.status === 'PAID' ? 'Pago' : 'Pendente',
    bankNotes: p.bankNotes,
    createdAt: p.createdAt,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;
  if (req.method !== 'GET' && !isAdmin(ctx)) {
    return res.status(403).json({ error: 'Ação permitida apenas para administradores.' });
  }

  if (req.method === 'GET') {
    const { year: yearParam, month: monthParam } = req.query;
    if (!yearParam) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }

    const accounts = await listPayablesByPeriod(parseInt(yearParam as string), monthParam ? parseInt(monthParam as string) : undefined, ctx);
    return res.status(200).json(accounts.map(mapPayable));
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    const { action, id } = body;

    if (action === 'pagar') {
      if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para pagar' });
      const existing = await getPayableById(String(id), ctx);
      if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });
      await payPayable(String(id), ctx);
      return res.status(200).json({ message: 'Conta marcada como Pago' });
    }

    if (action === 'cancelar') {
      if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para cancelar o pagamento' });
      const existing = await getPayableById(String(id), ctx);
      if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });
      await cancelPayablePayment(String(id), ctx);
      return res.status(200).json({ message: 'Pagamento cancelado e conta voltou a Pendente' });
    }

    const distributor = body.supplierName ?? body.supplierName;
    const amount = body.amount ?? body.amount;
    const dueDate = body.dueDate ?? body.dueDate;
    const documentNumber = body.document ?? body.document;
    const bankNotes = body.bankNotes ?? body.bankNotes;

    if (!distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para criação de conta' });
    }

    const allAccounts = await listAllPayables(ctx);
    const duplicateAccount = allAccounts.find((c) => c.supplierName === distributor && c.document === documentNumber);
    if (duplicateAccount) {
      return res.status(400).json({ error: 'Já existe uma conta com a mesma distribuidora e documento' });
    }

    await createPayable({ supplierName: distributor, amount, dueDate, document: documentNumber, bankNotes }, ctx);
    return res.status(200).json({ message: 'Conta registrada com sucesso' });
  }

  if (req.method === 'PUT') {
    const body = req.body ?? {};
    const id = body.id;
    const distributor = body.supplierName ?? body.supplierName;
    const amount = body.amount ?? body.amount;
    const dueDate = body.dueDate ?? body.dueDate;
    const documentNumber = body.document ?? body.document;
    const bankNotes = body.bankNotes ?? body.bankNotes;

    if (!id || !distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para atualização de conta' });
    }

    const existing = await getPayableById(String(id), ctx);
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });

    await updatePayable({ id: String(id), supplierName: distributor, amount, dueDate, document: documentNumber, bankNotes }, ctx);
    return res.status(200).json({ message: 'Conta atualizada com sucesso' });
  }

  if (req.method === 'DELETE') {
    const body = req.body ?? {};
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para exclusão' });

    const existing = await getPayableById(String(id), ctx);
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });

    await deletePayable(String(id), ctx);
    return res.status(200).json({ message: 'Conta excluída com sucesso' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
