/**
 * src/components/form.ts
 *
 * Responsável pelo formulário: leitura dos campos, máscara de moeda
 * (pt-BR) e feedbacks de validação da chave PIX (incluindo o seletor
 * CPF ↔ Celular para chaves com 11 dígitos).
 */

import { validatePixKey, KeyType } from '../utils/pix.js';

// ---------------------------------------------------------------------------
// Tipos e Interfaces
// ---------------------------------------------------------------------------

export type ForcedKeyType = 'cpf' | 'phone' | null;

export interface FormState {
  key: string;
  keyType: KeyType;
  keyValid: boolean;
  keyForcedType: ForcedKeyType;
  amountRaw: string;
  merchantName: string;
  merchantBank: string;
}

export interface FormElements {
  form: HTMLFormElement;
  key: HTMLInputElement;
  keyTypeLabel: HTMLElement;
  keyFeedback: HTMLElement;
  keyToggle: HTMLElement;
  amount: HTMLInputElement;
  merchantName: HTMLInputElement;
  merchantBank: HTMLInputElement;
}

export interface FormFallback {
  merchantKey?: string;
}

export interface InitFormReturn {
  onInput: (cb: () => void) => void;
  getState: () => FormState;
  update: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

export const state: FormState = {
  key: '',
  keyType: 'unknown',
  keyValid: false,
  keyForcedType: null,
  amountRaw: '',
  merchantName: '',
  merchantBank: '',
};

/**
 * Formata a entrada do campo valor em moeda brasileira (R$).
 * Ex.: "123456,7" -> "1.234,56"  |  "15" -> "15"
 */
function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (!digits) return '';

  if (!value.includes(',') && !value.includes('.')) {
    return Number(digits).toLocaleString('pt-BR');
  }

  const cents = digits.slice(0, -2).padStart(1, '0');
  const decimals = digits.slice(-2).padStart(2, '0');
  const reais = Number(cents).toLocaleString('pt-BR');
  return `${reais},${decimals}`;
}

/** Normaliza a exibição do valor: garante duas casas decimais ao perder o foco. */
function commitAmount(input: HTMLInputElement): void {
  const value = input.value.trim();
  if (!value) {
    state.amountRaw = '';
    return;
  }
  const formatted = formatCurrency(value.includes(',') || value.includes('.') ? value : `${value},00`);
  input.value = formatted;
  state.amountRaw = formatted;
}

/**
 * Aplica a máscara de moeda em tempo real, preservando um comportamento
 * simples de digitação (o dígito é sempre acrescentado antes das centavos).
 */
function maskAmount(input: HTMLInputElement): void {
  const raw = input.value;
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (!digits) {
    input.value = '';
    state.amountRaw = '';
    return;
  }
  // Coloca o valor digitado em centavos: ex.: 5 -> "0,05", 150 -> "1,50"
  const cents = String(Number(digits));
  const padded = cents.padStart(3, '0');
  const reais = Number(padded.slice(0, -2)).toLocaleString('pt-BR');
  const decimals = padded.slice(-2);
  input.value = `${reais},${decimals}`;
  state.amountRaw = input.value;
}

/**
 * Atualiza o estado visual do seletor CPF ↔ Celular.
 */
