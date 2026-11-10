import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategorias, insertCategoria, deleteCategoria, updateCategoria } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const cats = getCategorias();
      return res.status(200).json(cats);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, descricao } = req.body;
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
      }

      const cats = getCategorias();
      if (cats.some(c => c.nome.toLowerCase() === nome.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Esta categoria já existe.' });
      }

      const result = insertCategoria(nome.trim(), descricao);
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Categoria cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      return res.status(500).json({ error: 'Erro ao salvar categoria.' });
    }
  }

  // Deletar categoria
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da categoria é inválido.' });
      }
      deleteCategoria(Number(id));
      return res.status(200).json({ message: 'Categoria apagada com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar categoria:', error);
      return res.status(500).json({ error: 'Erro ao apagar categoria.' });
    }
  }

  // Atualizar categoria
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { nome, descricao } = req.body;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da categoria é inválido.' });
      }
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
      }
      updateCategoria(Number(id), nome.trim(), descricao);
      return res.status(200).json({ message: 'Categoria atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
