import type { NextApiRequest, NextApiResponse } from 'next';
import { getMarcas, insertMarca, deleteMarca, updateMarca } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const brands = getMarcas();
      return res.status(200).json(brands);
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      return res.status(500).json({ error: 'Erro ao buscar marcas.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome } = req.body;
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
      }

      const brands = getMarcas();
      if (brands.some(b => b.nome.toLowerCase() === nome.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Esta marca já existe.' });
      }

      const result = insertMarca(nome.trim());
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Marca cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
      return res.status(500).json({ error: 'Erro ao salvar marca.' });
    }
  }

  // Deletar marca
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da marca é inválido.' });
      }
      deleteMarca(Number(id));
      return res.status(200).json({ message: 'Marca apagada com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar marca:', error);
      return res.status(500).json({ error: 'Erro ao apagar marca.' });
    }
  }

  // Atualizar marca
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { nome } = req.body;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da marca é inválido.' });
      }
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
      }
      updateMarca(Number(id), nome.trim());
      return res.status(200).json({ message: 'Marca atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar marca:', error);
      return res.status(500).json({ error: 'Erro ao atualizar marca.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
