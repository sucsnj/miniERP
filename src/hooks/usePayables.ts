import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchAccounts } from '../services/payablesService';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import { identityFromUser, tenantQueryKey } from '../utils/queryKeys';
import { LIVE_TENANT_QUERY_OPTIONS } from '../utils/queryProfiles';

export const usePayables = () => {
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  const allQuery = useQuery({
    queryKey: identity
      ? tenantQueryKey(identity, 'payables', 'all')
      : ['payables', 'disabled', 'all'],
    enabled: Boolean(identity),
    queryFn: () => fetchAccounts(),
    ...LIVE_TENANT_QUERY_OPTIONS,
    placeholderData: keepPreviousData,
  });

  const initialLoading = Boolean(identity && allQuery.isLoading);
  const refreshing = allQuery.isFetching;

  usePendingTask('payables-initial', initialLoading);

  const loadAccounts = useCallback(() => allQuery.refetch(), [allQuery]);

  return {
    accountsMonth: allQuery.data ?? [],
    accountsYear: allQuery.data ?? [],
    initialLoading,
    refreshing,
    loadMonthAccounts: loadAccounts,
    loadYearAccounts: loadAccounts,
  };
};

export type PayablesLoadingState = ReturnType<typeof usePayables>;
