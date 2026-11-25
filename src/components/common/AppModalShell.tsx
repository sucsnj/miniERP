import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useFocusTrap } from '../../utils/focus';
import { useEscClose } from '../../hooks/useEscClose';
import Button from '@/components/common/Button';

export interface AppModalShellProps {
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
  closeOnOverlayClick?: boolean;
}

export const AppModalShell: React.FC<AppModalShellProps> = ({
  isOpen,
  onClose,
  title,
  titleId,
  icon,
  badge,
  closeAriaLabel,
  children,
  footerLeft,
  footerRight,
  bodyClassName,
  containerClassName,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen);
  useEscClose(isOpen && closeOnEscape, onClose);

  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="cart-modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={containerClassName ? `cart-modal-container ${containerClassName}` : 'cart-modal-container'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-modal-header">
          <div className="cart-modal-title-group">
            {icon ? <span className="cart-modal-icon">{icon}</span> : null}
            <h3 id={titleId}>{title}</h3>
            {badge}
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

        <div className={bodyClassName ?? 'cart-modal-body'}>{children}</div>

        {(footerLeft || footerRight) ? (
          <div className="cart-modal-footer">
            <div className="cart-modal-footer-left">{footerLeft}</div>
            <div className="cart-modal-footer-right">{footerRight}</div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AppModalShell;
