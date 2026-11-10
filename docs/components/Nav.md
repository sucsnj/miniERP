# `src/components/Nav.tsx`

## Descrição

Barra de navegação superior do aplicativo com links para as principais rotas e alternância de tema.

## Contexto

É usado também em todas as páginas do sistema, para navegação entre as páginas.

## Responsabilidades

- Exibir links para as páginas principais.
- Gerenciar modo de tema (`system`, `light`, `dark`) e persistir no `localStorage`.
- Aplicar classes de tema ao elemento `document.documentElement`.

## Dependências

- Material Icons (`@mui/icons-material`)
- Next.js (`next/link`)
- `styles/nav.module.css`
- `utils/notify.ts`

## Observações

- O modo de tema é aplicado diretamente ao `document` e salvo localmente.
