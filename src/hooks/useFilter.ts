import { useState } from 'react';
import { readStoredString, writeStoredValue } from '../utils/storage';

export type SalesFilter = 'todas' | 'positivas' | 'negativas';

const STORAGE_KEY = 'historicoFiltro';

const isValidFilter = (value: string | null): value is SalesFilter =>
  value === 'todas' || value === 'positivas' || value === 'negativas';

export const useFilter = () => {
  const [filter, setFilter] = useState<SalesFilter>(() => {
    if (typeof window === 'undefined') return 'todas';
    const saved = readStoredString(STORAGE_KEY);
    return isValidFilter(saved) ? saved : 'todas';
  });

  const changeFilter = (value: SalesFilter) => {
    setFilter(value);
    writeStoredValue(STORAGE_KEY, value);
  };

  return {
    filter,
    changeFilter,
  };
};
