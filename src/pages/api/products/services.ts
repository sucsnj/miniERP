import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
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
      if (req.query.id) {
        const service = await getService(String(req.query.id), ctx);
        return res.status(200).json(service);
      }

      const result = await listServices({
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        categoryId: req.query.categoryId ? String(req.query.categoryId) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      }, ctx);

      return res.status(200).json({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return res.status(500).json({ error: 'Erro ao buscar serviços.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const name = body.name ?? body.name;
      const categoryId = body.categoryId ?? body.categoryId;
      const salePrice = body.salePrice ?? body.salePrice ?? 0;
      const durationMinutes = body.durationMinutes ?? body.duration_minutes ?? 0;
      const internalCode = body.internalCode ?? body.internalCode;
      const reference = body.reference ?? body.reference;
      const description = body.description ?? body.description;

      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'O nome do serviço é obrigatório.' });
      }
      if (!categoryId) {
        return res.status(400).json({ error: 'A categoria do serviço é obrigatória.' });
      }

      const id = await createService({
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        categoryId: String(categoryId),
        salePrice: Number(salePrice) || 0,
        internalCode: internalCode ? String(internalCode).trim() : null,
        reference: reference ? String(reference).trim() : null,
        durationMinutes: Number(durationMinutes) || 0,
      }, ctx);
      const service = await getService(id, ctx);
      return res.status(201).json(service ?? { id });
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao criar serviço.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const id = String(req.query.id ?? req.body?.id);
      const body = req.body ?? {};
      if (!id) return res.status(400).json({ error: 'ID do serviço é obrigatório.' });

      const existing = await getService(id, ctx);
      if (!existing) return res.status(404).json({ error: 'Serviço não encontrado.' });

      const name = body.name ?? body.name ?? existing.name;
      const categoryId = body.categoryId ?? body.categoryId ?? existing.categoryId;
      const salePrice = body.salePrice ?? body.salePrice ?? existing.salePrice;
      const durationMinutes = body.durationMinutes ?? body.duration_minutes ?? existing.durationMinutes;
      const internalCode = body.internalCode ?? body.internalCode ?? existing.internalCode;
      const reference = body.reference ?? body.reference ?? existing.reference;
      const description = body.description ?? body.description ?? existing.description;

      if (!name || !categoryId) {
        return res.status(400).json({ error: 'Nome e categoria do serviço são obrigatórios.' });
      }

      await updateService(id, {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        categoryId: String(categoryId),
        salePrice: Number(salePrice) || 0,
        internalCode: internalCode ? String(internalCode).trim() : null,
        reference: reference ? String(reference).trim() : null,
        durationMinutes: Number(durationMinutes) || 0,
      }, ctx);
      return res.status(200).json(await getService(id, ctx));
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao atualizar serviço.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = String(req.query.id ?? req.body?.id);
      if (!id) return res.status(400).json({ error: 'ID do serviço é obrigatório.' });
      const existing = await getService(id, ctx);
      if (!existing) return res.status(404).json({ error: 'Serviço não encontrado.' });
      await deleteService(id, ctx);
      return res.status(200).json({ message: 'Serviço excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao excluir serviço.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
