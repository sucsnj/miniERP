/**
 * src/utils/toast.ts
 *
 * Store singleton de notificações (toast) — fonte única de estado para a
 * camada de UI. `useToast` (hooks/useToast.ts) consome via `useSyncExternalStore`
 * e o host `<Toaster/>` (components/common/Toaster.tsx) renderiza o toast ativo.
 *
 * Padrão: chamadas de `showToast` vêm de qualquer camada (páginas, hooks,
 * componentes), sem prop drilling nem estado local duplicado.
 */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
  duration: number | null;
}

const INITIAL_STATE: ToastState = {
  open: false,
  message: '',
  type: 'info',
  duration: 3000,
};

let state: ToastState = INITIAL_STATE;

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Exibe um toast com a mensagem, o tipo e a duração informados.
 * `duration = null` mantém o toast aberto até o fechamento manual
 * (mesmo contrato do componente `Toast`).
 */
export function showToast(
  message: string,
  type: ToastType = 'info',
  duration: number | null = 3000
): void {
  state = { open: true, message, type, duration };
  notify();
}

/** Oculta o toast ativo. */
export function dismissToast(): void {
  state = { ...state, open: false };
  notify();
}

/** Assina o store (usado pelo `useSyncExternalStore` do hook `useToast`). */
export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot atual do store (referência estável entre mudanças). */
export function getToastSnapshot(): ToastState {
  return state;
}

/** Snapshot usado na renderização no servidor (nunca exibe toast em SSR). */
export function getServerToastSnapshot(): ToastState {
  return INITIAL_STATE;
}