import { useCallback, useState } from 'react';
import {
  buscarTodosMensais,
  excluirMensal,
  VendaMensal,
} from '../services/vendasService';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info', duration?: number | null) => void;

// Hook que concentra o estado de consolidações mensais e suas ações:
// carregar a lista e excluir um mês consolidado.
export const useMensais = (showToast: ToastFn) => {
  // Lista de consolidações mensais
  const [mensais, setMensais] = useState<VendaMensal[]>([]);

  // Busca todas as consolidações mensais e atualiza o estado.
  // useCallback mantém a referência estável (usado em useEffect).
  const loadMensais = useCallback(async () => {
    const data = await buscarTodosMensais();
    setMensais(data);
  }, []);

  // Exclui a consolidação de um mês e recarrega a lista
  const handleDelete = async (id: number) => {
    try {
      await excluirMensal(id);
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