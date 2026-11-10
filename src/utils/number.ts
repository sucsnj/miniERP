// Função exportada.
export function parseNumber(value: unknown): number {
  if (value == null) return NaN;

  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    let cleaned = value.trim();

    // Se tiver vírgula, assume padrão BR
    if (cleaned.includes(',')) {
      cleaned = cleaned
        .replace(/\./g, '') // remove milhar
        .replace(',', '.'); // decimal
    }

    const n = parseFloat(cleaned);

    return Number.isFinite(n) ? n : NaN;
  }

  return NaN;
}

/**
 * Normaliza um valor monetário (string ou número) e devolve `number | null`.
 * Desacoplado da validação: não emite mensagens, só converte/limpa.
 * Aceita vírgulas como separador decimal e expressões numéricas simples.
 * @param value - string com representação de número (ex: "1.234,56" ou "1234.56")
 */
export function parseCurrency(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  // Normaliza: remove espaços, substitui vírgula por ponto e retira caracteres não numéricos exceto .-+
  const cleaned = String(value).trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.\-+eE]/g, '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '+') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default parseNumber;
