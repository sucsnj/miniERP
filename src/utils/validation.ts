import { parseCurrency, parseNumber } from './number';
import { toDate } from './date';

/**
 * Contrato padrão de validação de campos (ADR 0002).
 * Todas as validações retornam `{ ok, message }` com mensagem pt-BR
 * hardcoded no módulo, garantindo feedback uniforme em páginas e API.
 */
export interface ValidationResult {
  ok: boolean;
  message: string | null;
}

const ok = (): ValidationResult => ({ ok: true, message: null });
const fail = (message: string): ValidationResult => ({ ok: false, message });

/**
 * Valida campo obrigatório.
 * Retorna `{ ok, message }`. Considera vazio: `null`, `undefined`, string somente espaços.
 * @param value - valor a validar
 * @param label - rótulo do campo para personalizar a mensagem ("Cliente", "Valor"...)
 */
export function validateRequired(value: unknown, label?: string): ValidationResult {
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === '' || v == null) return fail(label ? `${label} é obrigatório.` : 'Campo obrigatório.');
  return ok();
}

/**
 * Valida e-mail simples.
 * Retorna `{ ok, message }`.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') return fail('E-mail inválido.');
  const trimmed = email.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(trimmed.toLowerCase()) ? ok() : fail('E-mail inválido.');
}

/**
 * Valida valor monetário (string ou número).
 * Retorna `{ ok, message }`. A normalização fica em `parseCurrency` (`utils/number.ts`).
 */
export function validateCurrency(value: string | number): ValidationResult {
  return parseCurrency(value) == null ? fail('Valor monetário inválido.') : ok();
}

/**
 * Valida número não monetário (inteiro, decimal ou string numérica).
 * Retorna `{ ok, message }`. A normalização fica em `parseNumber` (`utils/number.ts`).
 */
export function validateNumber(value: unknown): ValidationResult {
  return Number.isFinite(parseNumber(value)) ? ok() : fail('Número inválido.');
}

/**
 * Valida data (ISO, YYYY-MM-DD ou formatos aceitos por `toDate`).
 * Retorna `{ ok, message }`. A normalização fica em `toDate` (`utils/date.ts`).
 */
export function validateDate(input: string): ValidationResult {
  return toDate(input) == null ? fail('Data inválida.') : ok();
}

const validation = {
  validateRequired,
  validateEmail,
  validateCurrency,
  validateNumber,
  validateDate,
};

export default validation;