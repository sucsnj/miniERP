/**
 * src/types/sale.ts
 *
 * Tipos compartilhados do domínio de vendas (carrinho de itens) usados por
 * DailySaleForm, EditSaleForm, CartModal, SelectItemsModal e useCart.
 */

/** Tipo de item do catálogo/carrinho. */
export type CatalogItemType = 'PRODUCT' | 'SERVICE';

/** Item do carrinho de uma venda (product ou serviço). */
export interface CartItem {
  id: string;
  kind: CatalogItemType;
  name: string;
  salePrice: number;
  quantity: number;
  internalCode?: string;
  reference?: string;
  stock?: number;
}