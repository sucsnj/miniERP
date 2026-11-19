# `src/components/common/Nav.tsx`

> Barra superior com links, seletor de loja e menu do usuário.

## O que faz

- Links para `/`, `/summary`, `/history`, `/payables`, `/medicine-table` e `/products`.
- Sempre visível enquanto a sessão carrega; nesse intervalo mostra skeleton.
- Seletor de loja à direita: admin vê todas as lojas ativas da empresa; merchant, apenas lojas autorizadas.
- Avatar do usuário; sem `avatar_url`/erro de imagem, exibe a inicial do nome.
- Ao clicar no nome/avatar, abre menu com identidade, `Perfil` (somente admin), `Configurações`, `Administração` (somente admin) e `Sair`.
- Botão de logout revoga a sessão atual.
- Em mobile (≤630px), tocar no nome do app abre/fecha um painel lateral à esquerda (largura limitada), vertical, sem ícones e com fonte ligeiramente menor; loja e usuário ficam compactos no canto superior direito.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), `next/link`, ícones MUI, `nav.module.css`, `Skeleton`, `/api/stores`.
- **Usado por:** layout global (`_app`), exceto `/login` e `/setup`.

## Notas

- Links internos usam `<Link prefetch>` (+ prefetch automático do Next por viewport) para prefetching explícito; troca de loja remove queries com prefixo `['tenant']`.
- `AuthGate` remonta as páginas quando `storeId` muda, forçando telas com estado local a carregar a loja selecionada.
- Navbar compacta, fundo `surface-strong`, borda/hairline de destaque, alto contraste e ações agrupadas na ponta direita.
- O menu mobile fecha ao tocar em um link, fora dele ou em `Escape`; `aria-expanded`/`aria-controls` expõem o estado.
