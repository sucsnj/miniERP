import { useEffect } from 'react';
import styles from '../../styles/toast.module.css';
import Button from './Button';

type ToastType = 'success' | 'error' | 'info';
type ToastPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'local-top-right'
  | 'local-top-left';

interface ToastProps {
  open: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  position?: ToastPosition;
  duration?: number | null;
}

const typeClasses: Record<ToastType, string> = {
  info: styles.info,
  success: styles.success,
  error: styles.error,
};

const positionClasses: Record<ToastPosition, string> = {
  'top-right': styles.topRight,
  'bottom-right': styles.bottomRight,
  'top-left': styles.topLeft,
  'top-center': styles.topCenter,
  'local-top-right': styles.localTopRight,
  'local-top-left': styles.localTopLeft,
};

const Toast: React.FC<ToastProps> = ({ open, message, type = 'info', onClose, position = 'top-right', duration = 3000}) => {
  useEffect(() => {
    if (!open) return;
    if (duration == null) return;

    const timer = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div
      className={`${styles.toast} ${typeClasses[type]} ${positionClasses[position]}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Fechar"
        onClick={onClose}
        leftIcon={<span>×</span>}
      >
        Fechar
      </Button>
    </div>
  );
};

export default Toast;
