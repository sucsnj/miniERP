import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import type { ProductOptions } from '../components/products/ProductForm';
import {
  fetchProducts,
  fetchServices,
  fetchCategories,
  fetchBrands,
  fetchSuppliers,
  fetchUnitsOfMeasure,
  toggleProductStatus,
  deleteProduct,
  deleteService,
  registerProduct,
  updateProduct,
  registerService,
  updateService,
  fetchStockMovements,
  type ItemData,
  type ServiceData,
  type ServiceInput,
  type StockMovementData,
} from '../services/productsService';
import { identityFromUser, tenantQueryKey } from '../utils/queryKeys';
import { MOUNT_TENANT_QUERY_OPTIONS } from '../utils/queryProfiles';
import { useAuth } from '../contexts/AuthContext';

export interface ProductCatalogFilters {
  search: string;
  type: 'PRODUCT' | 'SERVICE' | 'TODOS';
  categoryId: number | '';
  brandId: number | '';
  supplierId: number | '';
  status: 'ATIVO' | 'INATIVO' | 'TODOS';
}

interface CatalogResult {
  catalog: ItemData[];
  total: number;
}

const EMPTY_OPTIONS: ProductOptions = {
  categories: [],
  brands: [],
  suppliers: [],
  unitsOfMeasure: [],
};

export interface ProductSaveInput {
  id: string | null;
  type: 'PRODUCT' | 'SERVICE';
  productPayload: Omit<ItemData, 'id'>;
  servicePayload: ServiceInput;
}

const mapServiceToItem = (service: ServiceData): ItemData => ({
  id: service.id,
  kind: 'SERVICE',
  name: service.name,
  description: service.description,
  categoryId: service.categoryId,
  unit_measure_id: '21',
  brandId: '',
  supplierId: '',
  purchasePrice: 0,
  profitMargin: 0,
  salePrice: service.salePrice,
  stock: 0,
  unit_multiplier: 1,
  totalStock: 0,
  internalCode: service.internalCode,
  reference: service.reference || '',
  duration_minutes: service.duration_minutes,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
  categoryName: service.categoryName,
});

export const useProductsCatalog = (filters: ProductCatalogFilters, options: { enabled?: boolean } = {}) => {
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useQuery({
    queryKey: identity
      ? tenantQueryKey(identity, 'products', 'catalog', { ...filters } as Record<string, unknown>)
      : ['products', 'catalog', filters],

    enabled: Boolean(identity) && options.enabled !== false,
    ...MOUNT_TENANT_QUERY_OPTIONS,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CatalogResult> => {
      const [productsData, servicesData] = await Promise.all([
        filters.type === 'SERVICE'
          ? Promise.resolve(null)
          : fetchProducts({
              search: filters.search || undefined,
              categoryId: filters.categoryId || undefined,
              brandId: filters.brandId || undefined,
              supplierId: filters.supplierId || undefined,
              active: filters.status,
              page: 1,
              pageSize: 10000,
            }),
        filters.type === 'PRODUCT' || filters.status !== 'TODOS'
          ? Promise.resolve(null)
          : fetchServices({
              search: filters.search || undefined,
              categoryId: filters.categoryId || undefined,
              page: 1,
              pageSize: 10000,
            }),
      ]);

      const products = productsData?.items ?? [];
      const services = (servicesData?.items ?? []).map(mapServiceToItem);
      const catalog = [...products, ...services].sort((a, b) => a.name.localeCompare(b.name));
      return { catalog, total: catalog.length };
    },
  });
};

export const useProductsOptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.companyId;
  const storeId = user?.storeId;
  const queryKey = useMemo(
    () =>
      companyId && storeId
        ? tenantQueryKey({ companyId, storeId }, 'products', 'options')
        : (['products', 'options'] as const),
    [companyId, storeId]
  );

  const query = useQuery({
    queryKey,
    enabled: Boolean(companyId && storeId),
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<ProductOptions> => {
      const [categories, brands, suppliers, unitsOfMeasure] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchSuppliers(),
        fetchUnitsOfMeasure(),
      ]);
      return { categories, brands, suppliers, unitsOfMeasure };
    },
  });

  const setOptions = useCallback<Dispatch<SetStateAction<ProductOptions>>>(
    (updater) => {
      queryClient.setQueryData<ProductOptions>(queryKey, (current) => {
        const base = current ?? EMPTY_OPTIONS;
        return typeof updater === 'function' ? updater(base) : updater;
      });
    },
    [queryClient, queryKey]
  );

  return { ...query, data: query.data ?? EMPTY_OPTIONS, setOptions };
};

export const useStockMovements = (itemId: string | null, enabled: boolean) => {
  const { user } = useAuth();
  const identity = user ? identityFromUser(user) : null;

  return useQuery({
    queryKey: identity
      ? tenantQueryKey(identity, 'products', 'stockMovements', { itemId })
      : ['products', 'stockMovements', itemId],
    enabled: Boolean(identity && itemId && enabled),
    staleTime: 1000 * 15,
    queryFn: (): Promise<StockMovementData[]> => fetchStockMovements(itemId as string),
  });
};

export const useProductMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const identity = user ? identityFromUser(user) : null;

  const invalidateCatalog = useCallback(() => {
    if (!identity) return;
    queryClient.invalidateQueries({
      queryKey: ['tenant', identity.companyId, identity.storeId, 'products'],
      refetchType: 'all',
    });
  }, [identity, queryClient]);

  const toggleStatus = useMutation({
    mutationFn: (item: ItemData) => {
      const newStatus = item.active === 1 ? 0 : 1;
      if (item.kind !== 'PRODUCT') {
        throw new Error('A alteração de status está disponível apenas para produtos.');
      }
      return toggleProductStatus(item.id, newStatus);
    },
    onMutate: async (item) => {
      if (!identity) return { identity, snapshots: [] as Array<{ key: readonly unknown[]; data: CatalogResult | undefined }> };
      const keyPrefix = ['tenant', identity.companyId, identity.storeId, 'products', 'catalog'] as const;
      await queryClient.cancelQueries({ queryKey: keyPrefix });
      const queries = queryClient.getQueriesData<CatalogResult>({ queryKey: keyPrefix });
      const snapshots = queries.map(([key, data]) => ({ key, data }));
      for (const [key, data] of queries) {
        if (data) {
          queryClient.setQueryData<CatalogResult>(key, {
            ...data,
            catalog: data.catalog.map((current) =>
              current.id === item.id ? { ...current, active: item.active === 1 ? 0 : 1 } : current
            ),
          });
        }
      }
      return { identity, snapshots };
    },
    onError: (_error, _item, context) => {
      if (!context?.identity || !context.snapshots) return;
      for (const { key, data } of context.snapshots) {
        if (data) queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => invalidateCatalog(),
  });

  const remove = useMutation({
    mutationFn: (item: ItemData) =>
      item.kind === 'SERVICE' ? deleteService(item.id) : deleteProduct(item.id),
    onSettled: () => invalidateCatalog(),
  });

  const save = useMutation({
    mutationFn: (input: ProductSaveInput) => {
      if (input.type === 'SERVICE') {
        return input.id
          ? updateService(input.id, input.servicePayload)
          : registerService(input.servicePayload);
      }

      return input.id
        ? updateProduct(input.id, input.productPayload)
        : registerProduct(input.productPayload);
    },
    onSettled: () => invalidateCatalog(),
  });

  return { toggleStatus, remove, save };
};
