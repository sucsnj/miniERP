# `src/database/adminRepository.ts`

> Repositório server-side de administração da empresa (tenant atual).

## O que faz

- `getCompany` / `updateCompanyProfile`.
- `listStores` / `createStore` / `updateStoreProfile` / `updateStoreStatus`; máximo de 2 lojas e pelo menos 1 ativa.
- Desativação de loja executa RPC `deactivate_store`: serializa, garante ao menos outra ativa e reassocia vendedores cuja única loja ativa for a desativada.
- Empresa persiste telefone, CPF/CNPJ, logradouro, número, complemento, bairro, cidade, UF e CEP.
- Loja persiste telefone, CPF/CNPJ, logradouro, número e bairro.
- `listMerchants` / `createMerchant` / `updateMerchant`; vinculação N×N em `user_stores`.
- `replaceStoreAssignments` compensa falhas com snapshot/restore de `user_stores` + `last_store_id` (não é atômico, mas restaura o vendedor em erro parcial).
- Criação de vendedor compensa transação com exclusão do usuário se falhar o vínculo de lojas.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/serverAuth.ts`, `src/utils/password.ts`.
- **Usado por:** `src/pages/api/admin/*`.

## Notas

- Todas as operações são filtradas por `ctx.companyId`; identifiers nunca vêm livres do cliente.
- Desativar vendedor ou redefinir senha revoga todas as sessões do usuário.
- Reset de senha pelo admin também ocorre via `users`; usuário permanece no `ctx` da empresa atual.
