import { useCallback, useEffect, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { identityFromUser, tenantKeys } from '../utils/queryKeys';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import { LIVE_TENANT_QUERY_OPTIONS } from '../utils/queryProfiles';
import {
  fetchCompany,
  updateCompanyProfile,
  fetchStores,
  createStore,
  updateStoreProfile,
  toggleStoreStatus,
  fetchMerchants,
  createMerchant,
  updateMerchant,
  type CompanyProfileInput,
  type StoreProfileInput,
  type CompanySummary,
  type StoreAdmin,
  type MerchantAdmin,
  type UpdateMerchantPatch,
} from '../services/adminService';

export interface MerchantDraft {
  name: string;
  login: string;
  email: string;
  password: string;
  avatarUrl: string;
  storeIds: string[];
}

const emptyMerchant: MerchantDraft = {
  name: '',
  login: '',
  email: '',
  password: '',
  avatarUrl: '',
  storeIds: [],
};

export const useAdmin = (showToast: (message: string, type?: 'success' | 'error' | 'info') => void) => {
  const { user, refresh } = useAuth();
  const queryClient = useQueryClient();
  const identity = user ? identityFromUser(user) : null;

  const companyQuery = useQuery({
    queryKey: identity ? tenantKeys.adminCompany(identity) : ['admin', 'company', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchCompany().then((body) => body.company),
    ...LIVE_TENANT_QUERY_OPTIONS,
    placeholderData: keepPreviousData,
  });

  const storesQuery = useQuery({
    queryKey: identity ? tenantKeys.adminStores(identity) : ['admin', 'stores', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchStores().then((body) => body.stores),
    ...LIVE_TENANT_QUERY_OPTIONS,
    placeholderData: keepPreviousData,
  });

  const merchantsQuery = useQuery({
    queryKey: identity ? tenantKeys.adminMerchants(identity) : ['admin', 'merchants', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchMerchants().then((body) => body.merchants),
    ...LIVE_TENANT_QUERY_OPTIONS,
    placeholderData: keepPreviousData,
  });

  const initialLoading = Boolean(identity && (companyQuery.isLoading || storesQuery.isLoading || merchantsQuery.isLoading));
  const refreshing = companyQuery.isFetching || storesQuery.isFetching || merchantsQuery.isFetching;

  usePendingTask('admin', initialLoading);

  const [merchantDrafts, setMerchantDrafts] = useState<Record<string, MerchantAdmin>>(() =>
    Object.fromEntries((merchantsQuery.data ?? []).map((merchant) => [merchant.id, merchant]))
  );
  useEffect(() => {
    if (!merchantsQuery.data) return;
    const timer = window.setTimeout(() => {
      setMerchantDrafts((drafts) => {
        const next = { ...drafts };
        for (const merchant of merchantsQuery.data) {
          if (!next[merchant.id]) next[merchant.id] = merchant;
        }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [merchantsQuery.data]);

  const [newMerchant, setNewMerchant] = useState<MerchantDraft>(emptyMerchant);

  const invalidateAdmin = useCallback(() => {
    if (!identity) return;
    queryClient.invalidateQueries({
      queryKey: ['tenant', identity.companyId, identity.storeId, 'admin'],
      refetchType: 'all',
    });
  }, [identity, queryClient]);

  const saveCompanyMutation = useMutation({
    mutationFn: (input: CompanyProfileInput) => updateCompanyProfile(input),
    onSuccess: (body) => {
      if (identity) {
        queryClient.setQueryData(tenantKeys.adminCompany(identity), body.company);
      }
      invalidateAdmin();
      void refresh();
      showToast('Empresa atualizada.', 'success');
    },
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar empresa.', 'error'),
  });

  const createStoreMutation = useMutation({
    mutationFn: (name: string) => createStore(name),
    onSuccess: (body) => {
      if (identity) {
        queryClient.setQueryData<StoreAdmin[]>(
          tenantKeys.adminStores(identity),
          (current) => current ? [...current, body.store] : [body.store]
        );
      }
      invalidateAdmin();
      showToast('Loja criada.', 'success');
    },
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao criar loja.', 'error'),
  });

  const saveStoreMutation = useMutation({
    mutationFn: (input: StoreProfileInput & { id: string }) => updateStoreProfile(input),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshot: [] as StoreAdmin[] | undefined };
      await queryClient.cancelQueries({ queryKey: tenantKeys.adminStores(identity) });
      const previous = queryClient.getQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity));
      queryClient.setQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity), (current) =>
        current?.map((store) =>
          store.id === input.id ? { ...store, ...input } : store
        )
      );
      return { identity, snapshot: previous };
    },
    onError: (_error, _input, context): void => {
      if (!context?.identity) return;
      queryClient.setQueryData<StoreAdmin[]>(tenantKeys.adminStores(context.identity), context.snapshot);
      showToast('Erro ao atualizar loja.', 'error');
    },
    onSettled: () => {
      invalidateAdmin();
      void refresh();
    },
  });

  const toggleStoreStatusMutation = useMutation({
    mutationFn: (input: { id: string; active: boolean }) => toggleStoreStatus(input),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshot: [] as StoreAdmin[] | undefined };
      await queryClient.cancelQueries({ queryKey: tenantKeys.adminStores(identity) });
      const previous = queryClient.getQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity));
      queryClient.setQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity), (current) =>
        current?.map((store) =>
          store.id === input.id ? { ...store, active: input.active } : store
        )
      );
      return { identity, snapshot: previous };
    },
    onError: (_error, _input, context): void => {
      if (!context?.identity) return;
      queryClient.setQueryData<StoreAdmin[]>(tenantKeys.adminStores(context.identity), context.snapshot);
      showToast('Erro ao atualizar loja.', 'error');
    },
    onSettled: () => {
      invalidateAdmin();
      void refresh();
    },
  });

  const createMerchantMutation = useMutation({
    mutationFn: (input: Omit<MerchantDraft, 'avatarUrl'>) =>
      createMerchant({
        name: input.name,
        login: input.login.toLowerCase(),
        email: input.email.trim(),
        password: input.password,
        storeIds: input.storeIds,
      }),
    onSuccess: () => {
      invalidateAdmin();
      showToast('Vendedor criado.', 'success');
      setNewMerchant(emptyMerchant);
    },
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao criar vendedor.', 'error'),
  });

  const updateMerchantMutation = useMutation({
    mutationFn: (input: UpdateMerchantPatch & { id: string }) => updateMerchant(input),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshot: [] as MerchantAdmin[] | undefined };
      await queryClient.cancelQueries({ queryKey: tenantKeys.adminMerchants(identity) });
      const previous = queryClient.getQueryData<MerchantAdmin[]>(tenantKeys.adminMerchants(identity));
      queryClient.setQueryData<MerchantAdmin[]>(tenantKeys.adminMerchants(identity), (current) =>
        current?.map((merchant): MerchantAdmin =>
          merchant.id === input.id
            ? {
                ...merchant,
                name: input.name ?? merchant.name,
                login: input.login ?? merchant.login,
                email: input.email ?? merchant.email,
                active: input.active ?? merchant.active,
                storeIds: input.storeIds ?? merchant.storeIds,
              }
            : merchant
        )
      );
      return { identity, snapshot: previous };
    },
    onError: (_error, _input, context): void => {
      if (!context?.identity) return;
      queryClient.setQueryData<MerchantAdmin[]>(tenantKeys.adminMerchants(context.identity), context.snapshot);
      showToast('Erro ao atualizar vendedor.', 'error');
    },
    onSettled: () => invalidateAdmin(),
  });

  const resetMerchantPasswordMutation = useMutation({
    mutationFn: (input: { id: string; password: string }) =>
      updateMerchant({ id: input.id, password: input.password }),
    onSuccess: () => showToast('Senha redefinida.', 'success'),
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao redefinir senha.', 'error'),
  });

  const saveCompany = useCallback((input: CompanyProfileInput) => {
    saveCompanyMutation.mutate(input);
  }, [saveCompanyMutation]);

  const createStoreDraft = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        showToast('Informe o nome da loja.', 'error');
        return;
      }
      createStoreMutation.mutate(trimmed);
    },
    [createStoreMutation, showToast]
  );

  const saveStoreDraft = useCallback(
    (input: StoreProfileInput & { id: string }) => {
      saveStoreMutation.mutate(input);
    },
    [saveStoreMutation]
  );

  const toggleStore = useCallback(
    (store: StoreAdmin) => {
      toggleStoreStatusMutation.mutate({ id: store.id, active: !store.active });
    },
    [toggleStoreStatusMutation]
  );

  const toggleNewMerchantStore = useCallback((storeId: string, selected: boolean) => {
    setNewMerchant((current) => ({
      ...current,
      storeIds: selected
        ? [...new Set([...current.storeIds, storeId])]
        : current.storeIds.filter((item) => item !== storeId),
    }));
  }, []);

  const toggleMerchantStore = useCallback(
    (merchantId: string, storeId: string, selected: boolean) => {
      setMerchantDrafts((current) => {
        const draft = current[merchantId];
        if (!draft) return current;
        return {
          ...current,
          [merchantId]: {
            ...draft,
            storeIds: selected
              ? [...new Set([...draft.storeIds, storeId])]
              : draft.storeIds.filter((item) => item !== storeId),
          },
        };
      });
    },
    []
  );

  const updateMerchantDraft = useCallback(
    (merchantId: string, patch: Partial<MerchantAdmin>) => {
      setMerchantDrafts((current) => {
        const draft = current[merchantId];
        if (!draft) return current;
        return { ...current, [merchantId]: { ...draft, ...patch } };
      });
    },
    []
  );

  const saveMerchantDraft = useCallback(
    (merchantId: string) => {
      const draft = merchantDrafts[merchantId];
      if (!draft) return;
      const trimmed = {
        name: draft.name.trim(),
        login: draft.login.toLowerCase().trim(),
        email: draft.email.trim(),
      };
      if (!trimmed.name || !trimmed.login || !trimmed.email) {
        showToast('Nome, login e e-mail são obrigatórios.', 'error');
        return;
      }
      updateMerchantMutation.mutate({
        id: merchantId,
        ...trimmed,
        active: draft.active,
        storeIds: draft.storeIds,
      });
    },
    [merchantDrafts, showToast, updateMerchantMutation]
  );

  const updateMerchantAvatar = useCallback(
    (merchantId: string, avatarUrl: string) => {
      setMerchantDrafts((current) =>
        current[merchantId]
          ? {
              ...current,
              [merchantId]: {
                ...current[merchantId],
                avatarUrl,
              },
            }
          : current
      );

      if (identity) {
        queryClient.setQueriesData<MerchantAdmin[] | undefined>(
          { queryKey: tenantKeys.adminMerchants(identity) },
          (current) =>
            current?.map((merchant) =>
              merchant.id === merchantId ? { ...merchant, avatarUrl } : merchant
            )
        );
      }
    },
    [identity, queryClient]
  );

  const createMerchantDraft = useCallback(
    (draft: MerchantDraft) => {
      const trimmed = {
        name: draft.name.trim(),
        login: draft.login.toLowerCase().trim(),
        email: draft.email.trim(),
        password: draft.password,
        storeIds: [...new Set(draft.storeIds)],
      };

      if (!trimmed.name || !trimmed.login || !trimmed.email || !trimmed.password) {
        showToast('Nome, login, e-mail e senha são obrigatórios.', 'error');
        return;
      }

      if (trimmed.login.length < 4) {
        showToast('O login deve ter no mínimo 4 letras.', 'error');
        return;
      }

      if (trimmed.storeIds.length === 0) {
        showToast('Selecione ao menos uma loja para o vendedor.', 'error');
        return;
      }

      createMerchantMutation.mutate(trimmed);
    },
    [createMerchantMutation, showToast]
  );

  const resetMerchantPasswordDraft = useCallback(
    (merchantId: string, password: string) => {
      resetMerchantPasswordMutation.mutate({ id: merchantId, password });
    },
    [resetMerchantPasswordMutation]
  );

  return {
    company: companyQuery.data,
    stores: storesQuery.data ?? [],
    merchants: merchantsQuery.data ?? [],
    initialLoading,
    refreshing,
    merchantDrafts,
    saveCompany,
    createStore: createStoreDraft,
    saveStore: saveStoreDraft,
    toggleStore,
    newMerchant,
    setNewMerchant,
    toggleNewMerchantStore,
    toggleMerchantStore,
    updateMerchantDraft,
    updateMerchantAvatar,
    createMerchant: createMerchantDraft,
    saveMerchant: saveMerchantDraft,
    resetMerchantPassword: resetMerchantPasswordDraft,
    createMerchantBusy: createMerchantMutation.isPending,
  };
};

export type UseAdminResult = ReturnType<typeof useAdmin>;
export type { CompanySummary, MerchantAdmin, StoreAdmin };
