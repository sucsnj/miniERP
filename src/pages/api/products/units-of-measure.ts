import type { NextApiRequest, NextApiResponse } from 'next';
import { listUnitsOfMeasure, createUnitOfMeasure, deleteUnitOfMeasure, updateUnitOfMeasure } from '../../../database/productsRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      return res.status(200).json(await listUnitsOfMeasure());
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      return res.status(500).json({ error: 'Erro ao buscar unidades de medida.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const abbreviation = body.abbreviation ?? body.sigla;
      const description = body.description ?? body.description;
      if (!abbreviation || !String(abbreviation).trim()) {
        return res.status(400).json({ error: 'Sigla da unidade de medida é obrigatória.' });
      }
      const id = await createUnitOfMeasure(String(abbreviation).trim(), description ? String(description) : undefined);
      return res.status(201).json({ id, message: 'Unidade de medida cadastrada com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar unidade de medida:', error);
      return res.status(500).json({ error: 'Erro ao salvar unidade de medida.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'ID da unidade de medida é inválido.' });
      await deleteUnitOfMeasure(String(id));
      return res.status(200).json({ message: 'Unidade de medida apagada com sucesso.' });
    } catch (error) {
      console.error('Erro ao apagar unidade de medida:', error);
      return res.status(500).json({ error: 'Erro ao apagar unidade de medida.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = req.query.id;
      const body = req.body ?? {};
      const abbreviation = body.abbreviation ?? body.sigla;
      const description = body.description ?? body.description;
      if (!id) return res.status(400).json({ error: 'ID da unidade de medida é inválido.' });
      if (!abbreviation || !String(abbreviation).trim()) return res.status(400).json({ error: 'Sigla da unidade de medida é obrigatória.' });
      await updateUnitOfMeasure(String(id), String(abbreviation).trim(), description ? String(description) : undefined);
      return res.status(200).json({ message: 'Unidade de medida atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar unidade de medida:', error);
      return res.status(500).json({ error: 'Erro ao atualizar unidade de medida.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
