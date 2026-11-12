import type { TenantIdentity } from './queryKeys';

interface QueryWithKey {
  queryKey: readonly unknown[];
}

function baseTenantMatches(queryKey: readonly unknown[], identity: TenantIdentity): boolean {
  return queryKey[0] === 'tenant'
    && queryKey[1] === identity.companyId
    && queryKey[2] === identity.storeId;
}

export const isTenantQuery = (queryKey: readonly unknown[], identity: TenantIdentity): boolean =>
  baseTenantMatches(queryKey, identity);

export const isTenantDomainQuery = (domain: string) => (query: QueryWithKey, identity: TenantIdentity): boolean =>
  baseTenantMatches(query.queryKey, identity) && query.queryKey[3] === domain;

export const isSalesDailyQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  baseTenantMatches(query.queryKey, identity) && query.queryKey[3] === 'sales' && query.queryKey[4] === 'daily';

export const isMonthlySalesQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  baseTenantMatches(query.queryKey, identity) && query.queryKey[3] === 'monthly-sales';

export const isPayablesQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  baseTenantMatches(query.queryKey, identity) && query.queryKey[3] === 'payables';

export const isPayablesMonthQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  isPayablesQuery(query, identity) && query.queryKey[4] === 'month';

export const isPayablesYearQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  isPayablesQuery(query, identity) && query.queryKey[4] === 'year';

export const isInvoicesQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  baseTenantMatches(query.queryKey, identity) && query.queryKey[3] === 'invoices';

export const isInvoicesMonthQuery = (query: QueryWithKey, identity: TenantIdentity): boolean =>
  isInvoicesQuery(query, identity) && query.queryKey[4] === 'month';
