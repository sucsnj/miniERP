import type { NextApiRequest, NextApiResponse } from 'next';
import { insertDailySale, getDailySales, updateDailySale, getDailySaleById, deleteDailySale, insertVendaItens, deleteVendaItens } from '../../database/db';
import { parseCurrency } from '../../utils/number';
import { toDate } from '../../utils/date';
import { canEdit } from '../../utils/edit';

interface ItemVendaApi {
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
    const { data, valor, observacoes, criado_em, itens } = req.body;
    try {
      // Validar data e valor
      const validDate = toDate(data);
      const validValue = typeof valor === 'number' ? valor : parseCurrency(String(valor));
      if (!validDate || validValue == null) {
        return res.status(400).json({ error: 'Dados inválidos: data ou valor inválidos' });
      }

      let result;
      if (!criado_em) {
        result = insertDailySale(data, validValue, observacoes);
      } else {
        result = insertDailySale(data, validValue, observacoes, criado_em);
      }

      if (itens && Array.isArray(itens) && itens.length > 0 && result.lastInsertRowid) {
        insertVendaItens(
          Number(result.lastInsertRowid),
          itens.map((item: ItemVendaApi) => ({
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
      }

      res.status(200).json({ message: 'Venda registrada com sucesso', id: result.lastInsertRowid });
    } catch (error) {
      console.error('Erro na API POST /api/vendas:', error);
      res.status(500).json({ error: 'Erro ao registrar venda', details: String(error) });
    }
  } else if (req.method === 'PUT') {
    const { id, data, valor, observacoes, itens } = req.body;
    const validDate = toDate(data);
    const validValue = typeof valor === 'number' ? valor : parseCurrency(String(valor));
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

      updateDailySale(id, data, validValue, observacoes);

      // Substitui os itens: remove os existentes e insere os novos
      deleteVendaItens(id);
      if (itens && Array.isArray(itens) && itens.length > 0) {
        insertVendaItens(
          Number(id),
          itens.map((item: ItemVendaApi) => ({
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
    const { mes, ano, filtro } = req.query;
    try {
      // validação do filtro
      const filtroValido = ['positivas', 'negativas', 'todas'].includes(filtro as string)
        ? (filtro as 'positivas' | 'negativas' | 'todas')
        : 'todas';

      const sales = getDailySales(
        parseInt(mes as string),
        parseInt(ano as string),
        filtroValido
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
