export interface BoletoValidatedLine {
  digits: string;
  kind: 'bank' | 'collection';
}

const validateBankLine = (digits: string): boolean =>
  digits.length === 47 && /^\d{47}$/.test(digits);

const validateCollectionLine = (digits: string): boolean =>
  digits.length === 48 && /^8\d{47}$/.test(digits);

export const normalizeDigitableLine = (value: string): string | null => {
  const digits = value.replace(/\D/g, '');

  if (/^\d{47}$/.test(digits)) {
    return validateBankLine(digits) ? digits : null;
  }

  if (/^\d{48}$/.test(digits)) {
    return validateCollectionLine(digits) ? digits : null;
  }

  return null;
};

export const extractDigitableLineFromText = (value: string): string | null => {
  // Tesseract pode inserir espaços/pontos em posições inesperadas; para a mesma
  // linha da linha digitável, o prefixo gráfico é irrelevante.
  for (const line of value.split(/\r?\n/)) {
    const digits = line.replace(/\D/g, '');

    if (digits.length < 47) continue;

    for (let start = digits.length - 47; start >= 0; start -= 1) {
      const normalized = normalizeDigitableLine(digits.slice(start, start + 47));
      if (normalized) return normalized;
    }
  }

  return null;
};
