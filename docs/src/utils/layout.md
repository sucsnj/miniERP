# `src/utils/layout.ts`

> Primitivas inline de layout compartilhadas.

## O que faz

- `CARDS_GRID_STYLE`: grade responsiva compartilhada (`repeat(auto-fit, minmax(280px, 1fr))`).
- `MASONRY_STYLE`: container em colunas masonry (`columnWidth: 260px`, `columnGap: 12px`).
- `MASONRY_CARD_STYLE`: card confinado em coluna usando `display: flow-root`, sem flex no item de masonry e sem quebra entre colunas.
- `MASONRY_FORM_STYLE`: wrapper de formulário confinado em coluna.

## Relações

- **Usado por:** `src/pages/settings.tsx`, `src/pages/admin.tsx`, `src/pages/profile.tsx`.

## Notas

- As constantes retornam `CSSProperties` e são passadas diretamente em `style`.
- O layout masonry respeita altura variável dos cards.
