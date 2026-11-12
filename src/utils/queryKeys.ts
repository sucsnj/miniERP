import type { AuthUser } from '../contexts/AuthContext';

export const TENANT_QUERY_SEGMENT = 'tenant';

export interface TenantIdentity {
  companyId: string;
  storeId: string;
}

export type QueryPart = string | number | boolean | Record<string, unknown> | null | undefined;

export type SalesFilter = 'positivas' | 'negativas' | 'todas';

export function tenantQueryKey(identity: TenantIdentity, ...parts: readonly QueryPart[]) {
  return [TENANT_QUERY_SEGMENT, identity.companyId, identity.storeId, ...parts] as const;
}

export function tenantQueryRoot(identity: TenantIdentity) {
  return [TENANT_QUERY_SEGMENT, identity.companyId, identity.storeId] as const;
}

export function tenantQueryPredicate(candidate: readonly unknown[]): boolean {
  return candidate[0] === TENANT_QUERY_SEGMENT;
}

export const tenantKeys = {
  salesDaily(identity: TenantIdentity, month: number, year: number, filter: SalesFilter) {
    return tenantQueryKey(identity, 'sales', 'daily', month, year, filter);
  },
  saleItems(identity: TenantIdentity, saleId: string) {
    return tenantQueryKey(identity, 'sale-items', saleId);
  },
  monthlySales(identity: TenantIdentity, month: number, year: number) {
    return tenantQueryKey(identity, 'monthly-sales', 'item', month, year);
  },
  monthlySalesAll(identity: TenantIdentity) {
    return tenantQueryKey(identity, 'monthly-sales', 'list');
  },
  payablesByMonth(identity: TenantIdentity, year: number, month: number) {
    return tenantQueryKey(identity, 'payables', 'month', year, month);
  },
  payablesByYear(identity: TenantIdentity, year: number) {
    return tenantQueryKey(identity, 'payables', 'year', year);
  },
  invoicesByMonth(identity: TenantIdentity, year: number, month: number) {
    return tenantQueryKey(identity, 'invoices', 'month', year, month);
  },
  companySettings(identity: TenantIdentity) {
    return tenantQueryKey(identity, 'settings', 'company');
  },
  adminCompany(identity: TenantIdentity) {
    return tenantQueryKey(identity, 'admin', 'company');
  },
  adminStores(identity: TenantIdentity) {
    return tenantQueryKey(identity, 'admin', 'stores');
  },
  adminMerchants(identity: TenantIdentity) {
    return tenantQueryKey(identity, 'admin', 'merchants');
  },
} as const;

export function identityFromUser(user: Pick<AuthUser, 'companyId' | 'storeId'>): TenantIdentity {
  return { companyId: user.companyId, storeId: user.storeId };
}
