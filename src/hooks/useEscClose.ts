/**
 * src/hooks/useEscClose.ts
 *
 * Fecha um modal/componente quando a tecla ESC é pressionada enquanto `isOpen`.
 * Extraído dos modais de carrinho (fonte única; ver CartModalShell).
 */

import { useEffect } from 'react';

export const useEscClose = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};