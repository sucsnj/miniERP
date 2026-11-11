# `src/proxy.ts`

> Proxy do Next.js 16 (antigo `middleware`).

## O que faz

- Permite `/login`, `/setup`, `/api/auth/login` e `/api/auth/bootstrap`.
- Redireciona páginas sem cookie de sessão para `/login`.
- Retorna `401` para `/api/*` sem cookie de sessão.
- Não consulta o banco; validação real da sessão fica nas API routes (`serverAuth`).

## Relações

- **Usa:** `next/server`.
- **Usado por:** Next.js como arquivo de proxy na borda.

## Notas

- O cookie é apenas uma checagem otimista de presença; a verdade está em `/api/auth/me` e `serverAuth`.
