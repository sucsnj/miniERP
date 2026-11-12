# `src/contexts/RouteLoadingContext.tsx`

> Provider global para portas de carregamento da rota.

## O que faz

- `RouteLoadingProvider` mantém apenas a contagem de tarefas pendentes; não oculta a navbar.
- `RouteContent` oculta somente a área de conteúdo (`AuthGate` + página) e escolhe o layout do `PageSkeleton` pelo `pathname`: dashboard, table, settings, form ou standard.
- `/login` e `/setup` permanecem visíveis; nas demais rotas o conteúdo só aparece quando todas as tarefas iniciais terminarem.
- `usePendingTask(key, pending)` registra uma tarefa enquanto `pending` for `true`.
- Depois da primeira carga, ações/refresh não entram no gate; dados existentes permanecem visíveis.

## Relações

- **Usa:** `useRouter`, `PageSkeleton`.
- **Usado por:** `_app` (`RouteLoadingProvider` + `RouteContent`), settings, sales, monthly-data, products/options, admin, payables e componentes com query inicial.

## Notas

- Tarefas de interação do usuário (busca, OCR, modais e ações) e refetchs de dados já carregados mantiveram stale-while-revalidate: o conteúdo atual fica visível e o gate de rota não reabre.
- O conteúdo permanece montado (`display:none`) para que hooks/effects carreguem e registrem/desregistrem corretamente.
