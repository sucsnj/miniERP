import { useCallback, useRef, useState } from 'react';
import {
  fetchAllMonthly,
  deleteMonthly,
  MonthlySale,
} from '../services/salesService';
import { usePendingTask } from '../contexts/RouteLoadingContext';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info', duration?: number | null) => void;

// Hook que concentra o estado de consolidações mensais e suas ações:
// carregar a lista e excluir um mês consolidado.
export const useMonthlyData = (showToast: ToastFn) => {
  // Lista de consolidações mensais
  const [mensais, setMensais] = useState<MonthlySale[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadedRef = useRef(false);
  usePendingTask('monthly-sales-initial', initialLoading);

  // Busca todas as consolidações mensais e atualiza o estado.
  // useCallback mantém a referência estável (usado em useEffect).
  const loadMensais = useCallback(async () => {
    const isInitial = !initialLoadedRef.current;
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const date = await fetchAllMonthly();
      setMensais(date);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      initialLoadedRef.current = true;
    }
  }, []);

  // Exclui a consolidação de um mês e recarrega a lista
  const handleDelete = async (id: string) => {
    try {
      await deleteMonthly(id);
      loadMensais();
      showToast('Mês excluído com sucesso.', 'success');
    } catch {
      showToast('Erro ao excluir mês.', 'error');
    }
  };

  return {
    mensais,
    initialLoading,
    refreshing,
    loadMensais,
    handleDelete,
  };
};