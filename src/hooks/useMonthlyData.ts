import { useCallback, useState } from 'react';
import {
  fetchAllMonthly,
  deleteMonthly,
  MonthlySale,
} from '../services/vendasService';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info', duration?: number | null) => void;

// Hook que concentra o estado de consolidações mensais e suas ações:
// carregar a lista e excluir um mês consolidado.
export const useMonthlyData = (showToast: ToastFn) => {
  // Lista de consolidações mensais
  const [mensais, setMensais] = useState<MonthlySale[]>([]);

  // Busca todas as consolidações mensais e atualiza o estado.
  // useCallback mantém a referência estável (usado em useEffect).
  const loadMensais = useCallback(async () => {
    const data = await fetchAllMonthly();
    setMensais(data);
  }, []);

  // Exclui a consolidação de um mês e recarrega a lista
  const handleDelete = async (id: number) => {
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
    loadMensais,
    handleDelete,
  };
};