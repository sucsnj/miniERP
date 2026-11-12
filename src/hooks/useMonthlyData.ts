import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllMonthly,
  deleteMonthly,
  consolidateMonthly,
  type MonthlySale,
} from '../services/salesService';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import { identityFromUser, tenantKeys } from '../utils/queryKeys';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info', duration?: number | null) => void;

export const useMonthlyData = (showToast: ToastFn) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  const query = useQuery({
    queryKey: identity ? tenantKeys.monthlySalesAll(identity) : ['monthly-sales', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchAllMonthly(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const initialLoading = Boolean(identity && query.isLoading);
  const refreshing = query.isFetching;

  usePendingTask('monthly-sales-initial', initialLoading);

  const loadMensais = useCallback(() => query.refetch(), [query]);

  const deleteMonthlyMutation = useMutation({
    mutationFn: (id: string) => deleteMonthly(id),
    onMutate: async (id) => {
      if (!identity) return { identity, snapshot: [] as MonthlySale[] | undefined };
      await queryClient.cancelQueries({ queryKey: tenantKeys.monthlySalesAll(identity) });
      const previous = queryClient.getQueryData<MonthlySale[]>(tenantKeys.monthlySalesAll(identity));
      queryClient.setQueryData<MonthlySale[]>(tenantKeys.monthlySalesAll(identity), (current) =>
        current?.filter((item) => item.id !== id)
      );
      return { identity, snapshot: previous };
    },
    onError: (_error, _id, context) => {
      if (!context?.identity) return;
      queryClient.setQueryData<MonthlySale[]>(tenantKeys.monthlySalesAll(context.identity), context.snapshot);
    },
    onSettled: (_data, _error, _id, context) => {
      if (!context?.identity) return;
      queryClient.invalidateQueries({ queryKey: tenantKeys.monthlySalesAll(context.identity), refetchType: 'all' });
    },
  });

  const handleDelete = (id: string) => {
    deleteMonthlyMutation.mutate(id, {
      onSuccess: () => showToast('Mês excluído com sucesso.', 'success'),
      onError: () => showToast('Erro ao excluir mês.', 'error'),
    });
  };

  const consolidateMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      consolidateMonthly(month, year, user?.storeId),
    onSuccess: () => {
      showToast('O mês foi consolidado com sucesso.', 'success');
      queryClient.invalidateQueries({
        queryKey: identity ? tenantKeys.monthlySalesAll(identity) : ['monthly-sales'],
        refetchType: 'all',
      });
    },
    onError: () => showToast('Não foi possível consolidar o mês.', 'error'),
  });

  const handleConsolidate = (month: number, year: number) => {
    consolidateMutation.mutate({ month, year });
  };

  return {
    mensais: query.data ?? [],
    initialLoading,
    refreshing,
    loadMensais,
    handleDelete,
    handleConsolidate,
  };
};
