# `src/utils/loginRateLimit.ts`

> Limite básico de tentativas de login em memória.

## O que faz

- Conta falhas por IP + identificador numa janela de 5 minutos.
- Bloqueia a partir de 10 falhas consecutivas dentro da janela.
- Limpa o contador após login válido.

## Relações

- **Usa:** nenhuma dependência externa.
- **Usado por:** `src/pages/api/auth/login.ts`.

## Notas

- É por processo; serverless pode ter múltiplas instâncias. Adequado para UX/proteção básica, não para proteção distribuída.
