/**
 * src/components/cart/CartModalShell.tsx
 *
 * Casca visual compartilhada dos modais de carrinho (CartModal e
 * SelectItemsModal). Delega o chrome para AppModalShell.
 * Ver docs/components/CartModalShell.md.
 */

import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import Button from '@/components/common/Button';
import AppModalShell from '@/components/common/AppModalShell';
import type { CartSummary } from '../../utils/cart';

interface CartModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  icon: React.ReactNode;
  closeAriaLabel: string;
  summary: CartSummary;
  footerLeft?: React.ReactNode;
  children: React.ReactNode;
}

export const CartModalShell: React.FC<CartModalShellProps> = ({
  isOpen,
  onClose,
  titleId,
  title,
  icon,
  closeAriaLabel,
  summary,
  footerLeft,
  children,
}) => {
  const footerRight = (
    <>
      <div className="cart-modal-total-summary">
        <span className="total-label">Total:</span>
        <span className="total-amount">{formatCurrency(summary.totalValue, 2)}</span>
      </div>
      <Button type="button" variant="success" className="cart-modal-close-action-btn" onClick={onClose}>
        Concluir
      </Button>
    </>
  );

  const badge = summary.totalItems > 0 ? (
    <span className="cart-modal-count-badge">
      {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'itens'}
    </span>
  ) : null;

  return (
    <AppModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId={titleId}
      icon={icon}
      closeAriaLabel={closeAriaLabel}
      badge={badge}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      {children}
    </AppModalShell>
  );
};

export default CartModalShell;
