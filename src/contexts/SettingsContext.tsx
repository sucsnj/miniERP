import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { readStoredBoolean, readStoredNumber, readStoredString, writeStoredValue } from '../utils/storage';

export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;

interface SettingsContextValue {
  recentSalesCount: RecentSalesCount;
  setRecentSalesCount: (value: RecentSalesCount) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  autoFocusSaleInput: boolean;
  setAutoFocusSaleInput: (value: boolean) => void;
  autoFocusSaleInputDelay: number;
  setAutoFocusSaleInputDelay: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const VALID_COUNTS: RecentSalesCount[] = [0, 2, 4, 6, 8];

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [recentSalesCount, setRecentSalesCountState] = useState<RecentSalesCount>(4);
  const [timezone, setTimezoneState] = useState<string>('America/Recife');
  const [autoFocusSaleInput, setAutoFocusSaleInputState] = useState(true);
  const [autoFocusSaleInputDelay, setAutoFocusSaleInputDelayState] = useState(60);

  useEffect(() => {
    const saved = readStoredNumber('recentSalesCount', 4);
    if (VALID_COUNTS.includes(saved as RecentSalesCount)) {
      const id = window.setTimeout(() => setRecentSalesCountState(saved as RecentSalesCount), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    const saved = readStoredString('timezone', 'America/Recife');
    const id = window.setTimeout(() => setTimezoneState(saved), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const saved = readStoredBoolean('autoFocusSaleInput', true);
    const id = window.setTimeout(() => setAutoFocusSaleInputState(saved), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const saved = readStoredNumber('autoFocusSaleInputDelay', 60);
    const delay = Number.isFinite(saved) && saved >= 5 ? saved : 60;
    const id = window.setTimeout(() => setAutoFocusSaleInputDelayState(delay), 0);
    return () => window.clearTimeout(id);
  }, []);

  const setRecentSalesCount = (value: RecentSalesCount) => {
    setRecentSalesCountState(value);
    writeStoredValue('recentSalesCount', value);
  };

  const setTimezone = (value: string) => {
    setTimezoneState(value);
    writeStoredValue('timezone', value);
    if (typeof document !== 'undefined') {
      document.cookie = `timezone=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const setAutoFocusSaleInput = (value: boolean) => {
    setAutoFocusSaleInputState(value);
    writeStoredValue('autoFocusSaleInput', value);
  };

  const setAutoFocusSaleInputDelay = (value: number) => {
    const delay = Number.isFinite(value) && value >= 5 ? Math.floor(value) : 60;
    setAutoFocusSaleInputDelayState(delay);
    writeStoredValue('autoFocusSaleInputDelay', delay);
  };

  return (
    <SettingsContext.Provider
      value={{
        recentSalesCount,
        setRecentSalesCount,
        timezone,
        setTimezone,
        autoFocusSaleInput,
        setAutoFocusSaleInput,
        autoFocusSaleInputDelay,
        setAutoFocusSaleInputDelay,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
