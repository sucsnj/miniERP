# `src/components/NotasDoMes.tsx`

## Descrição

Painel que exibe notas fiscais do mês e permite excluir registros.

## Contexto

É usado também em todas as páginas do sistema, para visualização das notas do mês. Cada página tem um período pré-definido, mas pode ser alterado pelo usuário.

## Responsabilidades

- Buscar notas do período usando React Query.
- Exibir seleção de mês e ano.
- Calcular somatório de valores de notas.
- Excluir nota após confirmação.

## Assinatura

```ts
interface NotasDoMesProps {
  ano: number;
  mes: number;
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
}

const NotasDoMes: React.FC<NotasDoMesProps>;
```

Query do React Query:

```ts
useQuery<NotaDetalhe[]>({
  queryKey: ['notas', ano, mes],
  queryFn: () => buscarNotasPorPeriodo(ano, mes), // aceita array ou objeto único
});
```

## Props

- `ano`, `mes`, `setAno`, `setMes`

## Dependências

- React Query (`@tanstack/react-query`)
- Material Icons (`@mui/icons-material`)
- `utils/formatter.ts`
- `utils/date.ts`

## Observações

- O componente usa `useQuery` para buscar dados e `invalidateQueries` após exclusão.
- Formata valores e datas para exibição.
