import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CompanySettings,
  type CompanySettingsPatch,
  type RecentSalesCount,
  type ThemeMode,
  fetchCompanySettings,
  patchCompanySettings as patchCompanySettingsApi,
  clearPixData,
} from '../services/settingsService';
import {
  readStoredNumber,
  readStoredString,
  removeStoredValue,
  writeStoredValue,
} from '../utils/storage';
import { identityFromUser, tenantKeys } from '../utils/queryKeys';
import { useAuth } from './AuthContext';

export type { CompanySettings, CompanySettingsPatch, RecentSalesCount, ThemeMode };

interface SettingsContextValue {
  companySettings: CompanySettings | null;
  themeMode: ThemeMode;
  themeModeOverride: ThemeMode | null;
  recentSalesCount: RecentSalesCount;
  recentSalesCountOverride: RecentSalesCount | null;
  timezone: string;
  timezoneOverride: string | null;
  autoFocusSaleInput: boolean;
  autoFocusSaleInputOverride: boolean | null;
  autoFocusSaleInputDelay: number;
  autoFocusSaleInputDelayOverride: number | null;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
  setThemeMode: (value: ThemeMode) => void;
  clearThemeMode: () => void;
  setRecentSalesCount: (value: RecentSalesCount) => void;
  clearRecentSalesCount: () => void;
  setTimezone: (value: string) => void;
  clearTimezone: () => void;
  setAutoFocusSaleInput: (value: boolean) => void;
  clearAutoFocusSaleInput: () => void;
  setAutoFocusSaleInputDelay: (value: number) => void;
  clearAutoFocusSaleInputDelay: () => void;
  patchCompanySettings: (patch: CompanySettingsPatch) => Promise<void>;
  clearPixData: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const VALID_COUNTS: RecentSalesCount[] = [0, 2, 4, 6, 8];
const VALID_THEMES: ThemeMode[] = ['system', 'light', 'dark'];
const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  themeMode: 'system',
  timezone: 'America/Recife',
  recentSalesCount: 4,
  autoFocusSaleInput: true,
  autoFocusSaleInputDelay: 60,
  pixKey: '',
  pixName: '',
  pixBank: '',
  pixCity: '',
};

function parseThemeOverride(): ThemeMode | null {
  const saved = readStoredString('themeMode');
  return VALID_THEMES.includes(saved as ThemeMode) ? saved as ThemeMode : null;
}

function parseCountOverride(): RecentSalesCount | null {
  const saved = readStoredNumber('recentSalesCount', Number.NaN);
  return VALID_COUNTS.includes(saved as RecentSalesCount) ? saved as RecentSalesCount : null;
}

function parseDelayOverride(): number | null {
  const saved = readStoredNumber('autoFocusSaleInputDelay', Number.NaN);
  return Number.isFinite(saved) && saved >= 5 ? Math.floor(saved) : null;
}

function parseBooleanOverride(): boolean | null {
  const saved = readStoredString('autoFocusSaleInput', '');
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return null;
}

