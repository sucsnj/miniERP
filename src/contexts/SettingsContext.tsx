import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { readStoredNumber, writeStoredValue } from '../utils/storage';

export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;

interface SettingsContextValue {
  recentSalesCount: RecentSalesCount;
  setRecentSalesCount: (value: RecentSalesCount) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const VALID_COUNTS: RecentSalesCount[] = [0, 2, 4, 6, 8];

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [recentSalesCount, setRecentSalesCountState] = useState<RecentSalesCount>(4);

  useEffect(() => {
    const saved = readStoredNumber('recentSalesCount', 4);
    if (VALID_COUNTS.includes(saved as RecentSalesCount)) {
      const id = window.setTimeout(() => setRecentSalesCountState(saved as RecentSalesCount), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  const setRecentSalesCount = (value: RecentSalesCount) => {
    setRecentSalesCountState(value);
    if (typeof window !== 'undefined') {
    writeStoredValue('recentSalesCount', value);
    }
  };

  return <SettingsContext.Provider value={{ recentSalesCount, setRecentSalesCount }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
