# `src/pages/_app.tsx`

> Componente raiz do Next.js: envolve todas as páginas com os provedores globais.

## O que faz

- Injeta `QueryClientProvider` (`@tanstack/react-query`) para toda a aplicação.
- Define metadados HTML globais (título "Vendas", descrição e favicon).
- Renderiza a navegação global `<Nav />` e o host único de notificações `<Toaster />` (ADR 0003).
- Estrutura padrão das telas: `Nav` + `<Component />` + `Toaster`.
- Importa o CSS global na ordem `tokens → base → utilities → legacy`.

## Relações

- **Usa:** `src/components/common/Nav`, `src/components/common/Toaster`, `src/styles/{tokens,base,utilities,legacy}.css`.
- **Usado por:** todas as páginas do Pages Router.
- **Complementa:** [_document](_document.md), que aplica o tema antes da hidratação.

## Notas

- A ordem dos imports importa: tokens/base/utilities vêm antes do CSS legado para permitir sobrescrita gradual.
- Ponto de extensão para tratamento de erros e estado global.
