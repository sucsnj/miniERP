import { isValidCnpj, isValidCpf } from './pix';

export interface ContactProfile {
  phone: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  phone: string;
  taxId: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

export interface StoreProfile {
  id?: string;
  name: string;
  phone: string;
  taxId: string;
  addressStreet: string;
  addressNumber: string;
  addressDistrict: string;
  active?: boolean;
}

export type ProfileValidationResult<T> =
  | { ok: true; value: T; message?: never }
  | { ok: false; message: string; value?: never };

const BRAZILIAN_STATES = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]);

const normalizeRequiredString = (value: unknown, maxLength: number): string =>
  String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);

const normalizeOptionalString = (value: unknown, maxLength: number): string =>
  normalizeRequiredString(value, maxLength);

const normalizePhone = (value: unknown): string => {
  const raw = String(value ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return raw;
};

const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return /^\+?\d[\d\s().-]{8,22}$/.test(value) && [10, 11, 12, 13].includes(digits.length);
};

const normalizeTaxId = (value: unknown): string => String(value ?? '').replace(/\D/g, '');

const isValidTaxId = (value: string): boolean => {
  if (!value) return true;
  if (value.length === 11) return isValidCpf(value);
  if (value.length === 14) return isValidCnpj(value);
  return false;
};

const normalizeUf = (value: unknown): string =>
  String(value ?? '').trim().replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);

const normalizeZip = (value: unknown): string => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits.slice(0, 9);
};

const isValidZip = (value: string): boolean => !value || /^\d{5}-\d{3}$/.test(value);

const ok = <T>(value: T): ProfileValidationResult<T> => ({ ok: true, value });

type ProfileValidationBaseResult =
  | { ok: true; message: null }
  | { ok: false; message: string };

const validateProfile = (input: Record<string, unknown>): ProfileValidationBaseResult => {
  const name = normalizeRequiredString(input.name, 200);
  if (name.length < 2 || name.length > 120) return { ok: false, message: 'O nome deve ter entre 2 e 120 caracteres.' };
  if (!isValidPhone(String(input.phone ?? ''))) {
    return { ok: false, message: 'Telefone inválido.' };
  }
  if (!isValidTaxId(normalizeTaxId(input.taxId))) {
    return { ok: false, message: 'CPF ou CNPJ inválido.' };
  }
  return { ok: true, message: null };
};

export function normalizeContactProfile(
  input: Record<string, unknown>
): ProfileValidationResult<ContactProfile> {
  const phone = normalizePhone(input.phone);
  const state = normalizeUf(input.addressState);
  const zip = normalizeZip(input.addressZip);

  if (!isValidPhone(phone)) {
    return { ok: false, message: 'Telefone inválido.' };
  }
  if (state && !BRAZILIAN_STATES.has(state)) {
    return { ok: false, message: 'UF inválida.' };
  }
  if (!isValidZip(zip)) {
    return { ok: false, message: 'CEP inválido.' };
  }

  return ok({
    phone,
    addressStreet: normalizeOptionalString(input.addressStreet, 160),
    addressNumber: normalizeOptionalString(input.addressNumber, 30),
    addressComplement: normalizeOptionalString(input.addressComplement, 160),
    addressDistrict: normalizeOptionalString(input.addressDistrict, 120),
    addressCity: normalizeOptionalString(input.addressCity, 120),
    addressState: state,
    addressZip: zip,
  });
}

export function normalizeCompanyProfile(
  input: Record<string, unknown>
): ProfileValidationResult<CompanyProfile> {
  const result = validateProfile(input);
  if (!result.ok) return { ok: false, message: result.message };

  const state = normalizeUf(input.addressState);
  const zip = normalizeZip(input.addressZip);
  if (state && !BRAZILIAN_STATES.has(state)) {
    return { ok: false, message: 'UF inválida.' };
  }
  if (!isValidZip(zip)) {
    return { ok: false, message: 'CEP inválido.' };
  }

  return ok({
    ...(input.id ? { id: String(input.id) } : {}),
    name: normalizeRequiredString(input.name, 120),
    phone: normalizePhone(input.phone),
    taxId: normalizeTaxId(input.taxId),
    addressStreet: normalizeOptionalString(input.addressStreet, 160),
    addressNumber: normalizeOptionalString(input.addressNumber, 30),
    addressComplement: normalizeOptionalString(input.addressComplement, 160),
    addressDistrict: normalizeOptionalString(input.addressDistrict, 120),
    addressCity: normalizeOptionalString(input.addressCity, 120),
    addressState: state,
    addressZip: zip,
  });
}

export function normalizeStoreProfile(
  input: Record<string, unknown>
): ProfileValidationResult<StoreProfile> {
  const result = validateProfile(input);
  if (!result.ok) return { ok: false, message: result.message };

  return ok({
    ...(input.id ? { id: String(input.id) } : {}),
    name: normalizeRequiredString(input.name, 120),
    phone: normalizePhone(input.phone),
    taxId: normalizeTaxId(input.taxId),
    addressStreet: normalizeOptionalString(input.addressStreet, 160),
    addressNumber: normalizeOptionalString(input.addressNumber, 30),
    addressDistrict: normalizeOptionalString(input.addressDistrict, 120),
    ...(input.active !== undefined ? { active: Boolean(input.active) } : {}),
  });
}
