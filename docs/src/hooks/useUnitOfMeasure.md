# `src/hooks/useUnitOfMeasure.ts`

> Hook para gerenciar criação, edição e exclusão de unidade de medida no cadastro rápido. Exporta `useUnitOfMeasure`.

## O que faz

- Controla os modais de cadastro (`unitOfMeasureModalOpen`) e edição (`unitOfMeasureEditModalOpen`) com `uomForm`.
- Cria unidade via `createUnitOfMeasure` (valida `abbreviation` obrigatória), atualiza `setOptions.unitsOfMeasure` e seleciona a criada.
- Atualiza/exclui unidade, sincroniza opções, ajusta paginação/listagem e fecha modais.

## Relações

- **Usa:** `fetchUnitsOfMeasure`, `createUnitOfMeasure`, `deleteUnitOfMeasure`, `updateUnitOfMeasure` (`src/services/produtosService.ts`), `UnitOfMeasureFormData` (`src/types/catalog.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** [cadastro](../pages/cadastro.md), que renderiza [CatalogEntityModal](../components/catalog/CatalogEntityModal.md).

## Notas

- O tipo do formulário vive em `src/types/catalog.ts`; o hook não exporta mais tipos auxiliares.
- Validação: exige `abbreviation` não vazia na edição.
