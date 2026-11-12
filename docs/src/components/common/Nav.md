# `src/components/common/Nav.tsx`

> Barra superior autenticada com links, seletor de loja e logout.

## O que faz

- Links para `/`, `/summary`, `/history`, `/payables`, `/medicine-table`, `/products` e, para admin, `/admin`.
- Seletor de loja: admin vê todas as lojas ativas da empresa; merchant, apenas lojas autorizadas.
- Mostra nome do usuário; Settings disponível para admin e merchant (merchant com controles administrativos desabilitados).
- Botão de logout revoga a sessão atual.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), `next/link`, ícones MUI, `nav.module.css`, `/api/stores`.
- **Usado por:** layout global (fora de `/login` e `/setup`).

## Notas

- Troca de loja chama `POST /api/stores`, aplica o usuário atualizado em `AuthContext` e invalida as queries do React Query.
- `AuthGate` remonta as páginas quando `storeId` muda, forçando telas com estado local a carregar a loja selecionada.
- Settings é visível para admin e merchant.
