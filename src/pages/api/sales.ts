import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listDailySales,
  getDailySaleById,
  createSale,
  updateSale,
  deleteSale,
} from '../../database/salesRepository';
import { parseCurrency } from '../../utils/number';
import { toDate } from '../../utils/date';
import { canEdit } from '../../utils/edit';

interface SaleItemApi {
  kind?: 'PRODUCT' | 'SERVICE';
  productId?: string | null;
  serviceId?: string | null;
  item_id?: number | string | null;
  id?: number | string | null;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  salePrice?: number;
  subtotal?: number;
  internalCode?: string | null;
  reference?: string | null;
}

function normalizeItem(item: SaleItemApi): {
  kind: 'PRODUCT' | 'SERVICE';
  productId: string | null;
  serviceId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  internalCode: string | null;
  reference: string | null;
} {
  const kindSource = (item.kind ?? item.kind ?? 'PRODUCT').toString().toUpperCase();
  const kind = kindSource === 'SERVICE' || kindSource === 'SERVICE' ? 'SERVICE' : 'PRODUCT';
  const quantity = Number(item.quantity ?? item.quantity ?? 0);
  const unitPrice = Number(item.unitPrice ?? item.unitPrice ?? item.salePrice ?? 0);
  const productId = item.productId ?? item.item_id ?? item.id ?? null;
  const serviceId = item.serviceId ?? null;
  return {
    kind,
    productId: kind === 'PRODUCT' && productId !== null ? String(productId) : null,
    serviceId: kind === 'SERVICE' && serviceId !== null ? String(serviceId) : null,
    name: String(item.name ?? item.name ?? ''),
    quantity,
    unitPrice,
    subtotal: item.subtotal ?? unitPrice * quantity,
    internalCode: item.internalCode ?? item.internalCode ?? null,
    reference: item.reference ?? item.reference ?? null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = req.body ?? {};
    const date = body.saleDate ?? body.date;
    const amount = body.amount ?? body.amount;
    const notes = body.notes ?? body.notes;
    const createdAt = body.createdAt ?? body.createdAt;
    const items = Array.isArray(body.items ?? body.itens) ? (body.items ?? body.itens) : [];

     try {
      const timezone = req.cookies?.timezone || 'America/Recife';
      const validDate = toDate(date, timezone);
      const validValue = typeof amount === 'number' ? amount : parseCurrency(String(amount));
      if (!validDate || validValue == null) {
        return res.status(400).json({ error: 'Dados inválidos: data ou valor inválidos' });
      }

      const id = await createSale({
        saleDate: date,
        amount: validValue,
        notes: notes ?? null,
        createdAt: createdAt ?? null,
        items: items.map(normalizeItem),
      });

      res.status(200).json({ message: 'Venda registrada com sucesso', id });
    } catch (error) {
      console.error('Erro na API POST /api/sales:', error);
      res.status(500).json({ error: 'Erro ao registrar venda', details: String(error) });
    }
  } else if (req.method === 'PUT') {
    const body = req.body ?? {};
    const id = body.id;
    const date = body.saleDate ?? body.date;
    const amount = body.amount ?? body.amount;
    const notes = body.notes ?? body.notes;
    const items = Array.isArray(body.items ?? body.itens) ? (body.items ?? body.itens) : [];

    const timezone = req.cookies?.timezone || 'America/Recife';
    const validDate = toDate(date, timezone);
    const validValue = typeof amount === 'number' ? amount : parseCurrency(String(amount));
    if (!id || !validDate || validValue == null) {
      return res.status(400).json({ error: 'Dados inválidos para atualização' });
    }

    try {
      const originalSale = await getDailySaleById(String(id));
      if (!originalSale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!canEdit(originalSale.saleDate)) {
        return res.status(403).json({ error: 'Atualização permitida apenas para vendas dos últimos 2 dias' });
      }

      await updateSale({
        id: String(id),
        saleDate: date,
        amount: validValue,
        notes: notes ?? null,
        items: items.map(normalizeItem),
      });

      res.status(200).json({ message: 'Venda atualizada com sucesso' });
    } catch (error) {
      console.error('Erro na API PUT /api/sales:', error);
      res.status(500).json({ error: 'Erro ao atualizar venda', details: String(error) });
    }
  } else if (req.method === 'DELETE') {
    const body = req.body ?? {};
    const id = body.id;
    if (!id) {
      return res.status(400).json({ error: 'ID da venda é obrigatório para exclusão' });
    }

    try {
      const originalSale = await getDailySaleById(String(id));
      if (!originalSale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!canEdit(originalSale.saleDate)) {
        return res.status(403).json({ error: 'Exclusão permitida apenas para vendas dos últimos 2 dias' });
      }

      await deleteSale(String(id));
      res.status(200).json({ message: 'Venda excluída com sucesso' });
    } catch (error) {
      console.error('Erro na API DELETE /api/sales:', error);
      res.status(500).json({ error: 'Erro ao excluir venda', details: String(error) });
    }
  } else if (req.method === 'GET') {
    const { month: monthParam, year: yearParam, filtro: filter } = req.query;
    try {
      const validFilter = ['positivas', 'negativas', 'todas'].includes(filter as string)
        ? (filter as 'positivas' | 'negativas' | 'todas')
        : 'todas';

      const sales = await listDailySales(
        parseInt(monthParam as string),
        parseInt(yearParam as string),
        validFilter
      );
      res.status(200).json(sales);
    } catch (error) {
      console.error('Erro na API GET /api/sales:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas', details: String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
