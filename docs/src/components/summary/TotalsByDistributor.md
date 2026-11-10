# `src/components/summary/TotalsByDistributor.tsx`

> Lista de valores pendentes agrupados por distribuidora.

## O que faz

- Renderiza cada distribuidora com o total pendente formatado.
- Estado vazio: "Sem pendências por distribuidora."

```ts
interface TotalsByDistributorProps {
  totalsByDistributor: Record<string, number>;
}
```

## Relações

- **Usa:** `formatCurrency` (`src/utils/formatter.tsx`).
- **Usado por:** [Summary](./Summary.md).

## Notas

- Apresentacional; o agrupamento é feito no [Summary](./Summary.md).
