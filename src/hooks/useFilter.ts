import { useState } from 'react';

// Tipos de filtro disponíveis no histórico de vendas
export type SalesFilter = 'todas' | 'positivas' | 'negativas';

// Chave usada no localStorage para lembrar o último filtro escolhido
const STORAGE_KEY = 'historicoFiltro';

// Valida se o valor salvo é um filtro válido
const isValidFilter = (value: string | null): value is SalesFilter =>
  value === 'todas' || value === 'positivas' || value === 'negativas';

// Hook que gerencia o filtro do histórico, restaurando e persistindo a última
// escolha no localStorage. Usa lazy initializer do useState (em vez de setState
// dentro de useEffect) para evitar renders extras.
export const useFilter = () => {
  const [filter, setFilter] = useState<SalesFilter>(() => {
    // localStorage só existe no navegador; no servidor (SSR) usa o padrão
    if (typeof window === 'undefined') return 'todas';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isValidFilter(saved) ? saved : 'todas';
  });

  // Muda o filtro e grava a escolha no localStorage
  const changeFilter = (value: SalesFilter) => {
    setFilter(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return {
    filter,
    changeFilter,
  };
};