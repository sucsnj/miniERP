import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { readStoredBoolean, readStoredNumber, readStoredString, removeStoredValue, writeStoredValue } from '../utils/storage';

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
  pixKey: string;
  setPixKey: (value: string) => void;
  pixName: string;
  setPixName: (value: string) => void;
  pixBank: string;
  setPixBank: (value: string) => void;
  pixCity: string;
  setPixCity: (value: string) => void;
  clearPixData: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const VALID_COUNTS: RecentSalesCount[] = [0, 2, 4, 6, 8];

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [recentSalesCount, setRecentSalesCountState] = useState<RecentSalesCount>(4);
  const [timezone, setTimezoneState] = useState<string>('America/Recife');
  const [autoFocusSaleInput, setAutoFocusSaleInputState] = useState(true);
  const [autoFocusSaleInputDelay, setAutoFocusSaleInputDelayState] = useState(60);
  const [pixKey, setPixKeyState] = useState('');
  const [pixName, setPixNameState] = useState('');
  const [pixBank, setPixBankState] = useState('');
  const [pixCity, setPixCityState] = useState('');

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

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPixKeyState(readStoredString('pixKey'));
      setPixNameState(readStoredString('pixName'));
      setPixBankState(readStoredString('pixBank'));
      setPixCityState(readStoredString('pixCity'));
    }, 0);
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

  const setPixKey = (value: string) => {
    setPixKeyState(value);
    writeStoredValue('pixKey', value);
  };

  const setPixName = (value: string) => {
    setPixNameState(value);
    writeStoredValue('pixName', value);
  };

  const setPixBank = (value: string) => {
    setPixBankState(value);
    writeStoredValue('pixBank', value);
  };

  const setPixCity = (value: string) => {
    setPixCityState(value);
    writeStoredValue('pixCity', value);
  };

  const clearPixData = () => {
    setPixKeyState('');
    setPixNameState('');
    setPixBankState('');
    setPixCityState('');
    removeStoredValue('pixKey');
    removeStoredValue('pixName');
    removeStoredValue('pixBank');
    removeStoredValue('pixCity');
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
        pixKey,
        setPixKey,
        pixName,
        setPixName,
        pixBank,
        setPixBank,
        pixCity,
        setPixCity,
        clearPixData,
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
