# `src/components/sales/DailySalesTotal.tsx`

> Painel de resumo de vendas: período, dia, ticket médio e últimas vendas.

## O que faz

- Total/quantidade/ticket médio do período e (se `selectedDay`) total, vendas e média do dia.
- Lista "Últimas 4 vendas" (`recentSales`) com Editar/Excluir quando `canEdit(data)`; senão mostra "Bloqueado". O botão Excluir não exibe ícone.
- Atalho `Delete` exclui a venda mais recente; renderiza `children` no card do formulário.
- Blocos de vendas recém-adicionadas (inserções otimistas com `operationId: optimistic-*`) recebem destaque visual e voltam suavemente ao estado normal em até 5s (`historyItemNew`).
- Ao excluir, a mutação é chamada imediatamente e a lista exibida fica congelada durante a animação: o bloco é substituído na mesma posição (mesma chave React), continua visível em preto e branco e desaparece em até 2s (`historyItemDeleting`), sem sofrer efeito de hover nem permitir foco em seus botões. Nenhum card extra aparece e a próxima venda só entra na vaga após o fim da animação.

```ts
interface DailySalesTotalProps {
  sales: DailySale[]; selectedDay?: string; recentSales?: DailySale[];
  onEditSale?: (sale: DailySale) => void; onDeleteSale?: (id: string) => void;
  children?: ReactNode;
}
```

## Relações

- **Usa:** `DailySale` (`src/services/salesService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString` (`src/utils/date.ts`), `canEdit` (`src/utils/edit.ts`), `useShortcuts`.
- **Usado por:** `../../pages/index.md`.

## Notas

- Largura livre de `105%`, `transform: scale` e larguras mínimas fixas removidos: o card usa `width: 100%`, `min-width: 0` e grids com `minmax(0)` para não estourar viewports longos não móveis.
- Nas últimas vendas, o tipo de venda (`saleType`) é exibido ao lado da hora quando presente.
- `canEdit` bloqueia vendas fora da janela editável; o `Delete` age sobre a maior `id` de `recentSales`.
- O card "Total do Período" é clicável e cicla o filtro de tipo de venda (Não informado → Crédito → Débito → PIX → Outros → Não informado), exibindo badge com ícone (crédito: cartão simples; débito: cartão com cifrão; PIX: QR code; outros: categoria; não informado: cifrão) e rótulo; os totais refletem o filtro.
- A chave React dos blocos usa `operationId` quando disponível, preservando a mesma instância entre o ID otimista e o ID definitivo da API.
- Timeouts de destaque/exclusão são armazenados em `Set`s e removidos ao disparar/desmontar, evitando timers obsoletos acumulados.
- O destaque usa tokens de tema (`accent`) e a CSS de exclusão remove o hover e desabilita os botões de Editar/Excluir; `prefers-reduced-motion` reduz a animação.
