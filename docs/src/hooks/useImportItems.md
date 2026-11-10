# `src/hooks/useImportItems.ts`

> Hook que concentra estado e lógica do modal de importação de itens via XML de NF-e.

## O que faz

- Processa arquivo XML (`previewInvoiceItems`), valida extensão `.xml` e exibe preview com `ItemWithStatus`.
- Suporta drag/drop, seleção via input, reset e fluxo de importação em lote (`importInvoiceItem`).
- Gerencia estados: `loading`, `importing`, `error`, `completed`, `isDragOver`, `products`, `fileName`.
- Manipula sugestões de nome (`handleItemDescriptionChange`, `handleSelectSuggestion`) e ações de edição/cadastro rápido (abrem páginas com parâmetros).
- Aceita `initialFile` para processar ao abrir modal.

## Relações

- **Usa:** `previewInvoiceItems`, `importInvoiceItem` (`src/services/produtosService.ts`), tipos `ImportedProduct`, `SuggestionItem` (`src/components/import/ItemNameDropdown.tsx`).
- **Usado por:** `src/components/import/ImportItemsModal.tsx`.

## Notas

- Atualiza `products` incrementalmente durante importação em lote (reflete status por item: `idle`, `ok`, `duplicado`, `estoque_atualizado`, `erro`).
- `handleEditItem`/`handleQuickRegister` abrem novas janelas (`window.open`).