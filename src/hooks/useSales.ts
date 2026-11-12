import { useCallback, useRef, useState } from 'react';
import {
  fetchDailySales,
  consolidateMonthly,
  deleteSale,
  DailySale,
  autoConsolidate
} from '../services/salesService';
import { canEdit } from '../utils/edit';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

// Opções de configuração do hook
export interface UseSalesOptions {
  // Filtro das vendas a carregar ('positivas' é o usado no dashboard)
  filter?: 'todas' | 'positivas' | 'negativas';
  // Se deve disparar autoConsolidate após carregar (desligado no histórico)
  autoConsolidate?: boolean;
}

// Hook que concentra o estado de vendas e todas as ações de vendas:
// carregar, consolidar, fazer backup, editar, salvar e excluir.
export const useSales = (month: number, year: number, showToast: ToastFn, options: UseSalesOptions = {}) => {
  const { user } = useAuth();
  // Lista de vendas diárias do período selecionado
  const [sales, setSales] = useState<DailySale[]>([]);
  // Venda atualmente em edição (null = nenhuma)
  const [editingSale, setEditingSale] = useState<DailySale | null>(null);
  // Carrega dados: initialLoading mantém a página inteira no skeleton da rota até a primeira carga.
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadedRef = useRef(false);
  usePendingTask('sales-initial', initialLoading);

  // Aplica os padrões quando a opção não é informada
  const { filter = 'positivas', autoConsolidate: autoConsolidateEnabled = true } = options;

  // Busca as vendas do mês/year conforme o filtro e, opcionalmente, dispara a consolidação automática.
  // useCallback mantém a referência estável enquanto month/year/filter não mudarem.
  const loadSales = useCallback(async () => {
    const isInitial = !initialLoadedRef.current;
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const date = await fetchDailySales(month, year, filter);
      setSales(date);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      initialLoadedRef.current = true;
    }

    if (autoConsolidateEnabled && user?.role === 'admin' && user.storeId) {
      void autoConsolidate(user.storeId).catch((error) => {
        console.error('Erro ao consolidar mês em segundo plano:', error);
      });
    }
  }, [month, year, filter, autoConsolidateEnabled, user?.role, user?.storeId]);

  // Consolida o mês selecionado e informa o resultado
  const handleConsolidate = async () => {
    try {
      await consolidateMonthly(month, year, user?.storeId);
      showToast('O mês foi consolidado com sucesso.', 'success');
    } catch {
      showToast('Não foi possível consolidar o mês.', 'error');
    }
  };

  // Abre o formulário de edição com a venda selecionada
  const handleEditSale = (sale: DailySale) => {
    setEditingSale(sale);
  };

  // Cancela a edição fechando o formulário
  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  // Após salvar, fecha o formulário e recarrega a lista de vendas
  const handleSaved = () => {
    setEditingSale(null);
    loadSales();
  };

  // Exclui uma venda, respeitando a regra de edição/exclusão
  const handleDeleteSale = async (id: string) => {
    const sale = sales.find((sale) => sale.id === id);
    // Venda inexistente: avisa e interrompe sem chamar canEdit com date vazia
    if (!sale) {
      showToast('Venda não encontrada.', 'error');
      return;
    }
    // Verifica se a venda ainda pode ser editada/excluída (janela de 2 dias)
    const edit = canEdit(sale.date);
    try {
      // mostra outro toast quando a venda tiver mais de 2 dias
      if (edit) {
        await deleteSale(id);
        showToast('Venda excluída com sucesso.', 'success');
        loadSales();
      } else {
        showToast('Não é possível editar ou excluir.', 'info');
      }
    } catch {
      showToast('Erro ao excluir venda.', 'error');
    }
  };

  return {
    sales,
    editingSale,
    initialLoading,
    refreshing,
    loadSales,
    handleConsolidate,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  };
};