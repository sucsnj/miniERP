# `src/pages/cadastro.tsx`

> Cadastro/edição de produtos e serviços (`/cadastro`), com códigos de barras, ajuste de estoque e importação XML.

## O que faz

- Dois fluxos: novo (direto ou `?novoImport=1&nome=&purchasePrice=&estoque=&unidade=&ean=&internalCode=`) e edição (`?id=X`).
- Salva produto (`registerProduct`/`updateProduct`) ou serviço (`registerService`/`updateService`) conforme `form.type`; redireciona para `/produtos` após 2s.
- Gerencia múltiplos códigos de barras (`BarcodeManager`) e CRUD auxiliar (categoria, marca, fornecedor, unidade) via hooks.
- Guarda alterações não salvas (`beforeunload` + guard do router + `ConfirmDialog`).

## Relações

- **Usa:** `produtosService`; `ItemForm`, `BarcodeManager`, [CatalogEntityModal](../components/catalog/CatalogEntityModal.md) e modais de estoque/import; hooks `useCategory`, `useBrand`, `useSupplier`, `useUnitOfMeasure`.
- **Usado por:** `./produtos.md` (edição via `?id=`) e `./api/produtos/itens.md` (cadastro rápido).

## Notas

- Cadastro rápido via XML: `preco_venda = preco_compra × 1,5` (margem 50%).
- Ajuste de estoque no formulário não persiste de imediato: soma no campo e exige "Salvar Alterações".
