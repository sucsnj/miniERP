import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchAccounts } from '../services/payablesService';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import { identityFromUser, tenantKeys } from '../utils/queryKeys';

export interface UsePayablesParams {
  month: number;
  year: number;
}

export const usePayables = ({ month, year }: UsePayablesParams) => {
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  const monthQuery = useQuery({
    queryKey: identity
      ? tenantKeys.payablesByMonth(identity, year, month)
      : ['payables', 'disabled', 'month', year, month],
    enabled: Boolean(identity),
    queryFn: () => fetchAccounts(year, month),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

  const yearQuery = useQuery({
    queryKey: identity
      ? tenantKeys.payablesByYear(identity, year)
      : ['payables', 'disabled', 'year', year],
    enabled: Boolean(identity),
    queryFn: () => fetchAccounts(year),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

  const initialLoading = Boolean(identity && (monthQuery.isLoading || yearQuery.isLoading));
  const refreshing = monthQuery.isFetching || yearQuery.isFetching;

  usePendingTask('payables-initial', initialLoading);

  const loadMonthAccounts = useCallback(() => monthQuery.refetch(), [monthQuery]);
  const loadYearAccounts = useCallback(() => yearQuery.refetch(), [yearQuery]);

  return {
    accountsMonth: monthQuery.data ?? [],
    accountsYear: yearQuery.data ?? [],
    initialLoading,
    refreshing,
    loadMonthAccounts,
    loadYearAccounts,
  };
};

export type PayablesLoadingState = ReturnType<typeof usePayables>;
