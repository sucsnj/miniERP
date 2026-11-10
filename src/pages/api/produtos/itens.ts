import type { NextApiRequest, NextApiResponse } from 'next';
import db, { insertItem, getItemByBarcode, checkDuplicateBarcode, insertStockMovement } from '../../../database/produtosDb';
import { parseNumber } from '../../../utils/number';
import { parseStringPromise } from 'xml2js';

interface ExistingItemRow {
  id: number;
  nome: string;
  preco_venda: number;
  estoque: number;
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
  itemIdExistente?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { xml, preview, importar: shouldImport, produto: productPayload } = req.body;

        // MODO 1: Pre-visualizar / parsear o XML e retornar a lista de produtos com mapeamento
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

            // Na importação de nota (mesmo sendo saída do fornecedor), para a loja local é um AJUSTE ou ENTRADA para somar no estoque.
            const movementType = 'ENTRADA';

            for (let i = 0; i < details.length; i++) {
                const productXml = details[i].prod[0];

                const cProd = productXml.cProd?.[0] ? String(productXml.cProd[0]).trim() : '';
                const ean = productXml.cEAN && productXml.cEAN[0] !== 'SEM GTIN' ? String(productXml.cEAN[0]).trim() : '';
                const description = productXml.xProd?.[0] ? String(productXml.xProd[0]).trim() : '';
                const quantity = parseNumber(productXml.qCom[0]);
                const unitValue = parseNumber(productXml.vUnCom[0]);
                const unitOfMeasure = productXml.uCom?.[0] ? String(productXml.uCom[0]).trim() : '';
                
                // Verifica se já existe no banco de dados
                let existingItem: ExistingItemRow | null | undefined = null;
                if (ean) {
                    existingItem = getItemByBarcode(ean);
                }
                if (!existingItem && cProd) {
                    existingItem = db.prepare('SELECT id, nome, preco_venda, estoque FROM itens WHERE LOWER(codigo_interno) = LOWER(?)').get(cProd) as unknown as ExistingItemRow | undefined;
                    if (!existingItem) {
                        existingItem = db.prepare('SELECT id, nome, preco_venda, 0 as estoque FROM servicos WHERE LOWER(codigo_interno) = LOWER(?)').get(cProd) as unknown as ExistingItemRow | undefined;
                    }
                }
                if (!existingItem && description) {
                    existingItem = db.prepare('SELECT id, nome, preco_venda, estoque FROM itens WHERE LOWER(TRIM(nome)) = LOWER(?)').get(description) as unknown as ExistingItemRow | undefined;
                    if (!existingItem) {
                        existingItem = db.prepare('SELECT id, nome, preco_venda, 0 as estoque FROM servicos WHERE LOWER(TRIM(nome)) = LOWER(?)').get(description) as unknown as ExistingItemRow | undefined;
                    }
                }

                const exists = !!existingItem;

                // Ignorar os itens duplicados no mesmo XML pelo EAN ou cProd
                const existingInBatch = previewItems.find(p => (p.ean && p.ean === ean) || (cProd && p.cProd === cProd));
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
                         itemIdExistente: existingItem?.id
                     });
                } else {
                     existingInBatch.quantidade += quantity;
                }
            }

            return res.status(200).json({ produtos: previewItems });
        }

        // MODO 2: Importar um produto específico
        if (shouldImport && productPayload) {
            const {
                ean,
                descricao: description,
                quantidade: quantity,
                valorUnitario: unitValue,
                tipoMovimentacao: movementType,
                itemIdExistente: existingItemId,
            } = productPayload;

            // 1. Se já possui item vinculado pelo usuário ou preview, atualiza o estoque
            if (existingItemId) {
                insertStockMovement({
                    item_id: existingItemId,
                    tipo: movementType || 'ENTRADA',
                    quantidade: quantity,
                    descricao: 'Importação de XML de NF-e',
                });
                return res.status(200).json({ sucesso: true, id: existingItemId, estoqueAtualizado: true });
            }

            // 2. Verifica se já existe produto com esse EAN (código de barras)
            if (ean) {
                const existingItem = getItemByBarcode(ean);
                if (existingItem) {
                    insertStockMovement({
                        item_id: existingItem.id,
                        tipo: movementType || 'ENTRADA',
                        quantidade: quantity,
                        descricao: 'Importação de XML de NF-e',
                    });
                    return res.status(200).json({ sucesso: true, id: existingItem.id, estoqueAtualizado: true });
                }
                const duplicateInBarcodesTable = checkDuplicateBarcode([ean]);
                if (duplicateInBarcodesTable) {
                     return res.status(400).json({ error: `Código de barras já está cadastrado em outro produto`, duplicado: true });
                }
            }

            // 2. Prepara os dados para inserção (usaremos valores padrão para campos obrigatórios não presentes na NF-e)
            // categoria_id 1 = Geral
            // unidade_medida_id 1 = UN
            // marca_id 1 = Outros
            // fornecedor_id 1 = Sem fornecedor
            const listBarcodes = ean ? [{ codigo_barras: ean.trim(), principal: 1 }] : [];

            const purchasePrice = unitValue;
            const salePrice = unitValue * 1.5; // Margem padrão de 50%
            const profitMargin = 50;

            const newItem = {
                tipo: 'PRODUTO' as const,
                nome: description.substring(0, 100), // Limita tamanho se necessário
                descricao: `Importado via XML da NF-e`,
                categoria_id: 1, 
                unidade_medida_id: 1, 
                marca_id: 1,
                fornecedor_id: 1,
                preco_compra: purchasePrice,
                margem_lucro: profitMargin,
                preco_venda: salePrice,
                estoque: quantity,
                multiplicador_unidade: 1,
                referencia: null,
                ativo: 1,
                codigos_barras: listBarcodes,
            };

            const itemId = insertItem(newItem);

            return res.status(201).json({ sucesso: true, id: itemId });
        }

        return res.status(400).json({ error: 'Modo de operação inválido' });

    } catch (error: unknown) {
        console.error('Erro na API de importação de itens:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro interno no servidor' });
    }
}
