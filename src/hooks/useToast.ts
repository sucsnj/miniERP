import { useSyncExternalStore } from 'react';
import {
  dismissToast,
  getServerToastSnapshot,
  getToastSnapshot,
  showToast,
  subscribeToast,
} from '../utils/toast';

// Hook que expõe o estado e os controles de notificações (Toast) a partir do
// store singleton em `utils/toast.ts`. Evita estado local duplicado e permite
// que qualquer página/componente use o mesmo toast global.
export const useToast = () => {
  const toast = useSyncExternalStore(
    subscribeToast,
    getToastSnapshot,
    getServerToastSnapshot
  );

  return {
    toastOpen: toast.open,
    toastMessage: toast.message,
    toastType: toast.type,
    toastDuration: toast.duration,
    showToast,
    closeToast: dismissToast,
  };
};