function renderToggle(toggle: HTMLElement, active: ForcedKeyType): void {
  toggle.querySelectorAll<HTMLElement>('[data-force]').forEach((btn) => {
    const isActive = btn.dataset.force === active;
    btn.classList.toggle('bg-white', isActive);
    btn.classList.toggle('shadow-sm', isActive);
    btn.classList.toggle('text-slate-900', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
    btn.classList.toggle('ring-1', isActive);
    btn.classList.toggle('ring-emerald-300', isActive);
  });
}

/**
 * Inicializa o formulário e retorna hook para build + o estado atual.
 */
export function initForm(els: FormElements, fallback: FormFallback = {}): InitFormReturn {
  const defaultKey = String(fallback.merchantKey ?? '').trim();

  const updateKey = (): void => {
    const usingFallback = !els.key.value.trim() && Boolean(defaultKey);
    const source = usingFallback ? defaultKey : els.key.value;
    const result = validatePixKey(source, state.keyForcedType);
    
    state.key = result.key;
    state.keyType = result.type;
    state.keyValid = result.valid;
    els.keyTypeLabel.textContent = result.label || '—';
    els.keyFeedback.className = `mt-1.5 hidden text-sm`;

    // Seletor CPF ↔ Celular (somente quando há ambiguidade).
    const activeType = state.keyForcedType || (result.type === 'cpf' || result.type === 'phone' ? result.type : null);

    if (result.ambiguous && result.options && activeType && result.options.includes(activeType)) {
      els.keyToggle.classList.remove('hidden');
      renderToggle(els.keyToggle, activeType);
    } else {
      els.keyToggle.classList.add('hidden');
    }

    if (usingFallback) {
      if (result.valid) {
        els.keyFeedback.className = `mt-1.5 text-sm font-medium text-emerald-600`;
        els.keyFeedback.textContent = `Usando a chave padrão (${result.label}).`;
        els.key.classList.remove('input-error', 'input-ok');
      } else {
        els.keyFeedback.className = `mt-1.5 text-sm font-medium text-rose-500`;
        els.keyFeedback.textContent = 'A chave padrão do .env é inválida.';
        els.key.classList.add('input-error');
      }
    } else if (result.error) {
      els.keyFeedback.className = `mt-1.5 text-sm font-medium text-rose-500`;
      els.keyFeedback.textContent = result.error;
      els.key.classList.add('input-error');
      els.key.classList.remove('input-ok');
    } else if (result.valid) {
      els.keyFeedback.className = `mt-1.5 text-sm font-medium text-emerald-600`;
      const hint = result.ambiguous && state.keyForcedType === 'phone'
        ? 'Tratando como celular.' : `Chave válida (${result.label}).`;
      els.keyFeedback.textContent = hint;
      els.key.classList.add('input-ok');
      els.key.classList.remove('input-error');
    } else {
      els.key.classList.remove('input-ok', 'input-error');
    }
  };

  els.key.addEventListener('input', () => {
    state.keyForcedType = null;
    updateKey();
    emitChange();
  });

  els.keyToggle.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const btn = target?.closest<HTMLElement>('[data-force]');
    if (!btn || !btn.dataset.force) return;
    state.keyForcedType = btn.dataset.force as 'cpf' | 'phone';
    updateKey();
    emitChange();
  });

  els.amount.addEventListener('input', () => {
    maskAmount(els.amount);
    emitChange();
  });
  
  els.amount.addEventListener('blur', () => {
    commitAmount(els.amount);
    emitChange();
  });

  els.merchantName.addEventListener('input', () => {
    state.merchantName = els.merchantName.value;
    emitChange();
  });

  els.merchantBank.addEventListener('input', () => {
    state.merchantBank = els.merchantBank.value;
    emitChange();
  });

  let changeCallback: () => void = () => {};
  const emitChange = (): void => changeCallback();

  // Estado inicial: valida o fallback da chave (campo em branco usa o .env).
  updateKey();

  return {
    onInput(cb: () => void) {
      changeCallback = cb;
    },
    getState(): FormState {
      return { ...state };
    },
    update() {
      updateKey();
      emitChange();
    },
    reset() {
      els.form.reset();
      state.key = '';
      state.keyType = 'unknown';
      state.keyValid = false;
      state.keyForcedType = null;
      state.amountRaw = '';
      state.merchantName = '';
      state.merchantBank = '';
      els.keyTypeLabel.textContent = '—';
      els.keyToggle.classList.add('hidden');
      els.key.classList.remove('input-ok', 'input-error');
      els.keyFeedback.className = 'mt-1.5 hidden text-sm';
      emitChange();
    },
  };
}