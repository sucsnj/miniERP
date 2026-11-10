/**
 * src/types/sale.ts
 *
 * Tipos compartilhados do domínio de vendas (carrinho de itens) usados por
 * DailySaleForm, EditSaleForm, CartModal, SelectItemsModal e useCart.
 */

/** Tipo de item do catálogo/carrinho. */
export type CatalogItemType = 'PRODUTO' | 'SERVICO';

/** Item do carrinho de uma venda (produto ou serviço). */
export interface CartItem {
  id: number;
  tipo: CatalogItemType;
  nome: string;
  preco_venda: number;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
  estoque?: number;
}