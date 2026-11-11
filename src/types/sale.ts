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
  id: string;
  tipo: CatalogItemType;
  name: string;
  salePrice: number;
  quantity: number;
  internalCode?: string;
  referencia?: string;
  estoque?: number;
}