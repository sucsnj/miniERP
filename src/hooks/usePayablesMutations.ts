import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  registerAccount,
  updateAccount,
  deleteAccount,
  payAccount,
  cancelAccountPayment,
  importAccountsFromXml,
  type AccountDetails,
} from '../services/payablesService';
import {
  deleteInvoice,
  type InvoiceDetails,
} from '../services/invoicesService';
import { useAuth } from '../contexts/AuthContext';
import { identityFromUser, type TenantIdentity } from '../utils/queryKeys';
import {
  isPayablesQuery,
  isInvoicesMonthQuery,
} from '../utils/queryPredicates';

type PayablesSnapshot = Array<[readonly unknown[], AccountDetails[] | undefined]>;
type InvoicesSnapshot = Array<[readonly unknown[], InvoiceDetails[] | undefined]>;

const payablesPredicate = (identity: TenantIdentity) => (query: { queryKey: readonly unknown[] }) =>
  isPayablesQuery(query, identity);

const invoicesMonthPredicate = (identity: TenantIdentity) => (query: { queryKey: readonly unknown[] }) =>
  isInvoicesMonthQuery(query, identity);

const allTenantPayablesPredicate = (identity: TenantIdentity) => payablesPredicate(identity);

const snapshotPayables = (queryClient: ReturnType<typeof useQueryClient>, identity: TenantIdentity) =>
  queryClient.getQueriesData<AccountDetails[]>({ predicate: allTenantPayablesPredicate(identity) }) as PayablesSnapshot;

const snapshotInvoices = (queryClient: ReturnType<typeof useQueryClient>, identity: TenantIdentity) =>
  queryClient.getQueriesData<InvoiceDetails[]>({ predicate: invoicesMonthPredicate(identity) }) as InvoicesSnapshot;

const restorePayables = (queryClient: ReturnType<typeof useQueryClient>, snapshots: PayablesSnapshot) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData<AccountDetails[] | undefined>(queryKey, data);
  });
};

const restoreInvoices = (queryClient: ReturnType<typeof useQueryClient>, snapshots: InvoicesSnapshot) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData<InvoiceDetails[] | undefined>(queryKey, data);
  });
};

const invalidatePayables = (queryClient: ReturnType<typeof useQueryClient>, identity: TenantIdentity) => {
  queryClient.invalidateQueries({ predicate: allTenantPayablesPredicate(identity), refetchType: 'all' });
};

const invalidateInvoices = (queryClient: ReturnType<typeof useQueryClient>, identity: TenantIdentity) => {
  queryClient.invalidateQueries({ predicate: invoicesMonthPredicate(identity), refetchType: 'all' });
};

export interface CreateAccountInput {
  supplierName: string;
  amount: number;
  dueDate: string;
  document: string;
  bankNotes?: string;
}

export interface UpdateAccountInput extends CreateAccountInput {
  id: string;
}

