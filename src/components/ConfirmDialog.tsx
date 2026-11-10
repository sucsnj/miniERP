import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useShortcuts } from '../utils/shortcuts';
import { useFocusTrap } from '../utils/focus';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const showCancel = Boolean(onCancel && cancelText);

  useFocusTrap(dialogRef, open);

  // Atalhos de teclado
  useShortcuts(['Escape'], () => {
    if (!open) return;
    if (onCancel) onCancel();
    else onConfirm();
  });

  const onClose = () => {
    if (onCancel) onCancel();
    else onConfirm();
  };

  if (!open) return null;

  const dialog = (
    <div className="confirm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-actions">
          {showCancel && (
            <button
              type="button"
              className="confirm-button confirm-cancel"
              onClick={onCancel}
              ref={cancelButtonRef}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="confirm-button confirm-ok"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style jsx>{`
        .confirm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .confirm-dialog {
          width: min(100%, 420px);
          background: var(--surface-strong);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          color: var(--foreground);
          text-align: left;
          outline: none;
        }

        .confirm-dialog h3 {
          margin: 0 0 12px;
          font-size: 22px;
          color: var(--foreground);
        }

        .confirm-dialog p {
          margin: 0 0 24px;
          line-height: 1.6;
          color: var(--muted);
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .confirm-button {
          min-width: 100px;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .confirm-button:focus-visible {
          outline: 3px solid var(--accent);
          outline-offset: 4px;
        }

        .confirm-cancel {
          background: var(--surface-soft);
          color: var(--foreground);
        }

        .confirm-ok {
          background: var(--success);
          color: var(--foreground);
        }

        .confirm-ok:hover {
          background: var(--success);
          opacity: 0.8;
        }

        .confirm-cancel:hover {
          background: var(--surface);
        }
      `}</style>
    </div>
  );

  return createPortal(dialog, document.body);
};

export default ConfirmDialog;
