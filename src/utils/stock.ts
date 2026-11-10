export type StockMovementType = 'ENTRADA' | 'SAIDA';

export interface SaleStockItem {
  item_id?: number | null;
  tipo: 'PRODUTO' | 'SERVICO';
  quantidade: number;
}

export interface StockAdjustment {
  itemId: number;
  type: StockMovementType;
  quantity: number;
}

/**
 * Calcula os ajustes de estoque necessários ao substituir os itens de uma venda.
 * Quantidades positivas em `SAIDA` representam subtração de estoque.
 */
export function getSaleStockAdjustments(
  oldItems: SaleStockItem[],
  newItems: SaleStockItem[]
): StockAdjustment[] {
  const oldByItem = new Map<number, number>();
  const newByItem = new Map<number, number>();

  for (const item of oldItems) {
    if (item.tipo !== 'PRODUTO' || !item.item_id) continue;
    oldByItem.set(item.item_id, (oldByItem.get(item.item_id) ?? 0) + Number(item.quantidade || 0));
  }

  for (const item of newItems) {
    if (item.tipo !== 'PRODUTO' || !item.item_id) continue;
    newByItem.set(item.item_id, (newByItem.get(item.item_id) ?? 0) + Number(item.quantidade || 0));
  }

  const itemIds = new Set<number>([...oldByItem.keys(), ...newByItem.keys()]);
  const adjustments: StockAdjustment[] = [];

  for (const itemId of itemIds) {
    const oldQuantity = oldByItem.get(itemId) ?? 0;
    const newQuantity = newByItem.get(itemId) ?? 0;
    const diff = newQuantity - oldQuantity;

    if (diff > 0) {
      adjustments.push({ itemId, type: 'SAIDA', quantity: diff });
    } else if (diff < 0) {
      adjustments.push({ itemId, type: 'ENTRADA', quantity: Math.abs(diff) });
    }
  }

  return adjustments;
}
