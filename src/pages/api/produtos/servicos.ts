import type { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteService,
  getServiceById,
  getServices,
  insertService,
  updateService,
} from '../../../database/produtosDb';

const normalizeServicePayload = (body: Record<string, unknown>) => {
  const payload = body && typeof body === 'object' ? body : {};

  const categoryId = Number(payload.categoria_id);
  const salePrice = Number(payload.preco_venda ?? 0);
  const duracaoMinutos = Number(payload.duracao_minutos ?? 0);

  return {
    nome: typeof payload.nome === 'string' ? payload.nome.trim() : '',
    descricao: typeof payload.descricao === 'string' ? payload.descricao.trim() || undefined : undefined,
    categoria_id: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : 0,
    preco_venda: Number.isFinite(salePrice) ? salePrice : 0,
    codigo_interno: typeof payload.codigo_interno === 'string' ? payload.codigo_interno.trim() || undefined : undefined,
    referencia: typeof payload.referencia === 'string' ? payload.referencia.trim() || undefined : undefined,
    duracao_minutos: Number.isFinite(duracaoMinutos) ? duracaoMinutos : 0,
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (req.query.id) {
        return res.status(200).json(getServiceById(Number(req.query.id)) ?? null);
      }

      const result = getServices({
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        categoria_id: req.query.categoria_id ? Number(req.query.categoria_id) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      return res.status(200).json({
        items: result.services,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch {
      return res.status(500).json({ error: 'Erro ao buscar serviços.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = normalizeServicePayload(req.body);
      if (!payload.nome) {
        return res.status(400).json({ error: 'O nome do serviço é obrigatório.' });
      }
      if (!payload.categoria_id) {
        return res.status(400).json({ error: 'A categoria do serviço é obrigatória.' });
      }

      const id = insertService(payload);
      return res.status(201).json(getServiceById(Number(id)) ?? { id });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao criar serviço.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = Number(req.query.id);
      const payload = normalizeServicePayload(req.body);
      if (!id) {
        return res.status(400).json({ error: 'ID do serviço é obrigatório.' });
      }
      if (!payload.nome || !payload.categoria_id) {
        return res.status(400).json({ error: 'Nome e categoria do serviço são obrigatórios.' });
      }
      if (!getServiceById(id)) {
        return res.status(404).json({ error: 'Serviço não encontrado.' });
      }

      updateService(id, payload);
      return res.status(200).json(getServiceById(id));
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao atualizar serviço.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = Number(req.query.id);
      if (!id) {
        return res.status(400).json({ error: 'ID do serviço é obrigatório.' });
      }
      if (!getServiceById(id)) {
        return res.status(404).json({ error: 'Serviço não encontrado.' });
      }

      deleteService(id);
      return res.status(200).json({ message: 'Serviço excluído com sucesso.' });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao excluir serviço.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}