# `src/pages/resumo.tsx`

## Descrição

Página de resumo mensal dos registros consolidados de vendas, com opção de exclusão de meses consolidados.

## Responsabilidades

- Buscar todos os registros mensais consolidados.
- Exibir informações de ticket médio, melhor dia, maior venda e total.
- Exibir diálogo de confirmação antes de excluir um mês.
- Atualizar Toasts conforme o resultado.

## Funções Principais

- `loadMensais()` - carrega o histórico mensal.
- `handleDelete()` - exclui o registro mensal selecionado.
- `openConfirm()` - abre o diálogo de confirmação.

## Dependências

- `src/services/vendasService`
- `src/components/Toast`
- `src/components/ConfirmDialog`
- `src/utils/formatter`
- `dayjs`

## Observações

- O componente usa `dayjs` para formatação de nomes de mês e dias da semana em pt-BR.
- A exclusão de meses consolidados é irreversível e exige confirmação.
