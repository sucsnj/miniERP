# `src/hooks/useAutoFocus.ts`

> Hook reutilizável para focar periodicamente um elemento e mantê-lo visível.

## O que faz

- Em intervalos regulares, aplica `focus()` no elemento referenciado.
- Periodicamente verifica se o elemento está visível; se não estiver, rola até ele e aplica `focus({ preventScroll: true })`.
- Pode ser ativado/desativado via opção `enabled`.

## Relações

- **Usa:** `React.useEffect`.
- **Usado por:** `src/hooks/useDailySaleForm.ts`.

## Notas

- Opções: `enabled`, `focusIntervalMs` (padrão `60000`), `visibilityIntervalMs` (padrão `180000`) e `topOffset` (padrão `70`).
- Quando `enabled` é `false`, nenhum intervalo é criado.