function parseTimezoneOverride(): string | null {
  return readStoredString('timezone') || null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: identity ? tenantKeys.companySettings(identity) : ['settings', 'company', 'disabled'],
    enabled: Boolean(identity),
    queryFn: fetchCompanySettings,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const companySettings = settingsQuery.data?.companySettings ?? null;
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const [themeModeOverride, setThemeModeOverride] = useState<ThemeMode | null>(null);
  const [recentSalesCountOverride, setRecentSalesCountOverride] = useState<RecentSalesCount | null>(null);
  const [timezoneOverride, setTimezoneOverride] = useState<string | null>(null);
  const [autoFocusSaleInputOverride, setAutoFocusSaleInputOverride] = useState<boolean | null>(null);
  const [autoFocusSaleInputDelayOverride, setAutoFocusSaleInputDelayOverride] = useState<number | null>(null);

  useEffect(() => {
    removeStoredValue('pixKey');
    removeStoredValue('pixName');
    removeStoredValue('pixBank');
    removeStoredValue('pixCity');

    const timer = window.setTimeout(() => {
      setThemeModeOverride(parseThemeOverride());
      setRecentSalesCountOverride(parseCountOverride());
      setTimezoneOverride(parseTimezoneOverride());
      setAutoFocusSaleInputOverride(parseBooleanOverride());
      setAutoFocusSaleInputDelayOverride(parseDelayOverride());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!companySettings) return;
    writeStoredValue('timezoneCompany', companySettings.timezone);
  }, [companySettings]);

  const themeMode = themeModeOverride ?? company.themeMode;
  const recentSalesCount = recentSalesCountOverride ?? company.recentSalesCount;
  const timezone = timezoneOverride ?? company.timezone;
  const autoFocusSaleInput = autoFocusSaleInputOverride ?? company.autoFocusSaleInput;
  const autoFocusSaleInputDelay = autoFocusSaleInputDelayOverride ?? company.autoFocusSaleInputDelay;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.cookie = `timezone=${encodeURIComponent(timezone)}; path=/; max-age=31536000; SameSite=Lax`;
  }, [timezone]);

  const setThemeMode = (value: ThemeMode) => {
    setThemeModeOverride(value);
    writeStoredValue('themeMode', value);
  };

  const clearThemeMode = () => {
    setThemeModeOverride(null);
    removeStoredValue('themeMode');
  };

  const setRecentSalesCount = (value: RecentSalesCount) => {
    setRecentSalesCountOverride(value);
    writeStoredValue('recentSalesCount', value);
  };

  const clearRecentSalesCount = () => {
    setRecentSalesCountOverride(null);
    removeStoredValue('recentSalesCount');
  };

  const setTimezone = (value: string) => {
    setTimezoneOverride(value);
    writeStoredValue('timezone', value);
  };

  const clearTimezone = () => {
    setTimezoneOverride(null);
    removeStoredValue('timezone');
  };

  const setAutoFocusSaleInput = (value: boolean) => {
    setAutoFocusSaleInputOverride(value);
    writeStoredValue('autoFocusSaleInput', value);
  };

  const clearAutoFocusSaleInput = () => {
    setAutoFocusSaleInputOverride(null);
    removeStoredValue('autoFocusSaleInput');
  };

  const setAutoFocusSaleInputDelay = (value: number) => {
    const delay = Number.isFinite(value) && value >= 5 ? Math.floor(value) : 60;
    setAutoFocusSaleInputDelayOverride(delay);
    writeStoredValue('autoFocusSaleInputDelay', delay);
  };

  const clearAutoFocusSaleInputDelay = () => {
    setAutoFocusSaleInputDelayOverride(null);
    removeStoredValue('autoFocusSaleInputDelay');
  };

  const patchCompanySettingsMutation = useMutation({
    mutationFn: (patch: CompanySettingsPatch) => patchCompanySettingsApi(patch),
    onSuccess: (body) => {
      if (identity) {
        queryClient.setQueryData(
          tenantKeys.companySettings(identity),
          { companySettings: body.companySettings }
        );
      }
    },
  });

  const handlePatchCompanySettings = useCallback(async (patch: CompanySettingsPatch) => {
    await patchCompanySettingsMutation.mutateAsync(patch);
  }, [patchCompanySettingsMutation]);

  const clearPix = useCallback(async () => {
    await clearPixData();
    if (identity) {
      queryClient.invalidateQueries({ queryKey: tenantKeys.companySettings(identity), refetchType: 'all' });
    }
  }, [identity, queryClient]);

  return (
    <SettingsContext.Provider
      value={{
        companySettings,
        themeMode,
        themeModeOverride,
        recentSalesCount,
        recentSalesCountOverride,
        timezone,
        timezoneOverride,
        autoFocusSaleInput,
        autoFocusSaleInputOverride,
        autoFocusSaleInputDelay,
        autoFocusSaleInputDelayOverride,
        pixKey: company.pixKey,
        pixName: company.pixName,
        pixBank: company.pixBank,
        pixCity: company.pixCity,
        setThemeMode,
        clearThemeMode,
        setRecentSalesCount,
        clearRecentSalesCount,
        setTimezone,
        clearTimezone,
        setAutoFocusSaleInput,
        clearAutoFocusSaleInput,
        setAutoFocusSaleInputDelay,
        clearAutoFocusSaleInputDelay,
        patchCompanySettings: handlePatchCompanySettings,
        clearPixData: clearPix,
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
