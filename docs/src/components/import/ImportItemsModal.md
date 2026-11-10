# `src/components/import/ImportItemsModal.tsx`

> Modal de importação de produtos via XML de NF-e (preview + importação em lote).

## O que faz

- Dropzone (drag&drop/clique, `.xml`), preview dos itens e tabela com status por linha.
- Vincula cada item via [ItemNameDropdown](./ItemNameDropdown.md); "Cadastro rápido"/"Editar item" abrem `/cadastro` em nova aba.
- "Importar N produto(s)" executa o lote, mostra o resumo final e chama `onImportSuccess()`.

```ts
interface ImportItemsModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
  initialFile?: File | null;
}
```

## Relações

- **Usa:** `useImportItems` (`src/hooks/useImportItems.ts`), [ItemNameDropdown](./ItemNameDropdown.md), `produtosService`, `modalImport.module.css`.
- **Usado por:** `../../pages/cadastro.md`.

## Notas

- Refatorado de um módulo misto (~587 linhas): hook, dropdown e serviços foram extraídos; `ImportedProduct` foi para `produtosService.ts`.
- Identificadores internos migrados para inglês (ADR 0004).
