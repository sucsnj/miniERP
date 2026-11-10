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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPayable(p: any) {
  return {
    id: String(p.id),
    distribuidora: p.supplierName,
    valor: p.amount,
    vencimento: p.dueDate,
    documento: p.document,
    status: p.status === 'PAID' ? 'Pago' : 'Pendente',
    banco_observacoes: p.bankNotes,
    criado_em: p.createdAt,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ano: yearParam, mes: monthParam } = req.query;
    if (!yearParam) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }

    const accounts = await listPayablesByPeriod(parseInt(yearParam as string), monthParam ? parseInt(monthParam as string) : undefined);
    return res.status(200).json(accounts.map(mapPayable));
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    const { action, id } = body;

    if (action === 'pagar') {
      if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para pagar' });
      const existing = await getPayableById(String(id));
      if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });
      await payPayable(String(id));
      return res.status(200).json({ message: 'Conta marcada como Pago' });
    }

    if (action === 'cancelar') {
      if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para cancelar o pagamento' });
      const existing = await getPayableById(String(id));
      if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });
      await cancelPayablePayment(String(id));
      return res.status(200).json({ message: 'Pagamento cancelado e conta voltou a Pendente' });
    }

    const distributor = body.distribuidora ?? body.supplierName;
    const amount = body.valor ?? body.amount;
    const dueDate = body.vencimento ?? body.dueDate;
    const documentNumber = body.documento ?? body.document;
    const bankNotes = body.bancoObservacoes ?? body.bankNotes;

    if (!distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para criação de conta' });
    }

    const allAccounts = await listAllPayables();
    const duplicateAccount = allAccounts.find((c) => c.supplierName === distributor && c.document === documentNumber);
    if (duplicateAccount) {
      return res.status(400).json({ error: 'Já existe uma conta com a mesma distribuidora e documento' });
    }

    await createPayable({ supplierName: distributor, amount, dueDate, document: documentNumber, bankNotes });
    return res.status(200).json({ message: 'Conta registrada com sucesso' });
  }

  if (req.method === 'PUT') {
    const body = req.body ?? {};
    const id = body.id;
    const distributor = body.distribuidora ?? body.supplierName;
    const amount = body.valor ?? body.amount;
    const dueDate = body.vencimento ?? body.dueDate;
    const documentNumber = body.documento ?? body.document;
    const bankNotes = body.bancoObservacoes ?? body.bankNotes;

    if (!id || !distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para atualização de conta' });
    }

    const existing = await getPayableById(String(id));
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });

    await updatePayable({ id: String(id), supplierName: distributor, amount, dueDate, document: documentNumber, bankNotes });
    return res.status(200).json({ message: 'Conta atualizada com sucesso' });
  }

  if (req.method === 'DELETE') {
    const body = req.body ?? {};
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'ID da conta é obrigatório para exclusão' });

    const existing = await getPayableById(String(id));
    if (!existing) return res.status(404).json({ error: 'Conta não encontrada' });

    await deletePayable(String(id));
    return res.status(200).json({ message: 'Conta excluída com sucesso' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
