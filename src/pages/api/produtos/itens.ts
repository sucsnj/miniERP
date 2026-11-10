import type { NextApiRequest, NextApiResponse } from 'next';
import {
  findProductByBarcode,
  findProductByInternalCode,
  findProductByName,
  findServiceByInternalCode,
  findServiceByName,
  checkDuplicateBarcode,
  createProduct,
  listCategories,
  listBrands,
  listSuppliers,
  listUnitsOfMeasure,
  applyStockMovement,
} from '../../../database/productsRepository';
import { parseNumber } from '../../../utils/number';
import { parseStringPromise } from 'xml2js';

interface ExistingItem {
  id: string;
  nome: string;
  preco_venda: number;
  estoque: number;
  isService: boolean;
}

interface ProductPreview {
  cProd: string;
  ean: string;
  descricao: string;
  descricaoOriginal: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  tipoMovimentacao: string;
  existe: boolean;
  itemIdExistente?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { xml, preview, importar: shouldImport, produto: productPayload } = req.body;

    if (preview) {
      if (!xml) {
        return res.status(400).json({ error: 'Arquivo XML não fornecido' });
      }

      const parsed = await parseStringPromise(xml, { explicitArray: true });

      if (!parsed.nfeProc || !parsed.nfeProc.NFe || !parsed.nfeProc.NFe[0].infNFe) {
        return res.status(400).json({ error: 'Formato de XML de NF-e inválido' });
      }

      const infNFe = parsed.nfeProc.NFe[0].infNFe[0];
      const details = infNFe.det || [];
      const previewItems: ProductPreview[] = [];

      const movementType = 'ENTRADA';

      for (let i = 0; i < details.length; i++) {
        const productXml = details[i].prod[0];

        const cProd = productXml.cProd?.[0] ? String(productXml.cProd[0]).trim() : '';
        const ean = productXml.cEAN && productXml.cEAN[0] !== 'SEM GTIN' ? String(productXml.cEAN[0]).trim() : '';
        const description = productXml.xProd?.[0] ? String(productXml.xProd[0]).trim() : '';
        const quantity = parseNumber(productXml.qCom[0]);
        const unitValue = parseNumber(productXml.vUnCom[0]);
        const unitOfMeasure = productXml.uCom?.[0] ? String(productXml.uCom[0]).trim() : '';

        let existingItem: ExistingItem | null = null;
        if (ean) {
          const product = await findProductByBarcode(ean);
          if (product) {
            existingItem = { id: product.id, nome: product.name, preco_venda: product.salePrice, estoque: product.stock, isService: false };
          }
        }
        if (!existingItem && cProd) {
          const product = await findProductByInternalCode(cProd);
          if (product) {
            existingItem = { id: product.id, nome: product.name, preco_venda: product.salePrice, estoque: product.stock, isService: false };
          } else {
            const service = await findServiceByInternalCode(cProd);
            if (service) {
              existingItem = { id: service.id, nome: service.name, preco_venda: service.salePrice, estoque: 0, isService: true };
            }
          }
        }
        if (!existingItem && description) {
          const product = await findProductByName(description);
          if (product) {
            existingItem = { id: product.id, nome: product.name, preco_venda: product.salePrice, estoque: product.stock, isService: false };
          } else {
            const service = await findServiceByName(description);
            if (service) {
              existingItem = { id: service.id, nome: service.name, preco_venda: service.salePrice, estoque: 0, isService: true };
            }
          }
        }

        const exists = !!existingItem;

        const existingInBatch = previewItems.find((p) => (p.ean && p.ean === ean) || (cProd && p.cProd === cProd));
        if (!existingInBatch) {
          previewItems.push({
            cProd,
            ean,
            descricao: existingItem ? existingItem.nome : description,
            descricaoOriginal: description,
            unidadeMedida: unitOfMeasure,
            quantidade: quantity,
            valorUnitario: unitValue,
            tipoMovimentacao: movementType,
            existe: exists,
            itemIdExistente: existingItem?.id,
          });
        } else {
          existingInBatch.quantidade += quantity;
        }
      }

      return res.status(200).json({ produtos: previewItems });
    }

    if (shouldImport && productPayload) {
      const {
        ean,
        descricao: description,
        quantidade: quantity,
        valorUnitario: unitValue,
        tipoMovimentacao: movementType,
        itemIdExistente: existingItemId,
      } = productPayload;

      if (existingItemId) {
        await applyStockMovement(String(existingItemId), (movementType || 'ENTRADA').toUpperCase() === 'SAIDA' ? 'OUT' : 'IN', quantity, 'Importação de XML de NF-e');
        return res.status(200).json({ sucesso: true, id: existingItemId, estoqueAtualizado: true });
      }

      if (ean) {
        const existingProduct = await findProductByBarcode(String(ean));
        if (existingProduct) {
          await applyStockMovement(existingProduct.id, 'IN', quantity, 'Importação de XML de NF-e');
          return res.status(200).json({ sucesso: true, id: existingProduct.id, estoqueAtualizado: true });
        }
        const duplicate = await checkDuplicateBarcode([String(ean)]);
        if (duplicate) {
          return res.status(400).json({ error: 'Código de barras já está cadastrado em outro produto', duplicado: true });
        }
      }

      const categories = await listCategories();
      const brands = await listBrands();
      const suppliers = await listSuppliers();
      const units = await listUnitsOfMeasure();
      const defaultCategory = categories.find((c) => c.isDefault)?.id ?? categories[0]?.id;
      const defaultBrand = brands.find((b) => b.isDefault)?.id ?? brands[0]?.id;
      const defaultSupplier = suppliers.find((s) => s.isDefault)?.id ?? suppliers[0]?.id;
      const defaultUnit = units.find((u) => u.isDefault)?.id ?? units[0]?.id;

      const listBarcodes = ean ? [{ barcode: String(ean).trim(), isPrimary: true }] : [];
      const purchasePrice = Number(unitValue) || 0;
      const salePrice = purchasePrice * 1.5;
      const profitMargin = 50;

      const itemId = await createProduct({
        name: String(description).substring(0, 100),
        description: 'Importado via XML da NF-e',
        categoryId: String(defaultCategory),
        baseUnitId: String(defaultUnit),
        brandId: String(defaultBrand),
        supplierId: String(defaultSupplier),
        purchasePrice,
        profitMargin,
        salePrice,
        stock: Number(quantity) || 0,
        unitMultiplier: 1,
        internalCode: null,
        reference: null,
        active: true,
        barcodes: listBarcodes,
        units: [{ unitId: String(defaultUnit), unitMultiplier: 1, isPrimary: true }],
      });

      return res.status(201).json({ sucesso: true, id: itemId });
    }

    return res.status(400).json({ error: 'Modo de operação inválido' });
  } catch (error: unknown) {
    console.error('Erro na API de importação de itens:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro interno no servidor' });
  }
}
