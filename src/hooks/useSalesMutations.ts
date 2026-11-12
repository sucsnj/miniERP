import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteSale,
  registerSale,
  updateSale,
  type DailySale,
  type SaleItemInput,
} from '../services/salesService';
import { useAuth } from '../contexts/AuthContext';
import { identityFromUser } from '../utils/queryKeys';

type QueryWithKey = { queryKey: readonly unknown[] };

const salesDailyPredicate = (tenantId: { companyId: string; storeId: string }) => (query: QueryWithKey) => {
  const queryKey = query.queryKey;
  return queryKey[0] === 'tenant'
    && queryKey[1] === tenantId.companyId
    && queryKey[2] === tenantId.storeId
    && queryKey[3] === 'sales'
    && queryKey[4] === 'daily';
};

const monthlyPredicate = (tenantId: { companyId: string; storeId: string }) => (query: QueryWithKey) => {
  const queryKey = query.queryKey;
  return queryKey[0] === 'tenant'
    && queryKey[1] === tenantId.companyId
    && queryKey[2] === tenantId.storeId
    && queryKey[3] === 'monthly-sales';
};
const saleItemsPredicate = (tenantId: { companyId: string; storeId: string }) => (query: QueryWithKey) => {
  const queryKey = query.queryKey;
  return queryKey[0] === 'tenant'
    && queryKey[1] === tenantId.companyId
    && queryKey[2] === tenantId.storeId
    && queryKey[3] === 'sale-items';
};
const monthlyAndItemsPredicate = (tenantId: { companyId: string; storeId: string }) => (query: QueryWithKey) => {
  return monthlyPredicate(tenantId)(query) || saleItemsPredicate(tenantId)(query);
};
const invalidateTenantSales = (queryClient: ReturnType<typeof useQueryClient>, tenantId: { companyId: string; storeId: string }) => {
  queryClient.invalidateQueries({ predicate: salesDailyPredicate(tenantId), refetchType: 'all' });
};

const invalidateTenantSalesAux = (queryClient: ReturnType<typeof useQueryClient>, tenantId: { companyId: string; storeId: string }) => {
  queryClient.invalidateQueries({ predicate: monthlyAndItemsPredicate(tenantId), refetchType: 'all' });
};

const passesSalesFilter = (queryKey: readonly unknown[], amount: number) => {
  const filter = queryKey[7];
  if (filter === 'todas') return true;
  if (filter === 'positivas') return amount > 0;
  if (filter === 'negativas') return amount <= 0;
  return true;
};

const insertIntoSalesCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: { companyId: string; storeId: string },
  sale: DailySale,
) => {
  const entries = queryClient.getQueriesData<DailySale[]>({ predicate: salesDailyPredicate(tenantId) });
  const saleParts = sale.date.split('-').map(Number);
  const saleMonth = saleParts[1];
  const saleYear = saleParts[0];

  return entries.map(([queryKey, data]) => {
    if (!Array.isArray(data)) return { queryKey, data };
    if (queryKey[5] !== saleMonth || queryKey[6] !== saleYear) return { queryKey, data };
    const next = passesSalesFilter(queryKey, sale.amount) ? [sale, ...data] : data;
    queryClient.setQueryData<DailySale[]>(queryKey, next);
    return { queryKey, data };
  });
};

const snapshotSales = (queryClient: ReturnType<typeof useQueryClient>, tenantId: { companyId: string; storeId: string }) => {
  return queryClient.getQueriesData<DailySale[]>({ predicate: salesDailyPredicate(tenantId) });
};

const restoreSales = (
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: Array<[readonly unknown[], DailySale[] | undefined]>,
) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData<DailySale[] | undefined>(queryKey, data);
  });
};

interface CreateSaleInput {
  date: string;
  amount: number;
  notes?: string;
  items: SaleItemInput[];
  createdAt?: string;
}

interface UpdateSaleInput {
  id: string;
  date: string;
  amount: number;
  notes?: string;
  items?: SaleItemInput[];
}

interface DeleteSaleInput {
  id: string;
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: CreateSaleInput) =>
      registerSale(input.date, input.amount, input.notes, input.items),
    onMutate: async (input) => {
      if (!tenantId) return { tenantId, snapshots: [] as Array<[readonly unknown[], DailySale[] | undefined]> };
      await queryClient.cancelQueries({ predicate: salesDailyPredicate(tenantId) });
      const snapshots = snapshotSales(queryClient, tenantId);
      insertIntoSalesCache(queryClient, tenantId, {
        id: `optimistic-${Date.now()}`,
        date: input.date,
        amount: input.amount,
        notes: input.notes,
        createdAt: input.createdAt ?? new Date().toISOString(),
      });
      return { tenantId, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.tenantId) return;
      restoreSales(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.tenantId) return;
      invalidateTenantSales(queryClient, context.tenantId);
      invalidateTenantSalesAux(queryClient, context.tenantId);
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: UpdateSaleInput) =>
      updateSale(input.id, input.date, input.amount, input.notes, input.items),
    onMutate: async (input) => {
      if (!tenantId) return { tenantId, snapshots: [] as Array<[readonly unknown[], DailySale[] | undefined]> };
      await queryClient.cancelQueries({ predicate: salesDailyPredicate(tenantId) });
      const snapshots = snapshotSales(queryClient, tenantId);
      queryClient.setQueriesData<DailySale[]>({ predicate: salesDailyPredicate(tenantId) }, (current) =>
        current?.map((sale) =>
          sale.id === input.id ? { ...sale, date: input.date, amount: input.amount, notes: input.notes } : sale
        )
      );
      return { tenantId, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.tenantId) return;
      restoreSales(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, input, context) => {
      if (!context?.tenantId) return;
      invalidateTenantSales(queryClient, context.tenantId);
      invalidateTenantSalesAux(queryClient, context.tenantId);
      queryClient.invalidateQueries({ predicate: saleItemsPredicate(context.tenantId), refetchType: 'all' });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: DeleteSaleInput) => deleteSale(input.id),
    onMutate: async (input) => {
      if (!tenantId) return { tenantId, snapshots: [] as Array<[readonly unknown[], DailySale[] | undefined]> };
      await queryClient.cancelQueries({ predicate: salesDailyPredicate(tenantId) });
      const snapshots = snapshotSales(queryClient, tenantId);
      queryClient.setQueriesData<DailySale[]>({ predicate: salesDailyPredicate(tenantId) }, (current) =>
        current?.filter((sale) => sale.id !== input.id)
      );
      return { tenantId, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.tenantId) return;
      restoreSales(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.tenantId) return;
      invalidateTenantSales(queryClient, context.tenantId);
      invalidateTenantSalesAux(queryClient, context.tenantId);
    },
  });
}
