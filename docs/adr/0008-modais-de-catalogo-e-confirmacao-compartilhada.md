# ADR 0008 — Modais de catálogo unificados e confirmação compartilhada

- **Status:** aceito e implementado (25/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 25/10/2026.

## Contexto

Os cadastros auxiliares tinham oito componentes quase idênticos: criação e edição de categoria, marca, fornecedor e unidade de medida. Cada edição carregava sua própria confirmação de exclusão, e quatro telas de exclusão adicionais viviam em `ProductDeleteModal`. Hooks importavam tipos de componentes de UI, e o estado de criação de marca/fornecedor era separado do estado de edição. Isso duplicava markup, validação visual, IDs e estilos de modal.

## Decisão

1. **`CatalogEntityModal` genérico** em `src/components/catalog/`, declarativo por `fields` (id, label, placeholder, valor, obrigatório, autofocus e `onChange`), com `submitLabel`, IDs de botões e `deleteAction` opcional.
2. **Confirmação compartilhada** via `ConfirmDialog`, agora com `danger`, IDs opcionais de botões, mensagem `React.ReactNode` e CSS Module próprio.
3. **`ProductDeleteModal` delega ao `ConfirmDialog`**; as variantes nomeadas de exclusão dos cadastros auxiliares foram removidas.
4. **Tipos de formulário em `src/types/catalog.ts`**, evitando que hooks importem componentes.
5. **Um único formulário por entidade** nos hooks de marca e fornecedor: criação e edição usam `brandForm`/`supplierForm`; fechar ou concluir limpa o estado.
6. **Contratos de tela preservados**: IDs dos inputs e botões existentes continuam iguais.

## Consequências

**Positivas:**

- Oito arquivos de modal viram um componente e um ponto de evolução.
- Exclusões usam a mesma UI acessível, com backdrop, ESC e foco.
- Hooks deixam de depender de tipos exportados por componentes.
- Menos duplicação de markup e de CSS inline.

**Negativas / aceitas:**

- `CatalogEntityModal` cobre apenas campos de texto simples; formulários mais ricos continuam específicos.
- A confirmação aninhada usa portal com z-index acima do modal (`--z-modal + 1`).
- O modal genérico usa `produtos.module.css` até a extração de um módulo de modal compartilhado.

## Alternativas consideradas

- **Manter oito componentes finos sobre um shell comum:** rejeitado — reduziria só o CSS, não o markup e os estados.
- **Formulário genérico orientado a schema:** rejeitado neste momento — complexidade desnecessária para quatro entidades de texto.
- **Confirmação inline duplicada em cada edição:** rejeitada — mantém quatro cópias do mesmo diálogo.

## Referências

- `src/components/catalog/CatalogEntityModal.tsx`
- `src/components/common/ConfirmDialog.tsx`
- `src/components/products/ProductDeleteModal.tsx`
- `src/types/catalog.ts`
- `src/pages/cadastro.tsx`
- `docs/src/components/catalog/CatalogEntityModal.md`
