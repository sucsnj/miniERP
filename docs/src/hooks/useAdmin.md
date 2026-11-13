# `src/hooks/useAdmin.ts`

> Hook para carregar e alterar administração da empresa: empresa, lojas e vendedores. Exporta `useAdmin`.

## O que faz

- Carrega empresa, lojas e vendedores via TanStack Query (`tenantKeys.adminCompany`, `tenantKeys.adminStores`, `tenantKeys.adminMerchants`).
- Mantém rascunhos locais de nome de empresa, rascunhos de lojas e de vendedores (com merge apenas de novos vendedores/lojas para não sobrescrever edição).
- Expõe `createStore`, `saveStore`, `toggleStore`, `saveMerchant`, `createMerchant`, `resetMerchantPassword`, `saveCompany`, `toggleMerchantStore`, `updateMerchantAvatar` etc.
- Mutations com optimistic update em stores/merchants e invalidação prefixada `['tenant', companyId, storeId, 'admin']`.

## Relações

- **Usa:** `adminService.ts`, `AuthContext`, `usePendingTask`, `tenantKeys`, `queryProfiles` (queries live: `staleTime=0`, `refetchOnMount:'always'`).
- **Usado por:** `src/pages/admin.tsx`.

## Notas

- A invalidação de `admin` é feita também após create/update e `AuthContext.refresh()` quando empresa/loja é alterada.
- O reset de senha pelo admin é exposto via `resetMerchantPassword(merchantId, password)` e não manipula inputs diretamente.
- O hook reaproveita os dados carregados como cache da página por tenant.
