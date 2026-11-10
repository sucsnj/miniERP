import React from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/dialog.module.css';

interface DialogProps {
  open: boolean;
  title?: string;
  titleId?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const Dialog: React.FC<DialogProps> = ({ open, title, titleId, children, onClose }) => {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId ?? (title ? 'dialog-title' : undefined)}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <h3 id={titleId ?? 'dialog-title'} className={styles.title}>{title}</h3> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;
