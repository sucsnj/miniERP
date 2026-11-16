# `src/utils/serverAuth.ts`

> Helpers server-only de autenticação, sessão e contexto do usuário.

## O que faz

- Normaliza/valida identificadores (`login` ou `email`).
- Cria/resolve sessão opaca: 14 dias de inatividade (sliding; renova a partir de 7 dias até o limite), máximo absoluto de 30 dias a partir de `created_at`.
- Rotaciona `token_hash` após 2 dias sem rotação; o hash anterior permanece válido por 60 segundos (`previous_token_expires_at`) para evitar corridas em requisições paralelas.
- Resolve o contexto da sessão (usuário, empresa, role, loja autorizada e `contact` com telefone/endereço) e também `sessionExpiresAt`/`sessionAbsoluteExpiresAt`.
- Revoga sessões; `revokeUserSessions` retorna `boolean` e permite preservar a sessão atual via `exceptSessionId`.
- Compara `PIN_MASTER` com `crypto.timingSafeEqual`.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/password.ts`, `node:crypto`.
- **Usado por:** páginas/API de autenticação, futuramente repositories e API routes multi-tenant.

## Notas

- `sessions.token_hash` é SHA-256 do cookie; o token bruto nunca é armazenado.
- O cookie dura 30 dias (vida absoluta) e é renovado apenas no endpoint `/api/auth/me` quando há rotação; o máximo absoluto nunca ultrapassa 30 dias a partir da criação.
- `previous_token_hash` aceita requisições paralelas por 60s depois de uma rotação; fora dessa janela, o token anterior é inválido e a sessão é removida (detecção de reuso).
- Sessão renovada expira 14 dias após atividade real, ou no prazo absoluto de 30 dias, o que ocorrer antes.
- `/api/auth/me` enviado como heartbeat (`x-session-heartbeat: 1`) é autenticação passiva: não renova a janela rolling. Apenas requisições interativas/atividade real estendem a inatividade.
- Alterações sensíveis em `/api/admin/merchants` (senha, ativo/desativo, lojas, login) revogam sessões do vendedor.
- Admin acessa todas as lojas ativas da empresa; merchant apenas lojas em `user_stores`.
- `requireApiAuth` exige sessão; `requireAdminApi`/`isAdmin` aplicam permissão `admin`; vendas são a única escrita permitida a merchant.
- `setCurrentStore` atualiza primeiro `users.last_store_id` e depois `sessions.store_id`; se a sessão falhar, faz rollback de `last_store_id` (melhor esforço) e retorna `null`.
- `company_id` e `store_id` vêm da sessão, nunca do cliente.
