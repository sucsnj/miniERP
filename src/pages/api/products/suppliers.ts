import type { NextApiRequest, NextApiResponse } from 'next';
import { listSuppliers, createSupplier, deleteSupplier, updateSupplier } from '../../../database/productsRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      return res.status(200).json(await listSuppliers());
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      }
      const id = await createSupplier(String(name).trim());
      return res.status(201).json({ id, message: 'Fornecedor cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao salvar fornecedor.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'ID do fornecedor é inválido.' });
      await deleteSupplier(String(id));
      return res.status(200).json({ message: 'Fornecedor apagado com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao apagar fornecedor.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = req.query.id;
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      if (!id) return res.status(400).json({ error: 'ID do fornecedor é inválido.' });
      if (!name || !String(name).trim()) return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      await updateSupplier(String(id), String(name).trim());
      return res.status(200).json({ message: 'Fornecedor atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
