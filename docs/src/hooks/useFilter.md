# `src/hooks/useFilter.ts`

> Hook para gerenciar filtro do histórico de vendas, restaurando e persistindo no localStorage.

## O que faz

- Estado `filter` com inicialização lazy: lê `localStorage` (se navegador), valida via `isValidFilter`; padrão `todas` em SSR.
- `changeFilter(value)`: atualiza estado e grava em `localStorage` com chave `historicoFiltro`.
- Tipo exportado `SalesFilter = 'todas' | 'positivas' | 'negativas'`.

## Relações

- **Usa:** `React.useState`.
- **Usado por:** páginas/componentes do histórico de vendas.

## Notas

- Evita render extra ao usar lazy initializer; valida valores salvos.