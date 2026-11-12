import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from '../../../database/productsRepository';
import { isAdmin, requireApiAuth } from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;
  if (req.method !== 'GET' && !isAdmin(ctx)) {
    return res.status(403).json({ error: 'Ação permitida apenas para administradores.' });
  }

  if (req.method === 'GET') {
    try {
      const categories = await listCategories(ctx);
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      const description = body.description ?? body.description;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
      }

      const categories = await listCategories(ctx);
      if (categories.some((c) => c.name.toLowerCase() === String(name).trim().toLowerCase())) {
        return res.status(400).json({ error: 'Esta categoria já existe.' });
      }

      const id = await createCategory(String(name).trim(), description ? String(description) : undefined, ctx);
      return res.status(201).json({ id, message: 'Categoria cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      return res.status(500).json({ error: 'Erro ao salvar categoria.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'ID da categoria é inválido.' });
      }
      await deleteCategory(String(id), ctx);
      return res.status(200).json({ message: 'Categoria apagada com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar categoria:', error);
      return res.status(500).json({ error: 'Erro ao apagar categoria.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = req.query.id;
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      const description = body.description ?? body.description;
      if (!id) {
        return res.status(400).json({ error: 'ID da categoria é inválido.' });
      }
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
      }
      await updateCategory(String(id), String(name).trim(), description ? String(description) : undefined, ctx);
      return res.status(200).json({ message: 'Categoria atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
