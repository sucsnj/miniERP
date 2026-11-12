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
import {
  fetchCompany,
  updateCompanyName,
  fetchStores,
  createStore,
  updateStore,
  fetchMerchants,
  createMerchant,
  updateMerchant,
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
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const storesQuery = useQuery({
    queryKey: identity ? tenantKeys.adminStores(identity) : ['admin', 'stores', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchStores().then((body) => body.stores),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const merchantsQuery = useQuery({
    queryKey: identity ? tenantKeys.adminMerchants(identity) : ['admin', 'merchants', 'disabled'],
    enabled: Boolean(identity),
    queryFn: () => fetchMerchants().then((body) => body.merchants),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const initialLoading = Boolean(identity && (companyQuery.isLoading || storesQuery.isLoading || merchantsQuery.isLoading));
  const refreshing = companyQuery.isFetching || storesQuery.isFetching || merchantsQuery.isFetching;

  usePendingTask('admin', initialLoading);

  const [companyName, setCompanyName] = useState(
    () => companyQuery.data?.name ?? ''
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCompanyName(companyQuery.data?.name ?? '');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [companyQuery.data?.name]);

  const storeDraftsFromList = useCallback((list: StoreAdmin[]) =>
    Object.fromEntries(list.map((store) => [store.id, store.name])), []);

  const [storeDrafts, setStoreDrafts] = useState<Record<string, string>>(() =>
    storeDraftsFromList(storesQuery.data ?? [])
  );
  useEffect(() => {
    if (!storesQuery.data) return;
    const timer = window.setTimeout(() => {
      setStoreDrafts((drafts) => {
        const next = { ...drafts };
        for (const store of storesQuery.data) {
          if (typeof next[store.id] !== 'string') next[store.id] = store.name;
        }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storesQuery.data]);

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
    mutationFn: (name: string) => updateCompanyName(name),
    onSuccess: () => {
      invalidateAdmin();
      void refresh();
      showToast('Empresa atualizada.', 'success');
    },
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar empresa.', 'error'),
  });

  const createStoreMutation = useMutation({
    mutationFn: (name: string) => createStore(name),
    onSuccess: () => {
      invalidateAdmin();
      showToast('Loja criada.', 'success');
    },
    onError: (error) =>
      showToast(error instanceof Error ? error.message : 'Erro ao criar loja.', 'error'),
  });

  const updateStoreMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; active?: boolean }) => updateStore(input),
    onMutate: async (input) => {
      if (!identity) return { identity, snapshot: [] as StoreAdmin[] | undefined };
      await queryClient.cancelQueries({ queryKey: tenantKeys.adminStores(identity) });
      const previous = queryClient.getQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity));
      queryClient.setQueryData<StoreAdmin[]>(tenantKeys.adminStores(identity), (current) =>
        current?.map((store) =>
          store.id === input.id
            ? {
                ...store,
                name: input.name ?? store.name,
                active: input.active ?? store.active,
              }
            : store
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
    mutationFn: (input: MerchantDraft) =>
      createMerchant({
        name: input.name,
        login: input.login.toLowerCase(),
        email: input.email.trim(),
        password: input.password,
        storeIds: input.storeIds,
        avatarUrl: input.avatarUrl.trim() || undefined,
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
                avatarUrl: typeof input.avatarUrl === 'undefined' ? merchant.avatarUrl : input.avatarUrl,
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

  const saveCompany = useCallback(() => {
    if (!identity) return;
    saveCompanyMutation.mutate(companyName);
  }, [companyName, identity, saveCompanyMutation]);

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
    (store: StoreAdmin) => {
      const name = (storeDrafts[store.id] ?? store.name).trim();
      if (!name) {
        showToast('Informe o nome da loja.', 'error');
        return;
      }
      updateStoreMutation.mutate({ id: store.id, name });
    },
    [storeDrafts, showToast, updateStoreMutation]
  );

  const toggleStore = useCallback(
    (store: StoreAdmin) => {
      updateStoreMutation.mutate({ id: store.id, active: !store.active });
    },
    [updateStoreMutation]
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
        avatarUrl: draft.avatarUrl ?? null,
      });
    },
    [merchantDrafts, showToast, updateMerchantMutation]
  );

  const createMerchantDraft = useCallback(
    (draft: MerchantDraft) => {
      const trimmed = {
        name: draft.name.trim(),
        login: draft.login.toLowerCase().trim(),
        email: draft.email.trim(),
        password: draft.password,
        storeIds: [...new Set(draft.storeIds)],
        avatarUrl: draft.avatarUrl.trim() || undefined,
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

      createMerchantMutation.mutate({ ...trimmed, avatarUrl: trimmed.avatarUrl ?? '' });
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
    companyName,
    setCompanyName,
    storeDrafts,
    setStoreDrafts,
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
    createMerchant: createMerchantDraft,
    saveMerchant: saveMerchantDraft,
    resetMerchantPassword: resetMerchantPasswordDraft,
    createMerchantBusy: createMerchantMutation.isPending,
  };
};

export type UseAdminResult = ReturnType<typeof useAdmin>;
export type { CompanySummary, MerchantAdmin, StoreAdmin };
