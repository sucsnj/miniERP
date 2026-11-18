# `src/services/adminService.ts`

> Cliente HTTP via `fetch` para o módulo de administração do tenant: empresa, lojas e vendedores.

## O que faz

- Define interfaces e tipos públicos (`CompanySummary`, `StoreAdmin`, `MerchantAdmin`, `UpdateMerchantPatch`, `CompanyProfileInput`, `StoreProfileInput`).
- `fetchCompany` / `updateCompanyProfile`.
- `fetchStores` / `createStore` / `updateStoreProfile` / `toggleStoreStatus`.
- `fetchMerchants` / `createMerchant` / `updateMerchant`.
- `fetchDistributors()` / `replaceDistributors(distributors)` — lista completa da configuração da empresa.
- `parseResponse` propaga `Error` em respostas não OK com mensagens legíveis.

## Relações

- **Usa:** APIs `/api/admin/*`.
- **Usado por:** `src/hooks/useAdmin.ts`.

## Notas

- Todos os métodos aguardam resposta OK e devolvem JSON tipado.
- Empresa e loja persistem endereço e documento no banco (`companies`/`stores`).
- O formulário da loja atualiza status por endpoint de status (`statusOnly`).
