import { useEffect } from 'react';

interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  position?:
    | 'top-right'
    | 'bottom-right'
    | 'top-left'
    | 'top-center'
    | 'local-top-right'
    | 'local-top-left';
  duration?: number | null;
}

const Toast: React.FC<ToastProps> = ({ open, message, type = 'info', onClose, position = 'top-right', duration = 3000}) => {
  useEffect(() => {
    if (!open) return;
    if (duration == null) return;

    const timer = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className={`toast toast-${type} toast-${position}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" aria-label="Fechar" onClick={onClose}>
        ×
      </button>
      <style jsx>{`
        .toast {
          position: fixed;
          z-index: 1000;
          min-width: 260px;
          max-width: calc(100% - 40px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
          color: #ffffff;
          font-weight: 600;
          line-height: 1.2;
        }

        .toast-top-right,
        .toast-bottom-right,
        .toast-top-left,
        .toast-top-center {
          position: fixed;
        }

        .toast-local-top-right,
        .toast-local-top-left {
          position: absolute;
        }

        .toast-top-right {
          top: 20px;
          right: 20px;
        }

        .toast-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .toast-top-left {
          top: 20px;
          left: 20px;
        }

        .toast-top-center {
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        .toast-local-top-right {
          top: 20px;
          right: 20px;
        }

        .toast-local-top-left {
          top: 20px;
          left: 20px;
        }

        .toast-info {
          background: var(--accent);
        }

        .toast-success {
          background: var(--success);
        }

        .toast-error {
          background: var(--danger);
        }

        button {
          border: none;
          background: transparent;
          color: var(--foreground);
          font-size: 1.25rem;
          cursor: pointer;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Toast;