const passesPeriod = (queryKey: readonly unknown[], year: number, month: number, dueDate: string) => {
  const parts = dueDate.split('-').map(Number);
  const [dueDateYear, dueDateMonth] = parts;
  if (!Number.isFinite(dueDateYear) || !Number.isFinite(dueDateMonth)) return false;
  if (queryKey[4] === 'month') {
    return queryKey[5] === dueDateYear && queryKey[6] === dueDateMonth;
  }
  return queryKey[5] === dueDateYear;
};

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      registerAccount(input.supplierName, input.amount, input.dueDate, input.document, input.bankNotes),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as PayablesSnapshot };
      await queryClient.cancelQueries({ predicate: payablesPredicate(identity) });
      const snapshots = snapshotPayables(queryClient, identity);

      const tempAccount: AccountDetails = {
        id: `optimistic-${Date.now()}`,
        supplierName: input.supplierName,
        amount: input.amount,
        dueDate: input.dueDate,
        document: input.document,
        status: 'Pendente',
        bankNotes: input.bankNotes,
        createdAt: new Date().toISOString(),
      };

      const entries = queryClient.getQueriesData<AccountDetails[]>({ predicate: payablesPredicate(identity) });
      const dueDate = input.dueDate;
      entries.forEach(([queryKey, data]) => {
        if (!Array.isArray(data)) return;
        if (!passesPeriod(queryKey, Number(dueDate.split('-')[0]), Number(dueDate.split('-')[1]), dueDate)) return;
        const [year, month] = dueDate.split('-').map(Number);
        if (queryKey[4] === 'month' && (queryKey[5] !== year || queryKey[6] !== month)) return;
        if (queryKey[4] === 'year' && queryKey[5] !== year) return;
        queryClient.setQueryData<AccountDetails[]>(queryKey, [tempAccount, ...data]);
      });

      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restorePayables(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidatePayables(queryClient, context.identity);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: UpdateAccountInput) =>
      updateAccount(input.id, input.supplierName, input.amount, input.dueDate, input.document, input.bankNotes),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as PayablesSnapshot };
      await queryClient.cancelQueries({ predicate: payablesPredicate(identity) });
      const snapshots = snapshotPayables(queryClient, identity);
      queryClient.setQueriesData<AccountDetails[]>({ predicate: payablesPredicate(identity) }, (current) =>
        current?.map((account) =>
          account.id === input.id
            ? {
                ...account,
                supplierName: input.supplierName,
                amount: input.amount,
                dueDate: input.dueDate,
                document: input.document,
                bankNotes: input.bankNotes,
              }
            : account
        )
      );
      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restorePayables(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidatePayables(queryClient, context.identity);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: { id: string }) => deleteAccount(input.id),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as PayablesSnapshot };
      await queryClient.cancelQueries({ predicate: payablesPredicate(identity) });
      const snapshots = snapshotPayables(queryClient, identity);
      queryClient.setQueriesData<AccountDetails[]>({ predicate: payablesPredicate(identity) }, (current) =>
        current?.filter((account) => account.id !== input.id)
      );
      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restorePayables(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidatePayables(queryClient, context.identity);
    },
  });
}

export function usePayAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: { id: string }) => payAccount(input.id),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as PayablesSnapshot };
      await queryClient.cancelQueries({ predicate: payablesPredicate(identity) });
      const snapshots = snapshotPayables(queryClient, identity);
      queryClient.setQueriesData<AccountDetails[]>({ predicate: payablesPredicate(identity) }, (current) =>
        current?.map((account) =>
          account.id === input.id ? { ...account, status: 'Pago' } : account
        )
      );
      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restorePayables(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidatePayables(queryClient, context.identity);
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: { id: string }) => cancelAccountPayment(input.id),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as PayablesSnapshot };
      await queryClient.cancelQueries({ predicate: payablesPredicate(identity) });
      const snapshots = snapshotPayables(queryClient, identity);
      queryClient.setQueriesData<AccountDetails[]>({ predicate: payablesPredicate(identity) }, (current) =>
        current?.map((account) =>
          account.id === input.id ? { ...account, status: 'Pendente' } : account
        )
      );
      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restorePayables(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidatePayables(queryClient, context.identity);
    },
  });
}

export function useImportAccountsFromXml() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: { xml: string }) => importAccountsFromXml(input.xml),
    onSettled: () => {
      if (!identity) return;
      invalidatePayables(queryClient, identity);
      invalidateInvoices(queryClient, identity);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useMutation({
    mutationFn: (input: { id: string }) => deleteInvoice(input.id),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshots: [] as InvoicesSnapshot };
      await queryClient.cancelQueries({ predicate: invoicesMonthPredicate(identity) });
      const snapshots = snapshotInvoices(queryClient, identity);
      queryClient.setQueriesData<InvoiceDetails[]>({ predicate: invoicesMonthPredicate(identity) }, (current) =>
        current?.filter((invoice) => invoice.id !== input.id)
      );
      return { identity, snapshots };
    },
    onError: (_error, _input, context) => {
      if (!context?.identity) return;
      restoreInvoices(queryClient, context.snapshots);
    },
    onSettled: (_data, _error, _input, context) => {
      if (!context?.identity) return;
      invalidateInvoices(queryClient, context.identity);
    },
  });
}
