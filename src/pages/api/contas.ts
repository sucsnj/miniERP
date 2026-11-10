import type { NextApiRequest, NextApiResponse } from 'next';
import {
  cancelAccountPayment,
  deleteAccount,
  getAccountById,
  getAccountsByPeriod,
  getAllAccounts,
  insertAccount,
  payAccount,
  updateAccount,
} from '../../database/contasDb';

// Handler de API ou componente exportado.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ano: yearParam, mes: monthParam } = req.query;
    if (!yearParam) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }

    const accounts = getAccountsByPeriod(parseInt(yearParam as string), monthParam ? parseInt(monthParam as string) : undefined);
    return res.status(200).json(accounts);
  }

  if (req.method === 'POST') {
    const {
      action,
      id,
      distribuidora: distributor,
      valor: amount,
      vencimento: dueDate,
      documento: documentNumber,
      bancoObservacoes: bankNotes,
    } = req.body;

    if (action === 'pagar') {
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório para pagar' });
      }
      const existingAccount = getAccountById(id);
      if (!existingAccount) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      payAccount(id);
      return res.status(200).json({ message: 'Conta marcada como Pago' });
    }

    if (action === 'cancelar') {
      if (!id) {
        return res.status(400).json({ error: 'ID da conta é obrigatório para cancelar o pagamento' });
      }
      const existingAccount = getAccountById(id);
      if (!existingAccount) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      cancelAccountPayment(id);
      return res.status(200).json({ message: 'Pagamento cancelado e conta voltou a Pendente' });
    }

    if (!distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para criação de conta' });
    }

    const allAccounts = getAllAccounts();
    const duplicateAccount = allAccounts.find(c => c.distribuidora === distributor && c.documento === documentNumber);
    if (duplicateAccount) {
      return res.status(400).json({ error: 'Já existe uma conta com a mesma distribuidora e documento' });
    }

    insertAccount(distributor, amount, dueDate, documentNumber, bankNotes);
    return res.status(200).json({ message: 'Conta registrada com sucesso' });
  }

  if (req.method === 'PUT') {
    const {
      id,
      distribuidora: distributor,
      valor: amount,
      vencimento: dueDate,
      documento: documentNumber,
      bancoObservacoes: bankNotes,
    } = req.body;
    if (!id || !distributor || typeof amount !== 'number' || !dueDate || !documentNumber) {
      return res.status(400).json({ error: 'Dados inválidos para atualização de conta' });
    }

    const existingAccount = getAccountById(id);
    if (!existingAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    updateAccount(id, distributor, amount, dueDate, documentNumber, bankNotes);
    return res.status(200).json({ message: 'Conta atualizada com sucesso' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da conta é obrigatório para exclusão' });
    }

    const existingAccount = getAccountById(id);
    if (!existingAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    deleteAccount(id);
    return res.status(200).json({ message: 'Conta excluída com sucesso' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
