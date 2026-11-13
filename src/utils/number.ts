const normalizeNumericText = (value: string): string =>
  value
    .trim()
    .replace(/[\u2212\u2012\u2013\u2014]/g, '-')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/\s+/g, '');

function parseNormalizedNumber(raw: string): number | null {
  if (!raw || raw === '+' || raw === '-' || raw === '.' || raw === '-.') {
    return null;
  }

  const sign = raw.startsWith('-') ? -1 : 1;
  const body = raw.replace(/^[+-]/, '');

  const thousandsPattern = /^\d{1,3}(?:\.\d{3})+$/;
  if (thousandsPattern.test(body)) {
    const parsed = Number(body.replace(/\./g, ''));
    return Number.isFinite(parsed) ? parsed * sign : null;
  }

  if (!/^(?:\d+(\.\d+)?|\.\d+)$/.test(body)) {
    return null;
  }

  const parsed = Number(`${sign < 0 ? '-' : ''}${body}`);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBrazilianNumber(raw: string): number | null {
  const match = /^([+-]?)(\d{1,3}(?:\.\d{3})*|\d+),(\d+)$/.exec(raw);
  if (!match) return null;

  const [, sign, integerPart, decimalPart] = match;
  if (!/^\d+$/.test(integerPart.replace(/\./g, ''))) return null;

  const normalized = `${integerPart.replace(/\./g, '')}.${decimalPart}`;
  const value = Number(`${sign === '-' ? '-' : ''}${normalized}`);
  return Number.isFinite(value) ? value : null;
}

function parseStrictNumber(value: unknown): number {
  if (value == null) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;

  const raw = normalizeNumericText(value);

  if (raw.includes(',')) {
    const parsed = parseBrazilianNumber(raw);
    return parsed ?? NaN;
  }

  return parseNormalizedNumber(raw) ?? NaN;
}

/**
 * Normaliza um valor numérico.
 * Aceita o padrão brasileiro (`1.234,56`) e decimal internacional (`1234.56`).
 */
export function parseNumber(value: unknown): number {
  return parseStrictNumber(value);
}

/**
 * Normaliza um valor monetário (string ou número) e devolve `number | null`.
 * Não aceita notação científica nem texto sujo.
 */
export function parseCurrency(value: unknown): number | null {
  const parsed = parseStrictNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default parseNumber;
