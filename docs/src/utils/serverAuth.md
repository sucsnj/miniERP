# `src/utils/serverAuth.ts`

> Helpers server-only de autenticação, sessão e contexto do usuário.

## O que faz

- Normaliza/valida identificadores (`login` ou `email`).
- Cria sessão opaca de 2 dias na tabela `sessions`; cookie contém apenas token aleatório.
- Resolve o contexto da sessão (usuário, empresa, role e loja autorizada).
- Revoga sessões; troca de senha revoga todas as sessões.
- Compara `PIN_MASTER` com `crypto.timingSafeEqual`.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/password.ts`, `node:crypto`.
- **Usado por:** páginas/API de autenticação, futuramente repositories e API routes multi-tenant.

## Notas

- `sessions.token_hash` é SHA-256 do cookie; o token bruto nunca é armazenado.
- Admin acessa todas as lojas ativas da empresa; merchant apenas lojas em `user_stores`.
- `requireApiAuth` exige sessão; `requireAdminApi`/`isAdmin` aplicam permissão `admin`; vendas são a única escrita permitida a merchant.
- `listAuthorizedStores` lista lojas visíveis ao usuário a partir do `AuthContext`; `setCurrentStore` valida acesso, atualiza a sessão/loja atual e retorna a loja selecionada.
- `company_id` e `store_id` vêm da sessão, nunca do cliente.
