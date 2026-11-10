# `src/pages/historico.tsx`

## Descrição

Página de histórico de vendas. Exibe tabela com vendas registradas, permite edição e exclusão de vendas recentes.

## Responsabilidades

- Carregar vendas diárias para mês e ano selecionados.
- Renderizar `SalesTable` com resultados paginados por configuração local.
- Permitir edição e exclusão apenas quando `canEdit()` retorna verdadeiro.
- Exibir `Toast` para mensagens de sucesso/erro.

## Funções Principais

- `loadSales()` - busca vendas por mês/ano.
- `handleEditSale()` / `handleSaveEdit()` / `handleCancelEdit()` - fluxo de edição.
- `handleDeleteSale()` - exclui apenas vendas editáveis.

## Dependências

- `src/components/SalesTable`
- `src/components/ExportButtons`
- `src/services/vendasService`
- `src/utils/date`
- `src/utils/captalize`
- `src/utils/edit`

## Observações

- O componente usa `SalesTable` para exibir registros e uma opção local de número máximo de linhas.
- A página compartilha muita lógica com `index.tsx`, o que sugere oportunidade de refatoração.
