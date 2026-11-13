# `src/utils/queryProfiles.ts`

> Perfis de `useQuery` compartilhados por queries tenant-scoped.

## O que faz

- `LIVE_TENANT_QUERY_OPTIONS`: `staleTime=0`, `refetchOnMount: 'always'`, refetch em `focus` e `reconnect` — perda mínima para queries com alta volatilidade.
- `MOUNT_TENANT_QUERY_OPTIONS`: `staleTime=0`, refetch apenas no mount, sem refetch de foco — usado para consultas pesadas quando a rota principal é montada.

## Relações

- **Usado por:** `useSales`, `useMonthlyData`, `usePayables`, `useProductsCatalog`, `useAdmin`, `useMedicineTable`, `SettingsContext`, `MonthNotes`.

## Notas

- Os dois perfis mantêm o cache como `initial placeholder`; o React Query decide exibi-lo enquanto busca novo resultado.
