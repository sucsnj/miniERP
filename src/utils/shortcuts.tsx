// shortcuts.tsx
import { useEffect } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;

// Função para adicionar atalhos de teclado
const useShortcuts = (shortcuts: string[], callback: (shortcut: string) => void) => {
    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const shortcut = event.code;
            if (shortcuts.includes(shortcut)) {
                event.preventDefault();
                callback(shortcut);
            }
        };

        document.addEventListener('keydown', handleShortcut);

        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, [shortcuts, callback]);
};


const useShortcutsHanlers = (handlers: Record<string, ShortcutHandler>) => {
    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const handler = handlers[event.key];
            if (handler) {
                event.preventDefault();
                handler(event);
            }
        };

        document.addEventListener('keydown', handleShortcut);
        return () => document.removeEventListener('keydown', handleShortcut);
    }, [handlers]);
};

export { useShortcuts, useShortcutsHanlers };