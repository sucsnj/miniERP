# `src/hooks/useMedicineTable.ts`

> Hook para status, histórico, busca e upload da tabela de medicamentos com TanStack Query. Exporta `useMedicineTable`.

## O que faz

- `status`: consulta por tenant (`medicine-table/status`), com `staleTime` de 30s.
- `history`: histórico de buscas por tenant (`medicine-table/history`), `staleTime` de 1min.
- `search`: mutation de busca; é mutation porque o endpoint registra a busca no histórico.
- `upload`: mutation de upload; atualiza o cache de `status` no sucesso e invalida o domínio.
- `clearHistory`: mutation com optimistic update no histórico e rollback em erro.

## Relações

- **Usa:** `medicineTableService.ts` (`fetchTableStatus`, `fetchTableHistory`, `searchTable`, `uploadTable`, `clearTableHistory`), `useAuth`, `tenantQueryKey`.
- **Usado por:** `src/pages/medicine-table.tsx`.

## Notas

- A query de status/histórico só roda quando há usuário autenticado (`identity`).
- A invalidação usa o prefixo `['tenant', companyId, storeId, 'medicine-table']`.
- A lista de histórico ainda vem de `fetchTableHistory()` (máx. 25, apesar do texto da UI).
