import { useCallback } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  clearTableHistory,
  fetchTableHistory,
  fetchTableStatus,
  searchTable,
  uploadTable,
  type TableRow,
  type TabelaSearchResponse,
  type TableSearchHistoryItem,
  type TableUploadResponse,
  type TabelaStatusResponse,
} from '../services/medicineTableService';
import { identityFromUser, tenantQueryKey } from '../utils/queryKeys';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_STATUS: TabelaStatusResponse = {
  loaded: false,
  rowCount: 0,
};

export const useMedicineTable = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const identity = user ? identityFromUser(user) : null;

  const statusQuery = useQuery({
    queryKey: identity
      ? tenantQueryKey(identity, 'medicine-table', 'status')
      : ['medicine-table', 'status'],
    enabled: Boolean(identity),
    staleTime: 1000 * 30,
    queryFn: fetchTableStatus,
  });

  const historyQuery = useQuery({
    queryKey: identity
      ? tenantQueryKey(identity, 'medicine-table', 'history')
      : ['medicine-table', 'history'],
    enabled: Boolean(identity),
    staleTime: 1000 * 60,
    queryFn: fetchTableHistory,
  });

  const medicineTableStatusKey = identity
    ? tenantQueryKey(identity, 'medicine-table', 'status')
    : ['medicine-table', 'status'] as const;

  const medicineTableHistoryKey = identity
    ? tenantQueryKey(identity, 'medicine-table', 'history')
    : ['medicine-table', 'history'] as const;

  const invalidateMedicineTable = useCallback(() => {
    if (!identity) return;
    queryClient.invalidateQueries({
      queryKey: tenantQueryKey(identity, 'medicine-table'),
      refetchType: 'all',
    });
  }, [identity, queryClient]);

  const search = useMutation({
    mutationFn: (term: string): Promise<TabelaSearchResponse> => searchTable(term),
    onSettled: () => {
      if (!identity) return;
      queryClient.invalidateQueries({ queryKey: medicineTableHistoryKey });
    },
  });

  const upload = useMutation({
    mutationFn: (formData: FormData): Promise<TableUploadResponse> => uploadTable(formData),
    onSuccess: (result) => {
      queryClient.setQueryData<TabelaStatusResponse>(medicineTableStatusKey, (current) => ({
        loaded: true,
        rowCount: result.rowCount ?? current?.rowCount ?? 0,
      }));
    },
    onSettled: invalidateMedicineTable,
  });

  const clearHistory = useMutation({
    mutationFn: clearTableHistory,
    onMutate: async () => {
      if (!identity) {
        return { snapshot: undefined as TableSearchHistoryItem[] | undefined };
      }
      await queryClient.cancelQueries({ queryKey: medicineTableHistoryKey });
      const snapshot = queryClient.getQueryData<TableSearchHistoryItem[]>(medicineTableHistoryKey);
      queryClient.setQueryData<TableSearchHistoryItem[]>(medicineTableHistoryKey, []);
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context?.snapshot && identity) {
        queryClient.setQueryData(medicineTableHistoryKey, context.snapshot);
      }
    },
    onSettled: () => {
      if (!identity) return;
      queryClient.invalidateQueries({ queryKey: medicineTableHistoryKey });
    },
  });

  return {
    status: statusQuery.data ?? DEFAULT_STATUS,
    statusInitialLoading: statusQuery.isLoading,
    statusError: statusQuery.error,
    refreshStatus: statusQuery.refetch,
    history: historyQuery.data ?? [],
    historyInitialLoading: historyQuery.isLoading,
    historyError: historyQuery.error,
    refreshHistory: historyQuery.refetch,
    search,
    upload,
    clearHistory,
  };
};

export type { TableRow, TableSearchHistoryItem, TableUploadResponse, TabelaSearchResponse, TabelaStatusResponse };
