# `src/components/common/AppModalShell.tsx`

> Casca visual compartilhada de modais (overlay, header, body, footer, portal, focus-trap e ESC).

## O que faz

- Exibe overlay com fechamento por clique externo e ESC (exceto quando `closeOnEscape={false}`).
- Padroniza cabeçalho, botão fechar, badge opcional e rodapé fixo.
- Mantém foco preso no diálogo e usa `useEscClose`.

```ts
interface AppModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  closeAriaLabel: string;
  children: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  bodyClassName?: string;
  containerClassName?: string;
  closeOnEscape?: boolean;
}
```

## Relações

- **Usa:** `useFocusTrap` (`src/utils/focus.tsx`), `useEscClose` (`src/hooks/useEscClose.ts`) e classes globais `cart-modal-*` (legado).
- **Usado por:** [CartModalShell](../cart/CartModalShell.md) e [PayablesAccountModal](../payables/PayablesAccountModal.md) / [PayablesModals](../payables/PayablesModals.md).

## Notas

- O foco/ESC podem ser desabilitados em modais sobrepostos por `closeOnEscape`.
- Partes internas do visual seguem o padrão global dos modais de carrinho e PIX.
