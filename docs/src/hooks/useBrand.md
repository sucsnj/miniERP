# `src/hooks/useBrand.ts`

> Hook para gerenciar criação, edição e exclusão de marca no cadastro rápido de produtos. Exporta `useBrand`.

## O que faz

- Controla os modais de cadastro (`brandModalOpen`) e edição (`brandEditModalOpen`), ambos usando `brandForm`.
- Cria marca via `createBrand`, atualiza as opções e seleciona a marca criada.
- Atualiza/exclui marca e sincroniza a lista de opções do formulário.

## Relações

- **Usa:** `fetchBrands`, `createBrand`, `deleteBrand`, `updateBrand` (`src/services/produtosService.ts`), `BrandFormData` (`src/types/catalog.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** [cadastro](../pages/cadastro.md), que renderiza [CatalogEntityModal](../components/catalog/CatalogEntityModal.md).

## Notas

- O formulário é limpo ao fechar o modal ou após criar/excluir.
