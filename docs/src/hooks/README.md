# `src/hooks/`

> Índice dos hooks do cliente em `src/hooks/`.

## Índice

| Arquivo | Resumo |
| --- | --- |
| [useBrand.md](./useBrand.md) | Gerencia marca (criação/edição/exclusão) no cadastro rápido. Exporta `useBrand`. |
| [useCart.md](./useCart.md) | Centraliza carrinho e catálogo de seleção (produtos/serviços), com debounce e totais. |
| [useCategory.md](./useCategory.md) | Gerencia categoria no cadastro rápido. Exporta `useCategory`. |
| [useConfirmDialog.md](./useConfirmDialog.md) | Gerencia diálogo de confirmação de exclusão. |
| [useDailySaleForm.md](./useDailySaleForm.md) | Centraliza estado/validação/ações/efeitos do formulário de venda diária. |
| [useEscClose.md](./useEscClose.md) | Fecha modal/componente ao pressionar ESC enquanto aberto. |
| [useFilter.md](./useFilter.md) | Filtro do histórico com persistência em localStorage. |
| [useImportItems.md](./useImportItems.md) | Estado/lógica de importação de itens via XML de NF-e. |
| [useMonthlyData.md](./useMonthlyData.md) | Consolidações mensais (carregar/excluir). Exporta `useMonthlyData`. |
| [useSales.md](./useSales.md) | Estado/ações de vendas diárias por período. Exporta `useSales`. |
| [useSupplier.md](./useSupplier.md) | Gerencia fornecedor no cadastro rápido. Exporta `useSupplier`. |
| [useToast.md](./useToast.md) | Estado/controles de toast via store singleton. |
| [useUnitOfMeasure.md](./useUnitOfMeasure.md) | Gerencia unidade de medida no cadastro rápido. Exporta `useUnitOfMeasure`. |

## Notas

- Arquivos e identificadores exportados em inglês (ADR 0004); propriedades de tipos/contratos de domínio permanecem em pt-BR (ex.: `SalesFilter`, `UnitOfMeasureRow`).