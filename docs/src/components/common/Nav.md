# `src/components/common/Nav.tsx`

> Barra superior autenticada com links, seletor de loja e logout.

## O que faz

- Links para `/`, `/summary`, `/history`, `/payables`, `/medicine-table`, `/products`.
- Seletor de loja: admin vê todas as lojas ativas da empresa; merchant, apenas lojas autorizadas.
- Mostra nome do usuário e acesso a Settings apenas para `admin`.
- Botão de logout revoga a sessão atual.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), `next/link`, ícones MUI, `nav.module.css`, `/api/stores`.
- **Usado por:** layout global (fora de `/login` e `/setup`).

## Notas

- Troca de loja chama `POST /api/stores` e depois `refresh()` do contexto.
- Settings é ocultado para merchant.
