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

const normalizeText = (value: string, maxLength: number): string =>
  value.trim().replace(/\s+/g, ' ').slice(0, maxLength);

const readStrictString = (
  record: Record<string, unknown>,
  key: string,
  maxLength: number,
  label: string,
  { required = false }: { required?: boolean } = {},
): { ok: true; value: string } | { ok: false; message: string } => {
  const raw = record[key];
  if (raw === undefined || raw === null) {
    return required
      ? { ok: false, message: `${label} é obrigatório.` }
      : { ok: true, value: '' };
  }
  if (typeof raw !== 'string') {
    return { ok: false, message: `${label} deve ser uma string.` };
  }
  const value = normalizeText(raw, maxLength + 1);
  if (required && !value) {
    return { ok: false, message: `${label} é obrigatório.` };
  }
  if (value.length > maxLength) {
    return { ok: false, message: `${label} é muito longo.` };
  }
  return { ok: true, value };
};

const normalizePhone = (value: string): string => value.trim();
const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(value) && [10, 11, 12, 13].includes(digits.length);
};

const normalizeOptionalPhone = (
  record: Record<string, unknown>,
): { ok: true; value: string } | { ok: false; message: string } => {
  const result = readStrictString(record, 'phone', 40, 'Telefone');
  if (!result.ok) return result;
  const phone = normalizePhone(result.value);
  if (!isValidPhone(phone)) return { ok: false, message: 'Telefone inválido.' };
  return { ok: true, value: phone };
};

const normalizeTaxId = (value: string): string => value.replace(/\D/g, '');
const isValidTaxId = (value: string): boolean => {
  if (!value) return true;
  if (value.length === 11) return isValidCpf(value);
  if (value.length === 14) return isValidCnpj(value);
  return false;
};

const normalizeOptionalTaxId = (
  record: Record<string, unknown>,
): { ok: true; value: string } | { ok: false; message: string } => {
  const result = readStrictString(record, 'taxId', 40, 'CPF/CNPJ');
  if (!result.ok) return result;
  const taxId = normalizeTaxId(result.value);
  if (result.value && !isValidTaxId(taxId)) {
    return { ok: false, message: 'CPF ou CNPJ inválido.' };
  }
  return { ok: true, value: taxId };
};

const normalizeUf = (value: string): string =>
  value.trim().replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);

const normalizeZip = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits.slice(0, 9);
};

const isValidZip = (value: string): boolean => !value || /^\d{5}-\d{3}$/.test(value);

const optionalState = (
  record: Record<string, unknown>,
): { ok: true; value: string } | { ok: false; message: string } => {
  const result = readStrictString(record, 'addressState', 2, 'UF');
  if (!result.ok) return result;
  const state = normalizeUf(result.value);
  if (state && !BRAZILIAN_STATES.has(state)) {
    return { ok: false, message: 'UF inválida.' };
  }
  return { ok: true, value: state };
};

const optionalZip = (
  record: Record<string, unknown>,
): { ok: true; value: string } | { ok: false; message: string } => {
  const result = readStrictString(record, 'addressZip', 9, 'CEP');
  if (!result.ok) return result;
  const zip = normalizeZip(result.value);
  if (!isValidZip(zip)) return { ok: false, message: 'CEP inválido.' };
  return { ok: true, value: zip };
};

const ok = <T>(value: T): ProfileValidationResult<T> => ({ ok: true, value });

const requireName = (
  record: Record<string, unknown>,
): { ok: true; value: string } | { ok: false; message: string } => {
  const result = readStrictString(record, 'name', 120, 'Nome', { required: true });
  if (!result.ok) return result;
  if (result.value.length < 2) return { ok: false, message: 'O nome deve ter entre 2 e 120 caracteres.' };
  return result;
};

const addressFields = (record: Record<string, unknown>, includeDetails: boolean) => {
  const street = readStrictString(record, 'addressStreet', 160, 'Logradouro');
  const number = readStrictString(record, 'addressNumber', 30, 'Número');
  const district = readStrictString(record, 'addressDistrict', 120, 'Bairro');

  if (!street.ok) return street;
  if (!number.ok) return number;
  if (!district.ok) return district;

  const complement = includeDetails
    ? readStrictString(record, 'addressComplement', 160, 'Complemento')
    : { ok: true as const, value: '' };
  const city = includeDetails
    ? readStrictString(record, 'addressCity', 120, 'Cidade')
    : { ok: true as const, value: '' };
  const state = includeDetails
    ? optionalState(record)
    : { ok: true as const, value: '' };
  const zip = includeDetails
    ? optionalZip(record)
    : { ok: true as const, value: '' };

  if (!complement.ok) return complement;
  if (!city.ok) return city;
  if (!state.ok) return state;
  if (!zip.ok) return zip;

  return {
    ok: true as const,
    value: {
      addressStreet: street.value,
      addressNumber: number.value,
      addressComplement: complement.value,
      addressDistrict: district.value,
      addressCity: city.value,
      addressState: state.value,
      addressZip: zip.value,
    },
  };
};

export function normalizeContactProfile(
  input: unknown
): ProfileValidationResult<ContactProfile> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, message: 'Contato inválido.' };
  }

  const record = input as Record<string, unknown>;
  const phone = normalizeOptionalPhone(record);
  const address = addressFields(record, true);

  if (!phone.ok) return { ok: false, message: phone.message };
  if (!address.ok) return { ok: false, message: address.message };

  return ok({
    phone: phone.value,
    ...address.value,
  });
}

export function normalizeCompanyProfile(
  input: Record<string, unknown>
): ProfileValidationResult<CompanyProfile> {
  const record = input as Record<string, unknown>;
  const name = requireName(record);
  const phone = normalizeOptionalPhone(record);
  const taxId = normalizeOptionalTaxId(record);
  const address = addressFields(record, true);

  if (!name.ok) return { ok: false, message: name.message };
  if (!phone.ok) return { ok: false, message: phone.message };
  if (!taxId.ok) return { ok: false, message: taxId.message };
  if (!address.ok) return { ok: false, message: address.message };

  const id = record.id;
  if (id !== undefined && typeof id !== 'string') {
    return { ok: false, message: 'ID da empresa inválido.' };
  }

  return ok({
    ...(id ? { id } : {}),
    name: name.value,
    phone: phone.value,
    taxId: taxId.value,
    ...address.value,
  });
}

export function normalizeStoreProfile(
  input: Record<string, unknown>
): ProfileValidationResult<StoreProfile> {
  const record = input as Record<string, unknown>;
  const name = requireName(record);
  const phone = normalizeOptionalPhone(record);
  const taxId = normalizeOptionalTaxId(record);
  const address = addressFields(record, false);

  if (!name.ok) return { ok: false, message: name.message };
  if (!phone.ok) return { ok: false, message: phone.message };
  if (!taxId.ok) return { ok: false, message: taxId.message };
  if (!address.ok) return { ok: false, message: address.message };

  const id = record.id;
  if (id !== undefined && typeof id !== 'string') {
    return { ok: false, message: 'ID da loja inválido.' };
  }

  const active = record.active;
  if (active !== undefined && typeof active !== 'boolean') {
    return { ok: false, message: 'Status da loja inválido.' };
  }

  return ok({
    ...(id ? { id } : {}),
    addressStreet: address.value.addressStreet,
    addressNumber: address.value.addressNumber,
    addressDistrict: address.value.addressDistrict,
    phone: phone.value,
    taxId: taxId.value,
    name: name.value,
    ...(active !== undefined ? { active } : {}),
  });
}
