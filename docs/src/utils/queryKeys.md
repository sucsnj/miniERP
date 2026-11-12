# `src/utils/queryKeys.ts`

> Chaves de cache do TanStack Query com isolamento por tenant (empresa + loja).

## O que faz

- Define o prefixo canônico `tenant` para todas as chaves de dados do tenant.
- `tenantQueryKey(identity, ...parts)`: monta uma chave tenant estruturada.
- `tenantQueryRoot(identity)`: retorna a raiz do tenant (`['tenant', companyId, storeId]`).
- `tenantQueryPredicate(candidate)`: identifica chaves que começam com o segmento `tenant`.
- `tenantKeys`: fábricas para domínios já previstos:
  - `salesDaily(identity, month, year, filter)`;
  - `saleItems(identity, saleId)`;
  - `monthlySales(identity, month, year)` e `monthlySalesAll(identity)`;
  - `payablesByMonth(identity, year, month)` e `payablesByYear(identity, year)`;
  - `invoicesByMonth(identity, year, month)`.
- `identityFromUser(...)`: reduz `AuthUser` a `companyId`/`storeId`.

## Relações

- **Usa:** `type AuthUser` (`src/contexts/AuthContext.tsx`).
- **Usado por:** hooks do TanStack Query e `Nav` (remoção de cache ao trocar de loja).

## Notas

- Toda chave tenant deve incluir `companyId` e `storeId`; nunca reutilizar chaves compartilhadas entre empresas ou lojas.
- Ao trocar de loja, `Nav` remove todas as queries com prefixo `['tenant']`.
- Não contém dados privados; apenas identificadores opacos de tenant.
