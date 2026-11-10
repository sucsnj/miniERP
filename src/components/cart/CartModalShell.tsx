/**
 * src/components/cart/CartModalShell.tsx
 *
 * Casca visual compartilhada dos modais de carrinho (CartModal e
 * SelectItemsModal). Concentra overlay/header/footer, portal,
 * focus-trap e fechamento por ESC — fonte única do "chrome" do modal,
 * estilizada pelas classes globais `cart-modal-*` (src/styles/legacy.css).
 * Ver docs/components/CartModalShell.md.
 */

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency } from '../../utils/formatter';
import { useFocusTrap } from '../../utils/focus';
import { useEscClose } from '../../hooks/useEscClose';
import Button from '@/components/common/Button';
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen);
  useEscClose(isOpen, onClose);

  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="cart-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cart-modal-container"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="cart-modal-header">
          <div className="cart-modal-title-group">
            {icon}
            <h3 id={titleId}>{title}</h3>
            {summary.totalItems > 0 && (
              <span className="cart-modal-count-badge">
                {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            className="cart-modal-close-btn"
            onClick={onClose}
            aria-label={closeAriaLabel}
            leftIcon={<CloseIcon fontSize="small" />}
          />
        </div>

        {/* Corpo do Modal */}
        <div className="cart-modal-body">{children}</div>

        {/* Rodapé Fixo */}
        <div className="cart-modal-footer">
          <div className="cart-modal-footer-left">{footerLeft}</div>
          <div className="cart-modal-footer-right">
            <div className="cart-modal-total-summary">
              <span className="total-label">Total:</span>
              <span className="total-amount">{formatCurrency(summary.totalValue, 2)}</span>
            </div>
            <Button type="button" variant="success" className="cart-modal-close-action-btn" onClick={onClose}>
              Concluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CartModalShell;
