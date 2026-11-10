import type { NextApiRequest, NextApiResponse } from 'next';
import { getSuppliers, insertSupplier, deleteSupplier, updateSupplier } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const suppliers = getSuppliers();
      return res.status(200).json(suppliers);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome: name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      }

      const suppliers = getSuppliers();
      if (suppliers.some(f => f.nome.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Este fornecedor já existe.' });
      }

      const result = insertSupplier(name.trim());
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Fornecedor cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao salvar fornecedor.' });
    }
  }

  // Deletar fornecedor
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID do fornecedor é inválido.' });
      }
      deleteSupplier(Number(id));
      return res.status(200).json({ message: 'Fornecedor apagado com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao apagar fornecedor.' });
    }
  }

  // Atualizar fornecedor
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { nome: name } = req.body;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID do fornecedor é inválido.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      }
      updateSupplier(Number(id), name.trim());
      return res.status(200).json({ message: 'Fornecedor atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
