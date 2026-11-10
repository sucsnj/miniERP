import { useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { useShortcuts } from '../../utils/shortcuts';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/confirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  confirmButtonId?: string;
  cancelButtonId?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText,
  danger = false,
  confirmButtonId,
  cancelButtonId,
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
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className={styles.title}>{title}</h3>
        <div id="confirm-dialog-message" className={styles.message}>{message}</div>
        <div className={styles.actions}>
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              ref={cancelButtonRef}
              id={cancelButtonId}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            ref={confirmButtonRef}
            id={confirmButtonId}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};

export default ConfirmDialog;
