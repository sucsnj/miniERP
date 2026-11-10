import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getItems,
  getItemById,
  insertItem,
  updateItem,
  deleteItem,
  toggleItemStatus,
  checkDuplicateInternalCode,
  checkDuplicateBarcode,
} from '../../database/produtosDb';
import { parseNumber } from '../../utils/number';

interface UnitPayload {
  unidade_medida_id: number;
  multiplicador_unidade: number;
  principal: number;
}

interface BarcodePayload {
  codigo_barras: string;
  principal: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, categoria_id, marca_id, fornecedor_id, preco_venda, ativo, page, pageSize } = req.query;

      const parsedOptions: {
        search?: string;
        categoria_id?: number;
        marca_id?: number;
        fornecedor_id?: number;
        preco_venda?: number;
        ativo?: number;
        page?: number;
        pageSize?: number;
      } = {
        search: search ? String(search) : undefined,
        categoria_id: categoria_id ? Number(categoria_id) : undefined,
        marca_id: marca_id ? Number(marca_id) : undefined,
        fornecedor_id: fornecedor_id ? Number(fornecedor_id) : undefined,
        preco_venda: preco_venda ? Number(preco_venda) : undefined,
        ativo: ativo !== undefined && ativo !== 'TODOS' ? (ativo === 'ATIVO' ? 1 : 0) : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10,
      };

      const result = getItems(parsedOptions);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return res.status(500).json({ error: 'Erro ao carregar lista de produtos e serviços.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        action,
        id,
        ativo,
        tipo: itemType,
        nome: name,
        descricao: description,
        categoria_id,
        unidade_medida_id,
        marca_id,
        fornecedor_id,
        preco_compra: purchasePriceInput,
        margem_lucro: profitMarginInput,
        preco_venda: salePriceInput,
        estoque: stockInput,
        multiplicador_unidade: multiplierInput,
        codigo_interno: internalCode,
        referencia: reference,
        codigos_barras: barcodesInput,
        unidades_medida: unitsInput,
      } = req.body;

      // Altera status de ativo/inativo
      if (action === 'toggle-status') {
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório para alterar status.' });
        }
        if (ativo === undefined || (ativo !== 0 && ativo !== 1)) {
          return res.status(400).json({ error: 'Valor de status ativo (0 ou 1) é inválido.' });
        }
        
        const existing = getItemById(id);
        if (!existing) {
          return res.status(404).json({ error: 'Item não encontrado.' });
        }

        toggleItemStatus(id, ativo);
        return res.status(200).json({ message: `Item ${ativo === 1 ? 'ativado' : 'desativado'} com sucesso.` });
      }

      // Validação do cadastro básico
      if (itemType !== 'PRODUTO') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }
      if (!categoria_id || isNaN(Number(categoria_id))) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }
      // Validação de unidades de medida
      let unitList: UnitPayload[] = [];
      if (itemType === 'PRODUTO') {
        if (unitsInput && Array.isArray(unitsInput)) {
          unitList = unitsInput.map((u: UnitPayload) => ({
            unidade_medida_id: Number(u.unidade_medida_id),
            multiplicador_unidade: parseNumber(u.multiplicador_unidade),
            principal: u.principal ? 1 : 0
          })).filter(u => !isNaN(u.unidade_medida_id) && u.unidade_medida_id > 0);

          if (unitList.length === 0) {
            return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
          }

          const uIds = unitList.map(u => u.unidade_medida_id);
          const duplicateUnits = uIds.filter((item, index) => uIds.indexOf(item) !== index);
          if (duplicateUnits.length > 0) {
            return res.status(400).json({ error: 'Há unidades de medida duplicadas no formulário.' });
          }

          const mainUnitCount = unitList.filter(u => u.principal === 1).length;
          if (mainUnitCount === 0) {
            unitList[0].principal = 1;
          } else if (mainUnitCount > 1) {
            let found = false;
            for (const u of unitList) {
              if (u.principal === 1) {
                if (!found) found = true;
                else u.principal = 0;
              }
            }
          }
        } else {
          if (!unidade_medida_id || isNaN(Number(unidade_medida_id))) {
            return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
          }
        }
      }
      if (!marca_id || isNaN(Number(marca_id))) {
        return res.status(400).json({ error: 'Selecione uma marca válida.' });
      }

      if (!fornecedor_id || isNaN(Number(fornecedor_id))) {
        return res.status(400).json({ error: 'Selecione um fornecedor válido.' });
      }

      // Validação de código interno duplicado
      if (internalCode && checkDuplicateInternalCode(internalCode)) {
        return res.status(400).json({ error: `O código interno "${internalCode}" já está cadastrado.` });
      }

      // Validação de códigos de barras
      let listBarcodes: BarcodePayload[] = [];
      if (barcodesInput && Array.isArray(barcodesInput)) {
        listBarcodes = barcodesInput
          .map((cb: BarcodePayload) => ({
            codigo_barras: cb.codigo_barras ? String(cb.codigo_barras).trim() : '',
            principal: cb.principal ? 1 : 0
          }))
          .filter((cb) => cb.codigo_barras.length > 0);

        const codes = listBarcodes.map(c => c.codigo_barras);
        const duplicatesInInput = codes.filter((item, index) => codes.indexOf(item) !== index);
        if (duplicatesInInput.length > 0) {
          return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${duplicatesInInput.join(', ')}` });
        }

        if (listBarcodes.length > 0) {
          const countPrincipal = listBarcodes.filter(c => c.principal === 1).length;
          if (countPrincipal === 0) {
            listBarcodes[0].principal = 1;
          } else if (countPrincipal > 1) {
            let found = false;
            for (const cb of listBarcodes) {
              if (cb.principal === 1) {
                if (!found) found = true;
                else cb.principal = 0;
              }
            }
          }

          const dbDuplicate = checkDuplicateBarcode(codes);
          if (dbDuplicate) {
            return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
          }
        }
      }

      const purchasePriceRaw = parseNumber(purchasePriceInput);
      const profitMarginRaw = parseNumber(profitMarginInput);
      const salePriceRaw = parseNumber(salePriceInput);
      const stockRaw = parseNumber(stockInput);
      const multiplierRaw = parseNumber(multiplierInput);

      const purchasePrice = Number.isFinite(purchasePriceRaw) ? purchasePriceRaw : 0;
      const profitMargin = Number.isFinite(profitMarginRaw) ? profitMarginRaw : 0;
      const salePrice = Number.isFinite(salePriceRaw) ? salePriceRaw : 0;
      const stock = Number.isFinite(stockRaw) ? stockRaw : 0;
      const multiplier = Number.isFinite(multiplierRaw) && multiplierRaw > 0 ? multiplierRaw : 1;

      const mainUnit = unitList.length > 0 ? unitList.find(u => u.principal === 1) : null;
      const finalUnitId = mainUnit ? mainUnit.unidade_medida_id : Number(unidade_medida_id);
      const finalMultiplier = mainUnit ? mainUnit.multiplicador_unidade : multiplier;

      const itemId = insertItem({
        tipo: itemType,
        nome: name.trim(),        descricao: description,
        categoria_id: Number(categoria_id),
        unidade_medida_id: itemType === 'PRODUTO' ? finalUnitId : 21,
        marca_id: Number(marca_id),
        fornecedor_id: Number(fornecedor_id),
        preco_compra: purchasePrice,
        margem_lucro: profitMargin,
        preco_venda: salePrice,
        estoque: stock,
        multiplicador_unidade: finalMultiplier,
        codigo_interno: internalCode || undefined,
        referencia: reference || undefined,
        ativo: ativo !== undefined ? Number(ativo) : 1,
        codigos_barras: listBarcodes,
        unidades_medida: unitList,
      });

      return res.status(201).json({ id: itemId, message: 'Item cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar item.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        id,
        tipo: itemType,
        nome: name,
        descricao: description,
        categoria_id,
        unidade_medida_id,
        marca_id,
        fornecedor_id,
        preco_compra: purchasePriceInput,
        margem_lucro: profitMarginInput,
        preco_venda: salePriceInput,
        estoque: stockInput,
        multiplicador_unidade: multiplierInput,
        codigo_interno: internalCode,
        referencia: reference,
        ativo,
        codigos_barras: barcodesInput,
        unidades_medida: unitsInput,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'O ID do item é obrigatório para atualização.' });
      }

      const existing = getItemById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      // Validação do cadastro básico
      if (itemType !== 'PRODUTO') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }
      if (!categoria_id || isNaN(Number(categoria_id))) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }
      // Validação de unidades de medida
      let unitList: UnitPayload[] = [];
      if (itemType === 'PRODUTO') {
        if (unitsInput && Array.isArray(unitsInput)) {
          unitList = unitsInput.map((u: UnitPayload) => ({
            unidade_medida_id: Number(u.unidade_medida_id),
            multiplicador_unidade: parseNumber(u.multiplicador_unidade),
            principal: u.principal ? 1 : 0
          })).filter(u => !isNaN(u.unidade_medida_id) && u.unidade_medida_id > 0);

          if (unitList.length === 0) {
            return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
          }

          const uIds = unitList.map(u => u.unidade_medida_id);
          const duplicateUnits = uIds.filter((item, index) => uIds.indexOf(item) !== index);
          if (duplicateUnits.length > 0) {
            return res.status(400).json({ error: 'Há unidades de medida duplicadas no formulário.' });
          }

          const mainUnitCount = unitList.filter(u => u.principal === 1).length;
          if (mainUnitCount === 0) {
            unitList[0].principal = 1;
          } else if (mainUnitCount > 1) {
            let found = false;
            for (const u of unitList) {
              if (u.principal === 1) {
                if (!found) found = true;
                else u.principal = 0;
              }
            }
          }
        } else {
          if (!unidade_medida_id || isNaN(Number(unidade_medida_id))) {
            return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
          }
        }
      }
      if (!marca_id || isNaN(Number(marca_id))) {
        return res.status(400).json({ error: 'Selecione uma marca válida.' });
      }

      if (!fornecedor_id || isNaN(Number(fornecedor_id))) {
        return res.status(400).json({ error: 'Selecione um fornecedor válido.' });
      }

      const purchasePriceRaw = parseNumber(purchasePriceInput);
      const profitMarginRaw = parseNumber(profitMarginInput);
      const salePriceRaw = parseNumber(salePriceInput);
      const stockRaw = parseNumber(stockInput);
      const multiplierRaw = parseNumber(multiplierInput);

      const purchasePrice = Number.isFinite(purchasePriceRaw) ? purchasePriceRaw : 0;
      const profitMargin = Number.isFinite(profitMarginRaw) ? profitMarginRaw : 0;
      const salePrice = Number.isFinite(salePriceRaw) ? salePriceRaw : 0;
      const stock = Number.isFinite(stockRaw) ? stockRaw : 0;
      const multiplier = Number.isFinite(multiplierRaw) && multiplierRaw > 0 ? multiplierRaw : 1;

      // Validação de código interno: não pode ser alterado
      if (internalCode && existing.codigo_interno && internalCode.trim() !== existing.codigo_interno) {
        return res.status(400).json({ error: 'O código interno não pode ser alterado.' });
      }

      // Validação de códigos de barras
      let listBarcodes: BarcodePayload[] = [];
      if (barcodesInput && Array.isArray(barcodesInput)) {
        listBarcodes = barcodesInput
          .map((cb: BarcodePayload) => ({
            codigo_barras: cb.codigo_barras ? String(cb.codigo_barras).trim() : '',
            principal: cb.principal ? 1 : 0
          }))
          .filter((cb) => cb.codigo_barras.length > 0);

        const codes = listBarcodes.map(c => c.codigo_barras);
        const duplicatesInInput = codes.filter((item, index) => codes.indexOf(item) !== index);
        if (duplicatesInInput.length > 0) {
          return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${duplicatesInInput.join(', ')}` });
        }

        if (listBarcodes.length > 0) {
          const countPrincipal = listBarcodes.filter(c => c.principal === 1).length;
          if (countPrincipal === 0) {
            listBarcodes[0].principal = 1;
          } else if (countPrincipal > 1) {
            let found = false;
            for (const cb of listBarcodes) {
              if (cb.principal === 1) {
                if (!found) found = true;
                else cb.principal = 0;
              }
            }
          }

          const dbDuplicate = checkDuplicateBarcode(codes, id);
          if (dbDuplicate) {
            return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
          }
        }
      }

      const mainUnit = unitList.length > 0 ? unitList.find(u => u.principal === 1) : null;
      const finalUnitId = mainUnit ? mainUnit.unidade_medida_id : Number(unidade_medida_id);
      const finalMultiplier = mainUnit ? mainUnit.multiplicador_unidade : multiplier;

      updateItem(id, {
        tipo: itemType,
        nome: name.trim(),        descricao: description,
        categoria_id: Number(categoria_id),
        unidade_medida_id: finalUnitId,
        marca_id: Number(marca_id),
        fornecedor_id: Number(fornecedor_id),
        preco_compra: purchasePrice,
        margem_lucro: profitMargin,
        preco_venda: salePrice,
        estoque: stock,
        multiplicador_unidade: finalMultiplier,
        codigo_interno: internalCode || undefined,
        referencia: reference || undefined,
        ativo: ativo !== undefined ? Number(ativo) : 1,
        codigos_barras: listBarcodes,
        unidades_medida: unitList,
      });

      return res.status(200).json({ message: 'Item atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar item.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório para exclusão.' });
      }

      const existing = getItemById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      deleteItem(id);
      return res.status(200).json({ message: 'Item excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir item.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
