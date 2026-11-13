# `src/pages/_app.tsx`

> Componente raiz do Next.js: envolve todas as páginas com os provedores globais.

## O que faz

- Envolve a aplicação em `RouteLoadingProvider` → `QueryClientProvider` → `AuthProvider` → `SettingsProvider` → `ThemeProvider`.
- Injeta `QueryClientProvider` (`@tanstack/react-query`) para toda a aplicação.
- Configura o `QueryClient` com defaults: `staleTime=5min`, `gcTime=5min`, `retry=2`; queries tenant-scoped (`queryKey[0] === "tenant"`) revalidam sempre no mount/focus/reconnect, preservando dados visíveis enquanto buscam novos.
- Define metadados HTML globais (título "Vendas", descrição e favicon).
- Renderiza `Nav` fora de `AuthGate` e fora de `RouteContent` nas rotas autenticadas: permanece montada, não recarrega e não some durante loading.
- `RouteContent` oculta somente a área da página; `AuthGate` protege a página; `Toaster` continua na raiz.
- Estrutura padrão das telas: `Nav` + `RouteContent(AuthGate(<Component />))` + `Toaster`; `/login` e `/setup` ficam sem Nav.
- Importa o CSS global na ordem `tokens → base → utilities → legacy`.

## Relações

- **Usa:** `src/contexts/RouteLoadingContext`, `src/components/auth/AuthGate`, `src/contexts/AuthContext`, `src/contexts/SettingsContext`, `src/contexts/ThemeContext`, `src/components/common/Nav`, `src/components/common/Toaster`, `src/utils/queryKeys.ts`, `src/styles/{tokens,base,utilities,legacy}.css`.
- **Usado por:** todas as páginas do Pages Router.
- **Complementa:** [_document](_document.md), que aplica o tema antes da hidratação.

## Notas

- A ordem dos imports importa: tokens/base/utilities vêm antes do CSS legado para permitir sobrescrita gradual.
- Ponto de extensão para tratamento de erros e estado global.
