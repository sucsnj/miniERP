# `src/pages/_document.tsx`

> Documento HTML customizado do Pages Router: define idioma e aplica o tema antes da hidratação.

## O que faz

- Renderiza `Html`, `Head`, `Main` e `NextScript` (estrutura obrigatória do Next.js).
- Define `lang="pt-BR"` e `suppressHydrationWarning` no `<html>`.
- Injeta um script inline que lê `localStorage['themeMode']` e aplica `data-theme` em `document.documentElement` antes da pintura, evitando flash de tema.

## Relações

- **Usa:** `next/document`.
- **Usado por:** todas as páginas do Pages Router.
- **Complementa:** [Nav](../components/common/Nav.md), que altera o mesmo `data-theme` em runtime.

## Notas

- O script é somente leitura no servidor; não há handlers nem lógica de aplicação no `_document`.
- `themeMode = 'system'` remove `data-theme`; o CSS resolve o tema por `prefers-color-scheme`.
