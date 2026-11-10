import Toast from './Toast';
import { useToast } from '../../hooks/useToast';

/**
 * Host global de notificações. Deve ser renderizado uma única vez (em
 * `src/pages/_app.tsx`): lê o store de toasts (`utils/toast.ts`) e exibe o
 * toast ativo na posição padrão (top-right).
 */
const Toaster: React.FC = () => {
  const { toastOpen, toastMessage, toastType, toastDuration, closeToast } = useToast();

  return (
    <Toast
      open={toastOpen}
      message={toastMessage}
      type={toastType}
      duration={toastDuration}
      onClose={closeToast}
      position="top-right"
    />
  );
};

export default Toaster;