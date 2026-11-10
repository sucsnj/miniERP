import type { NextApiRequest, NextApiResponse } from 'next';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  checkDuplicateInternalCode,
  checkDuplicateBarcode,
} from '../../database/productsRepository';
import { parseNumber } from '../../utils/number';

interface UnitPayload {
  unidade_medida_id?: number | string;
  unitId?: string;
  unit_id?: string;
  multiplicador_unidade?: number | string;
  unitMultiplier?: number | string;
  principal?: number | boolean;
  isPrimary?: boolean;
}

interface BarcodePayload {
  codigo_barras?: string;
  barcode?: string;
  principal?: number | boolean;
  isPrimary?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, categoria_id, categoryId, marca_id, brandId, fornecedor_id, supplierId, ativo, page, pageSize } = req.query;

      const activeParam = ativo !== undefined && ativo !== 'TODOS' ? (ativo === 'ATIVO' ? true : ativo === 'INATIVO' ? false : null) : null;

      const result = await listProducts({
        search: search ? String(search) : undefined,
        categoryId: (categoryId ?? categoria_id) ? String(categoryId ?? categoria_id) : undefined,
        brandId: (brandId ?? marca_id) ? String(brandId ?? marca_id) : undefined,
        supplierId: (supplierId ?? fornecedor_id) ? String(supplierId ?? fornecedor_id) : undefined,
        active: activeParam,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return res.status(500).json({ error: 'Erro ao carregar lista de produtos e serviços.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      const action = body.action;

      if (action === 'toggle-status') {
        const id = body.id;
        const ativo = body.ativo;
        if (!id) return res.status(400).json({ error: 'ID é obrigatório para alterar status.' });
        const active = ativo === 1 || ativo === true || ativo === '1';
        await toggleProductStatus(String(id), active);
        return res.status(200).json({ message: `Item ${active ? 'ativado' : 'desativado'} com sucesso.` });
      }

      const itemType = body.tipo ?? body.type ?? 'PRODUTO';
      if (itemType !== 'PRODUTO' && itemType !== 'PRODUCT') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }

      const name = body.nome ?? body.name;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }

      const categoryId = body.categoria_id ?? body.categoryId ?? body.category_id;
      if (!categoryId) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }

      const brandId = body.marca_id ?? body.brandId ?? body.brand_id;
      const supplierId = body.fornecedor_id ?? body.supplierId ?? body.supplier_id;
      if (!brandId) return res.status(400).json({ error: 'Selecione uma marca válida.' });
      if (!supplierId) return res.status(400).json({ error: 'Selecione um fornecedor válido.' });

      const unitsInput: UnitPayload[] = Array.isArray(body.unidades_medida ?? body.units)
        ? (body.unidades_medida ?? body.units)
        : [];
      let unitList = unitsInput
        .map((u) => ({
          unitId: String(u.unitId ?? u.unit_id ?? u.unidade_medida_id ?? ''),
          unitMultiplier: parseNumber(u.unitMultiplier ?? u.multiplicador_unidade),
          isPrimary: u.isPrimary === true || u.principal === 1 || u.principal === true,
        }))
        .filter((u) => u.unitId !== '');

      if (unitsInput.length > 0 && unitList.length === 0) {
        return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
      }

      if (unitList.length === 0) {
        const unitId = body.unidade_medida_id ?? body.baseUnitId ?? body.base_unit_id;
        if (!unitId) return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
        unitList = [{ unitId: String(unitId), unitMultiplier: parseNumber(body.multiplicador_unidade ?? body.unitMultiplier ?? body.unit_multiplier ?? 1), isPrimary: true }];
      }

      const unitIds = unitList.map((u) => u.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        return res.status(400).json({ error: 'Há unidades de medida duplicadas no formulário.' });
      }

      let mainUnit = unitList.find((u) => u.isPrimary);
      if (!mainUnit) {
        unitList[0].isPrimary = true;
        mainUnit = unitList[0];
      } else {
        let found = false;
        for (const u of unitList) {
          if (u.isPrimary) {
            if (!found) found = true;
            else u.isPrimary = false;
          }
        }
      }

      const barcodesInput: BarcodePayload[] = Array.isArray(body.codigos_barras ?? body.barcodes)
        ? (body.codigos_barras ?? body.barcodes)
        : [];
      const listBarcodes = barcodesInput
        .map((cb) => ({
          barcode: String(cb.barcode ?? cb.codigo_barras ?? '').trim(),
          isPrimary: cb.isPrimary === true || cb.principal === 1 || cb.principal === true,
        }))
        .filter((cb) => cb.barcode.length > 0);

      const codes = listBarcodes.map((c) => c.barcode);
      if (new Set(codes).size !== codes.length) {
        return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${codes.filter((item, index) => codes.indexOf(item) !== index).join(', ')}` });
      }

      if (listBarcodes.length > 0) {
        let found = false;
        const principalCount = listBarcodes.filter((c) => c.isPrimary).length;
        if (principalCount === 0) {
          listBarcodes[0].isPrimary = true;
        } else if (principalCount > 1) {
          for (const cb of listBarcodes) {
            if (cb.isPrimary) {
              if (!found) found = true;
              else cb.isPrimary = false;
            }
          }
        }

        const dbDuplicate = await checkDuplicateBarcode(codes);
        if (dbDuplicate) {
          return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
        }
      }

      const internalCode = body.codigo_interno ?? body.internalCode ?? body.internal_code;
      if (internalCode && await checkDuplicateInternalCode(String(internalCode))) {
        return res.status(400).json({ error: `O código interno "${internalCode}" já está cadastrado.` });
      }

      const purchasePrice = parseNumber(body.preco_compra ?? body.purchasePrice ?? body.purchase_price);
      const profitMargin = parseNumber(body.margem_lucro ?? body.profitMargin ?? body.profit_margin);
      const salePrice = parseNumber(body.preco_venda ?? body.salePrice ?? body.sale_price);
      const stock = parseNumber(body.estoque ?? body.stock);
      const multiplier = parseNumber(body.multiplicador_unidade ?? body.unitMultiplier ?? body.unit_multiplier);

      const finalUnitId = mainUnit ? mainUnit.unitId : String(body.unidade_medida_id ?? body.baseUnitId ?? body.base_unit_id);
      const finalMultiplier = mainUnit ? mainUnit.unitMultiplier : (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1);

      const id = await createProduct({
        name: String(name).trim(),
        description: body.descricao ?? body.description ?? null,
        categoryId: String(categoryId),
        baseUnitId: finalUnitId,
        brandId: String(brandId),
        supplierId: String(supplierId),
        purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
        profitMargin: Number.isFinite(profitMargin) ? profitMargin : 0,
        salePrice: Number.isFinite(salePrice) ? salePrice : 0,
        stock: Number.isFinite(stock) ? stock : 0,
        unitMultiplier: Number.isFinite(finalMultiplier) && finalMultiplier > 0 ? finalMultiplier : 1,
        internalCode: internalCode ? String(internalCode).trim() : null,
        reference: body.referencia ?? body.reference ?? null,
        active: body.ativo !== undefined ? (body.ativo === 1 || body.ativo === true) : true,
        barcodes: listBarcodes,
        units: unitList.map((u) => ({ unitId: u.unitId, unitMultiplier: u.unitMultiplier, isPrimary: u.isPrimary })),
      });

      return res.status(201).json({ id, message: 'Item cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar item.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body ?? {};
      const id = body.id;
      if (!id) return res.status(400).json({ error: 'O ID do item é obrigatório para atualização.' });

      const existing = await getProduct(String(id));
      if (!existing) return res.status(404).json({ error: 'Item não encontrado.' });

      const itemType = body.tipo ?? body.type ?? 'PRODUTO';
      if (itemType !== 'PRODUTO' && itemType !== 'PRODUCT') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }

      const name = body.nome ?? body.name;
      if (!name || !String(name).trim()) return res.status(400).json({ error: 'O nome é obrigatório.' });

      const categoryId = body.categoria_id ?? body.categoryId ?? body.category_id;
      if (!categoryId) return res.status(400).json({ error: 'Selecione uma categoria válida.' });

      const brandId = body.marca_id ?? body.brandId ?? body.brand_id;
      const supplierId = body.fornecedor_id ?? body.supplierId ?? body.supplier_id;
      if (!brandId) return res.status(400).json({ error: 'Selecione uma marca válida.' });
      if (!supplierId) return res.status(400).json({ error: 'Selecione um fornecedor válido.' });

      const unitsInput: UnitPayload[] = Array.isArray(body.unidades_medida ?? body.units)
        ? (body.unidades_medida ?? body.units)
        : [];
      let unitList = unitsInput
        .map((u) => ({
          unitId: String(u.unitId ?? u.unit_id ?? u.unidade_medida_id ?? ''),
          unitMultiplier: parseNumber(u.unitMultiplier ?? u.multiplicador_unidade),
          isPrimary: u.isPrimary === true || u.principal === 1 || u.principal === true,
        }))
        .filter((u) => u.unitId !== '');

      if (unitsInput.length > 0 && unitList.length === 0) {
        return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
      }

      if (unitList.length === 0) {
        const unitId = body.unidade_medida_id ?? body.baseUnitId ?? body.base_unit_id ?? existing.baseUnitId;
        unitList = [{ unitId: String(unitId), unitMultiplier: parseNumber(body.multiplicador_unidade ?? body.unitMultiplier ?? body.unit_multiplier ?? existing.unitMultiplier), isPrimary: true }];
      }

      const unitIds = unitList.map((u) => u.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        return res.status(400).json({ error: 'Há unidades de medida duplicadas no formulário.' });
      }

      let mainUnit = unitList.find((u) => u.isPrimary);
      if (!mainUnit) {
        unitList[0].isPrimary = true;
        mainUnit = unitList[0];
      } else {
        let found = false;
        for (const u of unitList) {
          if (u.isPrimary) {
            if (!found) found = true;
            else u.isPrimary = false;
          }
        }
      }

      const barcodesInput: BarcodePayload[] = Array.isArray(body.codigos_barras ?? body.barcodes)
        ? (body.codigos_barras ?? body.barcodes)
        : [];
      const listBarcodes = barcodesInput
        .map((cb) => ({
          barcode: String(cb.barcode ?? cb.codigo_barras ?? '').trim(),
          isPrimary: cb.isPrimary === true || cb.principal === 1 || cb.principal === true,
        }))
        .filter((cb) => cb.barcode.length > 0);

      const codes = listBarcodes.map((c) => c.barcode);
      if (new Set(codes).size !== codes.length) {
        return res.status(400).json({ error: `Há códigos de barras duplicados no formulário: ${codes.filter((item, index) => codes.indexOf(item) !== index).join(', ')}` });
      }

      if (listBarcodes.length > 0) {
        let found = false;
        const principalCount = listBarcodes.filter((c) => c.isPrimary).length;
        if (principalCount === 0) {
          listBarcodes[0].isPrimary = true;
        } else if (principalCount > 1) {
          for (const cb of listBarcodes) {
            if (cb.isPrimary) {
              if (!found) found = true;
              else cb.isPrimary = false;
            }
          }
        }

        const dbDuplicate = await checkDuplicateBarcode(codes, String(id));
        if (dbDuplicate) {
          return res.status(400).json({ error: `O código de barras "${dbDuplicate}" já está cadastrado em outro produto.` });
        }
      }

      const internalCode = body.codigo_interno ?? body.internalCode ?? body.internal_code ?? existing.internalCode;
      if (internalCode && existing.internalCode && String(internalCode).trim() !== existing.internalCode) {
        return res.status(400).json({ error: 'O código interno não pode ser alterado.' });
      }

      const purchasePrice = parseNumber(body.preco_compra ?? body.purchasePrice ?? body.purchase_price ?? existing.purchasePrice);
      const profitMargin = parseNumber(body.margem_lucro ?? body.profitMargin ?? body.profit_margin ?? existing.profitMargin);
      const salePrice = parseNumber(body.preco_venda ?? body.salePrice ?? body.sale_price ?? existing.salePrice);
      const stock = parseNumber(body.estoque ?? body.stock ?? existing.stock);
      const multiplier = parseNumber(body.multiplicador_unidade ?? body.unitMultiplier ?? body.unit_multiplier ?? existing.unitMultiplier);

      const finalUnitId = (unitList.find((u) => u.isPrimary)?.unitId) ?? existing.baseUnitId;
      const finalMultiplier = (unitList.find((u) => u.isPrimary)?.unitMultiplier) ?? (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : existing.unitMultiplier);

      await updateProduct(String(id), {
        name: String(name).trim(),
        description: body.descricao ?? body.description ?? existing.description,
        categoryId: String(categoryId),
        baseUnitId: finalUnitId,
        brandId: String(brandId),
        supplierId: String(supplierId),
        purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : existing.purchasePrice,
        profitMargin: Number.isFinite(profitMargin) ? profitMargin : existing.profitMargin,
        salePrice: Number.isFinite(salePrice) ? salePrice : existing.salePrice,
        stock: Number.isFinite(stock) ? stock : existing.stock,
        unitMultiplier: Number.isFinite(finalMultiplier) && finalMultiplier > 0 ? finalMultiplier : existing.unitMultiplier,
        internalCode: internalCode ? String(internalCode).trim() : existing.internalCode,
        reference: body.referencia ?? body.reference ?? existing.reference,
        active: body.ativo !== undefined ? (body.ativo === 1 || body.ativo === true) : existing.active,
        barcodes: listBarcodes,
        units: unitList.length > 0 ? unitList.map((u) => ({ unitId: u.unitId, unitMultiplier: u.unitMultiplier, isPrimary: u.isPrimary })) : [{ unitId: finalUnitId, unitMultiplier: finalMultiplier, isPrimary: true }],
      });

      return res.status(200).json({ message: 'Item atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar item.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = req.body ?? {};
      const id = body.id;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório para exclusão.' });
      const existing = await getProduct(String(id));
      if (!existing) return res.status(404).json({ error: 'Item não encontrado.' });
      await deleteProduct(String(id));
      return res.status(200).json({ message: 'Item excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir item.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
