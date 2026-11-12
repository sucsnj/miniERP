# `src/services/adminService.ts`

> Cliente HTTP via `fetch` para o módulo de administração do tenant (empresa, lojas, vendedores).

## O que faz

- Define interfaces e tipos públicos (`CompanySummary`, `StoreAdmin`, `MerchantAdmin`, `UpdateMerchantPatch`).
- `fetchCompany` / `updateCompanyName`.
- `fetchStores` / `createStore` / `updateStore`.
- `fetchMerchants` / `createMerchant` / `updateMerchant`.
- `parseResponse` propaga `Error` em respostas não OK com mensagens legíveis.

## Relações

- **Usa:** APIs `/api/admin/*`.
- **Usado por:** `src/hooks/useAdmin.ts`.

## Notas

- Todos os métodos aguardam resposta OK e devolvem JSON tipado.
- Não altera o banco diretamente; a API interna aplica a política de acesso por `AuthContext`.
