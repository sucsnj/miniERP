import { useCallback, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchDailySales,
  consolidateMonthly,
  autoConsolidate,
  type DailySale,
} from '../services/salesService';
import { canEdit } from '../utils/edit';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import { identityFromUser, tenantKeys } from '../utils/queryKeys';
import { useDeleteSale } from './useSalesMutations';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

// Opções de configuração do hook
export interface UseSalesOptions {
  // Filtro das vendas a carregar ('positivas' é o usado no dashboard)
  filter?: 'todas' | 'positivas' | 'negativas';
  // Se deve disparar autoConsolidate após carregar (desligado no histórico)
  autoConsolidate?: boolean;
}

export const useSales = (month: number, year: number, showToast: ToastFn, options: UseSalesOptions = {}) => {
  const { user } = useAuth();
  const [editingSale, setEditingSale] = useState<DailySale | null>(null);

  // Aplica os padrões quando a opção não é informada
  const { autoConsolidationEnabled, autoConsolidationDay, autoConsolidationMode } = useSettings();
  const { filter = 'positivas', autoConsolidate: autoConsolidateEnabled = true } = options;
  const identity = user ? identityFromUser(user) : null;

  const queryKey = identity
    ? tenantKeys.salesDaily(identity, month, year, filter)
    : (['sales', 'disabled', month, year, filter] as const);

  const query = useQuery({
    queryKey,
    enabled: Boolean(identity),
    queryFn: () => fetchDailySales(month, year, filter),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

  const initialLoading = Boolean(identity && query.isLoading);
  const refreshing = query.isFetching;

  usePendingTask('sales-initial', initialLoading);

  const loadSales = useCallback(() => query.refetch(), [query]);

  // Auto-consolidação não bloqueia o carregamento da página/tab.
  useEffect(() => {
    if (!query.isSuccess) return;
    if (!autoConsolidateEnabled || !autoConsolidationEnabled || user?.role !== 'admin' || !user.storeId) return;

    void autoConsolidate(user.storeId, autoConsolidationDay, autoConsolidationMode).catch((error) => {
      console.error('Erro ao consolidar mês em segundo plano:', error);
    });
  }, [autoConsolidateEnabled, autoConsolidationEnabled, autoConsolidationDay, autoConsolidationMode, query.isSuccess, user?.role, user?.storeId]);

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

  // Após salvar, fecha o formulário; invalidação é feita pela mutation de atualização
  const handleSaved = () => {
    setEditingSale(null);
  };

  // Exclui uma venda, respeitando a regra de edição/exclusão
  const deleteSaleMutation = useDeleteSale();
  const handleDeleteSale = (id: string) => {
    const sale = query.data?.find((item) => item.id === id);
    // Venda inexistente: avisa e interrompe sem chamar canEdit com date vazia
    if (!sale) {
      showToast('Venda não encontrada.', 'error');
      return;
    }
    // Verifica se a venda ainda pode ser editada/excluída (janela de 2 dias)
    if (!canEdit(sale.date)) {
      showToast('Não é possível editar ou excluir.', 'info');
      return;
    }

    deleteSaleMutation.mutate({ id }, {
      onSuccess: () => showToast('Venda excluída com sucesso.', 'success'),
      onError: () => showToast('Erro ao excluir venda.', 'error'),
    });
  };

  return {
    sales: query.data ?? [],
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
