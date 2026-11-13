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
  const compact = value.replace(/\s+/g, ' ');

  // Linha formatada ou não, capturamos candidatos plausíveis e validamos.
  const candidates = compact.match(
    /\d{5}[\s\.\-]?\d{5}[\s\.\-]?\d{5}[\s\.\-]?\d{6}[\s\.\-]?\d{5}[\s\.\-]?\d{6}[\s\.\-]?\d[\s\.\-]?\d{14}/g,
  ) ?? [];

  for (const candidate of candidates.reverse()) {
    const normalized = normalizeDigitableLine(candidate);
    if (normalized) return normalized;
  }

  return null;
};
