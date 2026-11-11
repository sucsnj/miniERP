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
  unit_measure_id?: number | string;
  unitId?: string;
  unit_id?: string;
  unit_multiplier?: number | string;
  unitMultiplier?: number | string;
  mainBarcode?: number | boolean;
  isPrimary?: boolean;
}

interface BarcodePayload {
  barcodesData?: string;
  barcode?: string;
  mainBarcode?: number | boolean;
  isPrimary?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, categoryId, brandId, supplierId, active, page, pageSize } = req.query;

      const activeParam = active !== undefined && active !== 'TODOS' ? (active === 'ATIVO' ? true : active === 'INATIVO' ? false : null) : null;

      const result = await listProducts({
        search: search ? String(search) : undefined,
        categoryId: (categoryId ?? categoryId) ? String(categoryId ?? categoryId) : undefined,
        brandId: (brandId ?? brandId) ? String(brandId ?? brandId) : undefined,
        supplierId: (supplierId ?? supplierId) ? String(supplierId ?? supplierId) : undefined,
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
        const active = body.active;
        if (!id) return res.status(400).json({ error: 'ID é obrigatório para alterar status.' });
      const isActive = active === 1 || active === true || active === '1';
      await toggleProductStatus(String(id), isActive);
      return res.status(200).json({ message: `Item ${isActive ? 'ativado' : 'desativado'} com sucesso.` });
      }

      const itemType = body.kind ?? body.type ?? 'PRODUCT';
      if (itemType !== 'PRODUCT' && itemType !== 'PRODUCT') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }

      const name = body.name ?? body.name;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }

      const categoryId = body.categoryId ?? body.categoryId ?? body.category_id;
      if (!categoryId) {
        return res.status(400).json({ error: 'Selecione uma categoria válida.' });
      }

      const brandId = body.brandId ?? body.brandId ?? body.brand_id;
      const supplierId = body.supplierId ?? body.supplierId ?? body.supplier_id;
      if (!brandId) return res.status(400).json({ error: 'Selecione uma marca válida.' });
      if (!supplierId) return res.status(400).json({ error: 'Selecione um fornecedor válido.' });

      const unitsInput: UnitPayload[] = Array.isArray(body.units ?? body.units)
        ? (body.units ?? body.units)
        : [];
      let unitList = unitsInput
        .map((u) => ({
          unitId: String(u.unitId ?? u.unit_id ?? u.unit_measure_id ?? ''),
          unitMultiplier: parseNumber(u.unitMultiplier ?? u.unit_multiplier),
          isPrimary: u.isPrimary === true || u.mainBarcode === 1 || u.mainBarcode === true,
        }))
        .filter((u) => u.unitId !== '');

      if (unitsInput.length > 0 && unitList.length === 0) {
        return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
      }

      if (unitList.length === 0) {
        const unitId = body.unit_measure_id ?? body.baseUnitId ?? body.base_unit_id;
        if (!unitId) return res.status(400).json({ error: 'Selecione uma unidade de medida válida.' });
        unitList = [{ unitId: String(unitId), unitMultiplier: parseNumber(body.unit_multiplier ?? body.unitMultiplier ?? body.unit_multiplier ?? 1), isPrimary: true }];
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

      const barcodesInput: BarcodePayload[] = Array.isArray(body.barcodes ?? body.barcodes)
        ? (body.barcodes ?? body.barcodes)
        : [];
      const listBarcodes = barcodesInput
        .map((cb) => ({
          barcode: String(cb.barcode ?? cb.barcodesData ?? '').trim(),
          isPrimary: cb.isPrimary === true || cb.mainBarcode === 1 || cb.mainBarcode === true,
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

      const internalCode = body.internalCode ?? body.internalCode ?? body.internal_code;
      if (internalCode && await checkDuplicateInternalCode(String(internalCode))) {
        return res.status(400).json({ error: `O código interno "${internalCode}" já está cadastrado.` });
      }

      const purchasePrice = parseNumber(body.purchasePrice ?? body.purchasePrice ?? body.purchase_price);
      const profitMargin = parseNumber(body.profitMargin ?? body.profitMargin ?? body.profit_margin);
      const salePrice = parseNumber(body.salePrice ?? body.salePrice ?? body.sale_price);
      const stock = parseNumber(body.stock ?? body.stock);
      const multiplier = parseNumber(body.unit_multiplier ?? body.unitMultiplier ?? body.unit_multiplier);

      const finalUnitId = mainUnit ? mainUnit.unitId : String(body.unit_measure_id ?? body.baseUnitId ?? body.base_unit_id);
      const finalMultiplier = mainUnit ? mainUnit.unitMultiplier : (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1);

      const id = await createProduct({
        name: String(name).trim(),
        description: body.description ?? body.description ?? null,
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
        reference: body.reference ?? body.reference ?? null,
        active: body.active !== undefined ? (body.active === 1 || body.active === true) : true,
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

      const itemType = body.kind ?? body.type ?? 'PRODUCT';
      if (itemType !== 'PRODUCT' && itemType !== 'PRODUCT') {
        return res.status(400).json({ error: 'Esta rota aceita apenas produtos.' });
      }

      const name = body.name ?? body.name;
      if (!name || !String(name).trim()) return res.status(400).json({ error: 'O nome é obrigatório.' });

      const categoryId = body.categoryId ?? body.categoryId ?? body.category_id;
      if (!categoryId) return res.status(400).json({ error: 'Selecione uma categoria válida.' });

      const brandId = body.brandId ?? body.brandId ?? body.brand_id;
      const supplierId = body.supplierId ?? body.supplierId ?? body.supplier_id;
      if (!brandId) return res.status(400).json({ error: 'Selecione uma marca válida.' });
      if (!supplierId) return res.status(400).json({ error: 'Selecione um fornecedor válido.' });

      const unitsInput: UnitPayload[] = Array.isArray(body.units ?? body.units)
        ? (body.units ?? body.units)
        : [];
      let unitList = unitsInput
        .map((u) => ({
          unitId: String(u.unitId ?? u.unit_id ?? u.unit_measure_id ?? ''),
          unitMultiplier: parseNumber(u.unitMultiplier ?? u.unit_multiplier),
          isPrimary: u.isPrimary === true || u.mainBarcode === 1 || u.mainBarcode === true,
        }))
        .filter((u) => u.unitId !== '');

      if (unitsInput.length > 0 && unitList.length === 0) {
        return res.status(400).json({ error: 'Nenhuma unidade de medida válida foi informada.' });
      }

      if (unitList.length === 0) {
        const unitId = body.unit_measure_id ?? body.baseUnitId ?? body.base_unit_id ?? existing.baseUnitId;
        unitList = [{ unitId: String(unitId), unitMultiplier: parseNumber(body.unit_multiplier ?? body.unitMultiplier ?? body.unit_multiplier ?? existing.unitMultiplier), isPrimary: true }];
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

      const barcodesInput: BarcodePayload[] = Array.isArray(body.barcodes ?? body.barcodes)
        ? (body.barcodes ?? body.barcodes)
        : [];
      const listBarcodes = barcodesInput
        .map((cb) => ({
          barcode: String(cb.barcode ?? cb.barcodesData ?? '').trim(),
          isPrimary: cb.isPrimary === true || cb.mainBarcode === 1 || cb.mainBarcode === true,
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

      const internalCode = body.internalCode ?? body.internalCode ?? body.internal_code ?? existing.internalCode;
      if (internalCode && existing.internalCode && String(internalCode).trim() !== existing.internalCode) {
        return res.status(400).json({ error: 'O código interno não pode ser alterado.' });
      }

      const purchasePrice = parseNumber(body.purchasePrice ?? body.purchasePrice ?? body.purchase_price ?? existing.purchasePrice);
      const profitMargin = parseNumber(body.profitMargin ?? body.profitMargin ?? body.profit_margin ?? existing.profitMargin);
      const salePrice = parseNumber(body.salePrice ?? body.salePrice ?? body.sale_price ?? existing.salePrice);
      const stock = parseNumber(body.stock ?? body.stock ?? existing.stock);
      const multiplier = parseNumber(body.unit_multiplier ?? body.unitMultiplier ?? body.unit_multiplier ?? existing.unitMultiplier);

      const finalUnitId = (unitList.find((u) => u.isPrimary)?.unitId) ?? existing.baseUnitId;
      const finalMultiplier = (unitList.find((u) => u.isPrimary)?.unitMultiplier) ?? (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : existing.unitMultiplier);

      await updateProduct(String(id), {
        name: String(name).trim(),
        description: body.description ?? body.description ?? existing.description,
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
        reference: body.reference ?? body.reference ?? existing.reference,
        active: body.active !== undefined ? (body.active === 1 || body.active === true) : existing.active,
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
