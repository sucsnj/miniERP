import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

// TimeZones
// TimeZone Selecionado (padrão: Recife UTC-03)
const DEFAULT_TZ = 'America/Recife';

export function getTimezone(): string {
  if (typeof window === 'undefined') return DEFAULT_TZ;
  return window.localStorage.getItem('timezone') || window.localStorage.getItem('timezoneCompany') || DEFAULT_TZ;
}

// Função utilitária para pegar o "agora"
export function now(timezone: string = getTimezone()) {
  return dayjs().tz(timezone);
}

// Último dia do mês
export function getLastDayOfMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}-01`).endOf('month').date();
}

// Função genérica para criar um objeto dayjs já com timezone.
// Se o amount já contém offset (ex: 2026-07-31T22:08:01-03:00), dayjs.tz(value, TZ)
// ignoraria o offset e reinterpretaria como horário local — causando troca de dia.
// Por isso usamos dayjs(value) primeiro (respeita o offset) e depois convertemos para TZ.
export function parseDate(value: string, timezone: string = getTimezone()) {
  // Detecta se o amount tem offset explícito (Z ou ±HH:MM)
  if (/[Zz]|[+-]\d{2}:\d{2}$/.test(value)) {
    return dayjs(value).tz(timezone);
  }
  return dayjs.tz(value, timezone);
}

// Timestamp de um amount
export function toTimestamp(value: string): number {
  return parseDate(value).valueOf();
}

// Comparações
export function isAfter(a: string, b: string): boolean {
  return parseDate(a).isAfter(parseDate(b));
}

export function isBefore(a: string, b: string): boolean {
  return parseDate(a).isBefore(parseDate(b));
}

// toDate serve para transformar strings em Dates
export function toDate(value: string | Date, timezone: string = getTimezone()): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // ISO sem horário
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = dayjs.tz(value, timezone);
      return d.isValid() ? d.toDate() : null;
    }

    // ISO com offset explícito (ex: 2026-07-31T22:08:01-03:00)
    if (/[Zz]|[+-]\d{2}:\d{2}$/.test(value)) {
      const d = dayjs(value).tz(timezone);
      if (d.isValid()) return d.toDate();
    }

    // ISO sem offset
    const iso = dayjs.tz(value, timezone);
    if (iso.isValid()) return iso.toDate();

    // DD-MM-YYYY
    const dmy = dayjs(value, 'DD-MM-YYYY').tz(timezone);
    if (dmy.isValid()) return dmy.toDate();
  }
  return null;
}

// Compatível com chamadas antigas, mas simplificado
export function toDateFromISO(value: string, timezone: string = getTimezone()): Date | null {
  if (typeof value !== 'string') return null;
  const d = dayjs.tz(value, timezone);
  return d.isValid() ? d.toDate() : null;
}

// Arrays de date/hora
export function getDateArray(value?: string): [number, number, number] {
  const d = value ? parseDate(value) : now();
  return [d.date(), d.month() + 1, d.year()];
}

// Mês Atual em texto
export function formatMonthName(month: number): string {
  return dayjs().month(month - 1).format('MMMM');
}

export function getTimeArray(): [number, number, number] {
  const d = now();
  return [d.hour(), d.minute(), d.second()];
}

export function getDateTimeArray(): [number, number, number, number, number, number] {
  const d = now();
  return [d.date(), d.month() + 1, d.year(), d.hour(), d.minute(), d.second()];
}

// Formatadores
export function formatDateString(
  value: string,
  format: string = 'DD/MM/YYYY'
): string {
  const d = parseDate(value);
  return d.isValid() ? d.format(format) : '';
}

export function formatDateISO(
  value: string,
  format: string = 'DD/MM/YYYY'
): string {
  const d = parseDate(value);
  return d.isValid() ? d.format(format) : '';
}

// Ano atual
export function getCurrentYear(): number {
  return now().year();
}
