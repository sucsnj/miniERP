# ADR 0003 — Padrão de notificações (toast) centralizado

- **Status:** aceito e implementado (07/10/2026).
- **Decisores:** dono do projeto + agente de IA (unificação de toasts da Fase 0 da refatoração).
- **Data:** 07/10/2026.

## Contexto

Havia **duas implementações de toast** e múltiplas cópias de estado:

1. Componente React `common/Toast.tsx` + hooks de estado **local por página/componente** (`toastOpen`, `toastMessage`, `toastType`, …) repetidos em 7 páginas e 2 componentes.
2. `showToast` DOM em `ActionPix.tsx` (`pixActions.ts`) que escrevia em `#toast-root` — **elemento que nunca era renderizado**, então os toasts do painel PIX eram silenciosamente inexistentes (bug latente).

Além disso, hooks como `useVendas`, `useMensais`, `useCart` e `useCategoria*` recebiam `showToast` por parâmetro (prop drilling), e o `useToast` existente era estado local (uma instância por consumidor). Isso contrariava o perfil de refatoração em `docs/ALIGNMENT.md` §4.5 (fonte única e descobrível para funções compartilhadas).

## Decisão

Um **store singleton** como fonte única de estado, consumido por `useSyncExternalStore`:

- `src/utils/toast.ts` — estado `{ open, message, type, duration }`, ações `showToast(message, type?, duration?)` e `dismissToast()`, e funções `subscribeToast`/`getToastSnapshot`/`getServerToastSnapshot`.
- `src/hooks/useToast.ts` — reescrito para consumir o store (mesma API pública: `toastOpen`, `toastMessage`, `toastType`, `toastDuration`, `showToast`, `closeToast`), sem estado local.
- `src/components/common/Toaster.tsx` — host único renderizado em `src/pages/_app.tsx`, exibindo o toast ativo em `top-right`.
- Migração de **todas** as páginas/componentes para `useToast()`; remoção do estado local e do `<Toast>` por página.
- `pixActions.showToast` **removido**; modais PIX passam a usar `showToast` do store.

### Contrato da função

`showToast(message: string, type?: 'success' | 'error' | 'info', duration?: number | null): void` — `duration` default `3000`; `null` mantém aberto.

## Consequências

**Positivas:**
- Toast centralizado e consistente em todo o app; bug do `#toast-root` eliminado.
- Sem prop drilling de `showToast` (hook/funções estáveis, prontas para dependências de `useCallback`).
- Preparação para a refatoração dos componentes grandes (fonte única antes de extrair hooks/serviços).
- Robusto em SSR (`getServerSnapshot`).

**Negativas / aceitas:**
- Um **único toast global**: toasts simultâneos sobrepõem-se (antes cada página tinha o seu). Em app individual (uso via Tailscale, sem auth), a perda não impacta o fluxo registrado em `docs/ALIGNMENT.md` §4.4.
- O toast da venda mudou de `local-top-right` (acima do formulário) para `top-right` global — aceito pelo dono (approved in review).
- `closeToast`/`toastOpen` de consumidores antigos continuam funcionando pela mesma API.

## Alternativas consideradas

- **Manter componente Toast por página + hook local:** não eliminava a duplicação nem corrigia o bug.
- **Contexto React (`ToastProvider`):** válido, porém exige prover o contexto em cada árvore e re-renderiza mais; o store + `useSyncExternalStore` é mais direto e não depende de árvore.
- **Biblioteca externa (react-hot-toast etc.):** desnecessária para a escala do app (um toast por vez).

## Referências

- `docs/ALIGNMENT.md` §4.5 (fonte única e descobrível).
- `docs/src/components/common/Toast.md`, `docs/src/components/common/Toaster.md`, `docs/src/utils/toast.md`, `docs/src/hooks/useToast.md` (implementação).
- `docs/adr/0002-padrao-de-validacao-de-campos.md` (precedente de contrato/fonte única na camada de utils).