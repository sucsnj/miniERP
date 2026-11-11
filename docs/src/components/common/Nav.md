# `src/components/common/Nav.tsx`

> Barra de navegação superior com links das rotas e menu de configurações.

## O que faz

- Links para `/`, `/resumo`, `/historico`, `/payables`, `/medicine-table`, `/products`.
- Menu de configurações (ícone de engrenagem) com a primeira função disponível: alteração de tema (`system`, `light`, `dark`), aplicando `data-theme` em `document.documentElement` e persistindo em `localStorage['themeMode']`.

## Relações

- **Usa:** `next/link`, `nav.module.css`, ícones MUI (`Settings`, `Check`) e `@mui/material/Menu`.
- **Usado por:** layout global (aparece em todas as páginas).

## Notas

- Estado inicial do tema lido do `localStorage` (default `system`); aplicação direta no `document`.
- O tema inicial é aplicado antes da hidratação por [_document](../../pages/_document.md), evitando flash.
- Bloco de logo comentado aguardando melhoria de UI.
