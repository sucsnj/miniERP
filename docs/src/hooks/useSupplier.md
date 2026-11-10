# `src/hooks/useSupplier.ts`

> Hook para gerenciar criação, edição e exclusão de fornecedor no cadastro rápido. Exporta `useSupplier`.

## O que faz

- Controla os modais de cadastro (`supplierModalOpen`) e edição (`supplierEditModalOpen`), ambos usando `supplierForm`.
- Cria fornecedor via `createSupplier`, atualiza `setOptions.suppliers` e seleciona o criado.
- Atualiza/exclui fornecedor, sincroniza opções, ajusta paginação/listagem e fecha modais.

## Relações

- **Usa:** `fetchSuppliers`, `createSupplier`, `deleteSupplier`, `updateSupplier` (`src/services/produtosService.ts`), `SupplierFormData` (`src/types/catalog.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** [cadastro](../pages/cadastro.md), que renderiza [CatalogEntityModal](../components/catalog/CatalogEntityModal.md).

## Notas

- O formulário é limpo ao fechar o modal ou após criar/excluir.
