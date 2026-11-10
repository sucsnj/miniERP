import type { NextApiRequest, NextApiResponse } from 'next';
import { insertDailySale, getDailySales, updateDailySale, getDailySaleById, deleteDailySale, insertSaleItems, deleteSaleItems, getSaleItems } from '../../database/db';
import { applySaleStockMovement, applyStockAdjustments } from '../../database/produtosDb';
import { getSaleStockAdjustments } from '../../utils/stock';
import { parseCurrency } from '../../utils/number';
import { toDate } from '../../utils/date';
import { canEdit } from '../../utils/edit';

interface SaleItemApi {
  id?: number;
  item_id?: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  quantidade: number;
  preco_venda?: number;
  preco_unitario?: number;
  codigo_interno?: string | null;
  referencia?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data, valor: amount, observacoes: notes, criado_em: createdAt, itens: items } = req.body;
    try {
      // Validar data e valor
      const validDate = toDate(data);
      const validValue = typeof amount === 'number' ? amount : parseCurrency(String(amount));
      if (!validDate || validValue == null) {
        return res.status(400).json({ error: 'Dados inválidos: data ou valor inválidos' });
      }

      let result;
      if (!createdAt) {
        result = insertDailySale(data, validValue, notes);
      } else {
        result = insertDailySale(data, validValue, notes, createdAt);
      }

      const saleId = Number(result.lastInsertRowid);

      if (items && Array.isArray(items) && items.length > 0 && saleId) {
        insertSaleItems(
          saleId,
          items.map((item: SaleItemApi) => ({
            item_id: item.id,
            tipo: item.tipo,
            nome: item.nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco_venda ?? item.preco_unitario ?? 0,
            subtotal: (item.preco_venda ?? item.preco_unitario ?? 0) * item.quantidade,
            codigo_interno: item.codigo_interno ?? undefined,
            referencia: item.referencia ?? undefined,
          }))
        );

        try {
          applySaleStockMovement(
            saleId,
            items.map((item: SaleItemApi) => ({
              item_id: item.id,
              tipo: item.tipo,
              quantidade: item.quantidade,
            })),
            'SAIDA'
          );
        } catch (stockError) {
          deleteSaleItems(saleId);
          deleteDailySale(saleId);
          throw stockError;
        }
      }

      res.status(200).json({ message: 'Venda registrada com sucesso', id: saleId });
    } catch (error) {
      console.error('Erro na API POST /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao registrar venda', details: String(error) });
    }
  } else if (req.method === 'PUT') {
    const { id, data, valor: amount, observacoes: notes, itens: items } = req.body;
    const validDate = toDate(data);
    const validValue = typeof amount === 'number' ? amount : parseCurrency(String(amount));
    if (!id || !validDate || validValue == null) {
      return res.status(400).json({ error: 'Dados inválidos para atualização' });
    }

    try {
      const originalSale = getDailySaleById(id) as { data?: string } | null;
      if (!originalSale || typeof originalSale.data !== 'string') {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!canEdit(originalSale.data)) {
        return res.status(403).json({ error: 'Atualização permitida apenas para vendas dos últimos 2 dias' });
      }

      const oldItems = getSaleItems(Number(id));

      updateDailySale(id, data, validValue, notes);

      // Substitui os itens: remove os existentes e insere os novos
      deleteSaleItems(id);
      if (items && Array.isArray(items) && items.length > 0) {
        insertSaleItems(
          Number(id),
          items.map((item: SaleItemApi) => ({
            item_id: item.item_id ?? item.id ?? undefined,
            tipo: item.tipo,
            nome: item.nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario ?? item.preco_venda ?? 0,
            subtotal: (item.preco_unitario ?? item.preco_venda ?? 0) * item.quantidade,
            codigo_interno: item.codigo_interno ?? undefined,
            referencia: item.referencia ?? undefined,
          }))
        );
      }

      const adjustments = getSaleStockAdjustments(
        oldItems.map((item) => ({
          item_id: item.item_id,
          tipo: item.tipo,
          quantidade: item.quantidade,
        })),
        (items && Array.isArray(items) ? items : []).map((item: SaleItemApi) => ({
          item_id: item.item_id ?? item.id ?? null,
          tipo: item.tipo,
          quantidade: item.quantidade,
        }))
      );

      if (adjustments.length > 0) {
        try {
          applyStockAdjustments(Number(id), adjustments);
        } catch (stockError) {
          throw stockError;
        }
      }

      res.status(200).json({ message: 'Venda atualizada com sucesso' });
    } catch (error) {
      console.error('Erro na API PUT /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao atualizar venda', details: String(error) });
    }

  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da venda é obrigatório para exclusão' });
    }

    try {
      const originalSale = getDailySaleById(id) as { data?: string } | null;
      if (!originalSale || typeof originalSale.data !== 'string') {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      if (!canEdit(originalSale.data)) {
        return res.status(403).json({ error: 'Exclusão permitida apenas para vendas dos últimos 2 dias' });
      }

      deleteDailySale(id);
      res.status(200).json({ message: 'Venda excluída com sucesso' });
    } catch (error) {
      console.error('Erro na API DELETE /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao excluir venda', details: String(error) });
    }
  } else if (req.method === 'GET') {
    const { mes: monthParam, ano: yearParam, filtro: filter } = req.query;
    try {
      // validação do filtro
      const validFilter = ['positivas', 'negativas', 'todas'].includes(filter as string)
        ? (filter as 'positivas' | 'negativas' | 'todas')
        : 'todas';

      const sales = getDailySales(
        parseInt(monthParam as string),
        parseInt(yearParam as string),
        validFilter
      );
      res.status(200).json(sales);
    } catch (error) {
      console.error('Erro na API GET /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas', details: String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
