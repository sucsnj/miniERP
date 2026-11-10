import type { NextApiRequest, NextApiResponse } from 'next';
import { getFornecedores, insertFornecedor, deleteFornecedor, updateFornecedor } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const forns = getFornecedores();
      return res.status(200).json(forns);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome } = req.body;
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      }

      const forns = getFornecedores();
      if (forns.some(f => f.nome.toLowerCase() === nome.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Este fornecedor já existe.' });
      }

      const result = insertFornecedor(nome.trim());
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
      deleteFornecedor(Number(id));
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
      const { nome } = req.body;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID do fornecedor é inválido.' });
      }
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome do fornecedor é obrigatório.' });
      }
      updateFornecedor(Number(id), nome.trim());
      return res.status(200).json({ message: 'Fornecedor atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return res.status(500).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
