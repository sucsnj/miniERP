# ADR 0016 — Sessão sliding com limite absoluto e rotação do token

- **Status:** aceita

## Contexto

A sessão original era fixa em 48 horas: após esse prazo, o usuário era desconectado mesmo em uso contínuo. Para um POS que permanece aberto no caixa, isso cria interrupção desnecessária. Aumentar apenas o prazo não é suficiente; um token de longa duração roubado continuaria válido por muito tempo.

## Decisão

1. Sessão usa **14 dias de inatividade** com renovação sliding:
   - quando faltarem no máximo 7 dias para expirar, o endpoint `/api/auth/me` renova `sessions.expires_at` para 14 dias a partir de agora;
   - a renovação nunca ultrapassa o prazo absoluto da sessão.
2. **30 dias de prazo absoluto** a partir de `sessions.created_at`; passado esse limite, a sessão é inválida independentemente de atividade.
3. **Rotação de token** no `/api/auth/me`:
   - após 2 dias sem rotação, gera um token novo, armazena apenas o hash atual e o hash anterior;
   - o hash anterior aceita requisições paralelas por 60 segundos (`previous_token_expires_at`);
   - após a janela, o hash anterior é recusado e sua apresentação encerra a sessão (detecção de reuso).
4. `/api/auth/me` é a rota de renovação/rotação; demais APIs continuam aceitando token atual/anterior sem gravar a tabela.
5. `AuthContext` valida a sessão a cada 30s, no foco e ao voltar à aba, e mostra toast intermitente com menos de 24h até a expiração efetiva (rolling ou absoluta).
6. Alterações sensíveis de vendedor (`password`, desativação, lojas e `login`) em `/api/admin/merchants` revogam sessões daquele usuário.

## Consequências

- Usuário ativo não é deslogado a cada 48h; 14 dias de uso contínuo renovam a sessão, limitados a 30 dias.
- Rolling expiration pode ser estendida por requisições `/me`, mas nunca invalida o limite absoluto.
- Token antigo roubado tem janela curta de reuso após rotação; requests paralelas não quebram dentro de 60s.
- O endpoint `/me` passa a escrever na tabela `sessions` quando há renovação/rotação.

## Alternativas consideradas

- **Sessão fixa de 14/30 dias sem sliding:** rejeitada, desloga usuário ativo no meio do expediente.
- **Sliding sem limite absoluto:** rejeitada, token comprometido permaneceria válido indefinidamente.
- **Rotação sem grace period:** rejeitada, requisições paralelas que reutilizem o cookie antigo poderiam ser descartadas por corrida.
- **Refresh token em endpoint separado:** rejeitada por maior complexidade para um app interno pequeno.

## Referências

- [ADR 0013 — Autenticação multi-empresa/multi-loja](./0013-autenticacao-multiempresa-multiloja.md)
- [ADR 0015 — Múltiplos admins por bootstrap](./0015-multiplos-admins-por-bootstrap.md)
- `src/utils/serverAuth.ts`, `src/contexts/AuthContext.tsx`
- `supabase/migrations/0028-add-session-rotation.sql`
