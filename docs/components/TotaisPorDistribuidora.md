# `src/components/TotaisPorDistribuidora.tsx`

## Descrição

Componente simples de resumo que lista valores pendentes agrupados por distribuidora.

## Contexto

Usado para exibir totais pendentes por distribuidora em um painel de resumo financeiro.

## Responsabilidades

- Renderizar totais pendentes por distribuidora.
- Exibir estado vazio quando não houver valores.

## Assinatura

```ts
interface TotaisPorDistribuidoraProps {
  totaisPorDistribuidora: Record<string, number>;
}

const TotaisPorDistribuidora: React.FC<TotaisPorDistribuidoraProps>;
```

## Props

- `totaisPorDistribuidora` - mapa de distribuidora para valor.

## Dependências

- `formatCurrency`

## Observações

- Ideal para visão rápida de responsabilidades financeiras por fornecedor.
