# `src/components/products/StockAdjustModal.tsx`

> Modal de ajuste de estoque com histórico de movimentações.

## O que faz

- Exibe nome/estoque atual, campo Quantidade (positiva ou negativa) e Descrição.
- Lista as últimas 10 movimentações; botões "Registrar Ajuste" (`onSave`) e Cancelar.

```ts
interface StockAdjustModalProps {
  open: boolean; itemName: string; itemStock: number;
  quantity: string; description: string;
  setQuantity: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  movements: StockMovementData[]; movementsLoading: boolean;
  onSave: () => void; onClose: () => void;
}
```

## Relações

- **Usa:** `StockMovementData` (`src/services/produtosService.ts`), `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](./ProductForm.md) (botão "Ajustar" em edição).

## Notas

- Controlado: o pai grava e fecha. A movimentação `AJUSTE` é criada no salvamento do produto, não aqui.
- Histórico é apenas informativo; foco automático no campo Quantidade.
