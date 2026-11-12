# `src/components/common/Skeleton.tsx`

> Helpers reutilizáveis de skeleton loading.

## O que faz

- `Skeleton`: bloco com variante (`line`, `title`, `circle`, `button`, `card`, `row`, `block`) e `count`.
- `SkeletonText`: linhas de texto.
- `SkeletonTable`: linhas/colunas para tabelas.
- `SkeletonCards`: grade de cards.
- `PageSkeleton`: página inteira com `PageShell`, header e composição por `layout` (`standard`, `dashboard`, `table`, `settings`, `form`).

## Relações

- **Usa:** `skeleton.module.css`, `PageShell`, `PageHeader`, `Panel`.
- **Usado por:** gate inicial de rota (`RouteContent`), `AuthGate` e skeleton da navbar; não é usado em ações/modais ou refetch.

## Notas

- `SkeletonCards` usa placeholders KPI com largura determinística variável por card.
- Respeita `prefers-reduced-motion: reduce`.
- O helper evita replicar markup/estilos de placeholder por toda a UI.
