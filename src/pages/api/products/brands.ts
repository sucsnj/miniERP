import type { NextApiRequest, NextApiResponse } from 'next';
import { listBrands, createBrand, deleteBrand, updateBrand } from '../../../database/productsRepository';
import { requireApiAuth } from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    try {
      return res.status(200).json(await listBrands(ctx));
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      return res.status(500).json({ error: 'Erro ao buscar marcas.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
      }
      const id = await createBrand(String(name).trim(), ctx);
      return res.status(201).json({ id, message: 'Marca cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
      return res.status(500).json({ error: 'Erro ao salvar marca.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'ID da marca é inválido.' });
      await deleteBrand(String(id), ctx);
      return res.status(200).json({ message: 'Marca apagada com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar marca:', error);
      return res.status(500).json({ error: 'Erro ao apagar marca.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = req.query.id;
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      if (!id) return res.status(400).json({ error: 'ID da marca é inválido.' });
      if (!name || !String(name).trim()) return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
      await updateBrand(String(id), String(name).trim(), ctx);
      return res.status(200).json({ message: 'Marca atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar marca:', error);
      return res.status(500).json({ error: 'Erro ao atualizar marca.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
