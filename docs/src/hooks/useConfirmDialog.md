# `src/hooks/useConfirmDialog.ts`

> Hook para gerenciar diálogo de confirmação de exclusão.

## O que faz

- Controla estado `confirmOpen` e `selectedId`.
- `openConfirm(id)`: guarda id e abre diálogo.
- `handleConfirm()`: executa `onConfirmAction(selectedId)` se definido e fecha.
- `cancelConfirm()`: fecha sem executar ação.

## Relações

- **Usa:** `React.useState`.
- **Usado por:** páginas/componentes que precisam confirmar exclusão.

## Notas

- Simples e reutilizável; callback recebe id a excluir.