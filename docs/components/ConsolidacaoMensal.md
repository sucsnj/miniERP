# `src/components/ConsolidacaoMensal.tsx`

## Descrição
Componente de resumo que exibe valores pagos e pendentes por mês.

## Contexto

Utilizado no resumo de pagamentos para exibir valores pagos e pendentes por mês.

## Responsabilidades

- Renderizar tabela resumida de consolidação mensal.
- Formatar valores usando utilitário de moeda.

## Assinatura

```ts
interface ConsolidacaoMensalProps {
  meses: { mes: number; pago: number; pendente: number }[];
}

const ConsolidacaoMensal: React.FC<ConsolidacaoMensalProps>;
```

## Props

- `meses` - lista de objetos com `mes`, `pago` e `pendente`.

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `capitalize` (capitalização de texto).

## Exemplo de uso

```tsx
<ConsolidacaoMensal meses={meses} />
```

## Observações

- Utiliza `capitalize` para formatar o nome do mês.
