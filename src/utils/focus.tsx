// focus.tsx
import { useEffect } from 'react';

let focusTrapCount = 0;

// Focus trap
const useFocusTrap = (dialogRef: React.RefObject<HTMLElement | null>, open: boolean) => {
    useEffect(() => {
        if (!open) return;

        focusTrapCount += 1;
        document.body.classList.add('modal-open');

        const focusableSelectors = [
            'a[href]',
            'button',
            'textarea',
            'input',
            'select',
            '[tabindex]:not([tabindex="-1"])',
        ];

        const getFocusableElements = () =>
            dialogRef.current
                ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(',')))
                : [];

        const previousActiveElement = document.activeElement as HTMLElement | null;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) return;

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const timeoutId = window.setTimeout(() => {
            getFocusableElements()[0]?.focus();
        }, 0);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.clearTimeout(timeoutId);
            focusTrapCount -= 1;
            if (focusTrapCount <= 0) {
                focusTrapCount = 0;
                document.body.classList.remove('modal-open');
            }
            previousActiveElement?.focus();
        };
    }, [open, dialogRef]);
};

export { useFocusTrap };
