import type { NextApiRequest, NextApiResponse } from 'next';
import { getUnidadesMedida, insertUnidadeMedida, deleteUnidadeMedida, updateUnidadeMedida } from '../../../database/produtosDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const uoms = getUnidadesMedida();
      return res.status(200).json(uoms);
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      return res.status(500).json({ error: 'Erro ao buscar unidades de medida.' });
    }
  }

  if (req.method === 'POST') {
      try {
        const { sigla, descricao } = req.body;
        if (!sigla || !sigla.trim()) {
          return res.status(400).json({ error: 'Sigla da unidade de medida é obrigatória.' });
        }
  
        const um = getUnidadesMedida();
        if (um.some(c => c.sigla.toLowerCase() === sigla.trim().toLowerCase())) {
          return res.status(400).json({ error: 'Esta unidade de medida já existe.' });
        }
  
        const result = insertUnidadeMedida(sigla.trim(), descricao);
        return res.status(201).json({ id: result.lastInsertRowid, message: 'Unidade de medida cadastrada com sucesso.' });
      } catch (error) {
        console.error('Erro ao salvar unidade de medida:', error);
        return res.status(500).json({ error: 'Erro ao salvar unidade de medida.' });
      }
    }
  
    // Deletar Unidades de Medida
    if (req.method === 'DELETE') {
      try {
        const { id } = req.query;
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ error: 'ID da unidade de medida é inválido.' });
        }
        deleteUnidadeMedida(Number(id));
        return res.status(200).json({ message: 'Unidade de medida apagada com sucesso.' });
      } catch (error) {
        console.error('Erro ao apagar unidade de medida:', error);
        return res.status(500).json({ error: 'Erro ao apagar unidade de medida.' });
      }
    }
  
    // Atualizar unidades de medida
    if (req.method === 'PUT') {
      try {
        const { id } = req.query;
        const { sigla, descricao } = req.body;
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ error: 'ID da unidade de medida é inválido.' });
        }
        if (!sigla || !sigla.trim()) {
          return res.status(400).json({ error: 'Sigla da unidade de medida é obrigatório.' });
        }
        updateUnidadeMedida(Number(id), sigla.trim(), descricao);
        return res.status(200).json({ message: 'Unidade de medida atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar unidade de medida:', error);
        return res.status(500).json({ error: 'Erro ao atualizar unidade de medida.' });
      }
    }
  
    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  