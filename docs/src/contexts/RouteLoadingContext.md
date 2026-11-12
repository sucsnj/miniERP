# `src/contexts/RouteLoadingContext.tsx`

> Provider global para portas de carregamento da rota.

## O que faz

- `RouteLoadingProvider` mantém uma contagem de tarefas pendentes da rota atual.
- Enquanto houver tarefas, oculta o conteúdo real e renderiza `PageSkeleton`.
- `/login` e `/setup` continuam visíveis; nas demais rotas a página só aparece quando todas as tarefas iniciais terminarem.
- `usePendingTask(key, pending)` registra uma tarefa enquanto `pending` for `true`.

## Relações

- **Usa:** `useRouter`, `PageSkeleton`.
- **Usado por:** `_app`, settings, sales, monthly-data, products/options, admin, payables e componentes com query inicial.

## Notas

- Tarefas de interação do usuário (busca, OCR, modais e ações) não entram no gate inicial; apenas cargas iniciais.
- O conteúdo permanece montado (`display:none`) para que hooks/effects carreguem e registrem/desregistrem corretamente.
