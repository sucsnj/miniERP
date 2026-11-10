import { useState } from 'react';

// Tipos de filtro disponíveis no histórico de vendas
export type FiltroVendas = 'todas' | 'positivas' | 'negativas';

// Chave usada no localStorage para lembrar o último filtro escolhido
const STORAGE_KEY = 'historicoFiltro';

// Valida se o valor salvo é um filtro válido
const isFiltroValido = (value: string | null): value is FiltroVendas =>
  value === 'todas' || value === 'positivas' || value === 'negativas';

// Hook que gerencia o filtro do histórico, restaurando e persistindo a última
// escolha no localStorage. Usa lazy initializer do useState (em vez de setState
// dentro de useEffect) para evitar renders extras.
export const useFiltro = () => {
  const [filtro, setFiltro] = useState<FiltroVendas>(() => {
    // localStorage só existe no navegador; no servidor (SSR) usa o padrão
    if (typeof window === 'undefined') return 'todas';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isFiltroValido(saved) ? saved : 'todas';
  });

  // Muda o filtro e grava a escolha no localStorage
  const changeFiltro = (value: FiltroVendas) => {
    setFiltro(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return {
    filtro,
    changeFiltro,
  };
};