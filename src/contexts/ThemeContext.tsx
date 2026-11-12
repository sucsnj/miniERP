import { useEffect, type ReactNode } from 'react';
import { useSettings, type ThemeMode } from './SettingsContext';

export type { ThemeMode };

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeMode } = useSettings();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (themeMode === 'system') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = themeMode;
    }
  }, [themeMode]);

  return <>{children}</>;
}

export function useThemeMode(): ThemeContextValue {
  const { themeMode, setThemeMode } = useSettings();
  return { themeMode, setThemeMode };
}
