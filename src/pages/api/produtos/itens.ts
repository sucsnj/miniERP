import type { NextApiRequest, NextApiResponse } from 'next';
import db, { insertItem, getItemByBarcode, checkDuplicateBarcode, insertMovimentacaoEstoque } from '../../../database/produtosDb';
import { parseNumber } from '../../../utils/number';
import { parseStringPromise } from 'xml2js';

interface ItemExistenteRow {
  id: number;
  nome: string;
  preco_venda: number;
  estoque: number;
}

interface ProdutoPreview {
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
        const { xml, preview, importar, produto } = req.body;

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
            const itens = infNFe.det || [];
            const produtos: ProdutoPreview[] = [];

            // Na importação de nota (mesmo sendo saída do fornecedor), para a loja local é um AJUSTE ou ENTRADA para somar no estoque.
            const tipoMovimentacao = 'ENTRADA';

            for (let i = 0; i < itens.length; i++) {
                const prod = itens[i].prod[0];

                const cProd = prod.cProd?.[0] ? String(prod.cProd[0]).trim() : '';
                const ean = prod.cEAN && prod.cEAN[0] !== 'SEM GTIN' ? String(prod.cEAN[0]).trim() : '';
                const descricao = prod.xProd?.[0] ? String(prod.xProd[0]).trim() : '';
                const quantidade = parseNumber(prod.qCom[0]);
                const valorUnitario = parseNumber(prod.vUnCom[0]);
                const unidadeMedida = prod.uCom?.[0] ? String(prod.uCom[0]).trim() : '';
                
                // Verifica se já existe no banco de dados
                let itemExistente: ItemExistenteRow | null | undefined = null;
                if (ean) {
                    itemExistente = getItemByBarcode(ean);
                }
                if (!itemExistente && cProd) {
                    itemExistente = db.prepare('SELECT id, nome, preco_venda, estoque FROM itens WHERE LOWER(codigo_interno) = LOWER(?)').get(cProd) as unknown as ItemExistenteRow | undefined;
                    if (!itemExistente) {
                        itemExistente = db.prepare('SELECT id, nome, preco_venda, 0 as estoque FROM servicos WHERE LOWER(codigo_interno) = LOWER(?)').get(cProd) as unknown as ItemExistenteRow | undefined;
                    }
                }
                if (!itemExistente && descricao) {
                    itemExistente = db.prepare('SELECT id, nome, preco_venda, estoque FROM itens WHERE LOWER(TRIM(nome)) = LOWER(?)').get(descricao) as unknown as ItemExistenteRow | undefined;
                    if (!itemExistente) {
                        itemExistente = db.prepare('SELECT id, nome, preco_venda, 0 as estoque FROM servicos WHERE LOWER(TRIM(nome)) = LOWER(?)').get(descricao) as unknown as ItemExistenteRow | undefined;
                    }
                }

                const existe = !!itemExistente;

                // Ignorar os itens duplicados no mesmo XML pelo EAN ou cProd
                const existenteNoLote = produtos.find(p => (p.ean && p.ean === ean) || (cProd && p.cProd === cProd));
                if (!existenteNoLote) {
                     produtos.push({
                         cProd,
                         ean,
                         descricao: itemExistente ? itemExistente.nome : descricao,
                         descricaoOriginal: descricao,
                         unidadeMedida,
                         quantidade,
                         valorUnitario,
                         tipoMovimentacao,
                         existe,
                         itemIdExistente: itemExistente?.id
                     });
                } else {
                     existenteNoLote.quantidade += quantidade;
                }
            }

            return res.status(200).json({ produtos });
        }

        // MODO 2: Importar um produto específico
        if (importar && produto) {
            const { ean, descricao, quantidade, valorUnitario, tipoMovimentacao, itemIdExistente } = produto;

            // 1. Se já possui item vinculado pelo usuário ou preview, atualiza o estoque
            if (itemIdExistente) {
                insertMovimentacaoEstoque({
                    item_id: itemIdExistente,
                    tipo: tipoMovimentacao || 'ENTRADA',
                    quantidade,
                    descricao: 'Importação de XML de NF-e',
                });
                return res.status(200).json({ sucesso: true, id: itemIdExistente, estoqueAtualizado: true });
            }

            // 2. Verifica se já existe produto com esse EAN (código de barras)
            if (ean) {
                const itemExistente = getItemByBarcode(ean);
                if (itemExistente) {
                    insertMovimentacaoEstoque({
                        item_id: itemExistente.id,
                        tipo: tipoMovimentacao || 'ENTRADA',
                        quantidade,
                        descricao: 'Importação de XML de NF-e',
                    });
                    return res.status(200).json({ sucesso: true, id: itemExistente.id, estoqueAtualizado: true });
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

            const precoCompra = valorUnitario;
            const precoVenda = valorUnitario * 1.5; // Margem padrão de 50%
            const margemLucro = 50;

            const novoItem = {
                tipo: 'PRODUTO' as const,
                nome: descricao.substring(0, 100), // Limita tamanho se necessário
                descricao: `Importado via XML da NF-e`,
                categoria_id: 1, 
                unidade_medida_id: 1, 
                marca_id: 1,
                fornecedor_id: 1,
                preco_compra: precoCompra,
                margem_lucro: margemLucro,
                preco_venda: precoVenda,
                estoque: quantidade,
                multiplicador_unidade: 1,
                referencia: null,
                ativo: 1,
                codigos_barras: listBarcodes,
            };

            const itemId = insertItem(novoItem);

            return res.status(201).json({ sucesso: true, id: itemId });
        }

        return res.status(400).json({ error: 'Modo de operação inválido' });

    } catch (error: unknown) {
        console.error('Erro na API de importação de itens:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Erro interno no servidor' });
    }
}
