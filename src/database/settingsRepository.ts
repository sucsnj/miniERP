import { getSupabaseServerClient } from './supabase';
import type { AuthContext } from '../utils/serverAuth';

export type CompanyThemeMode = 'system' | 'light' | 'dark';
export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;
export type FieldScale = 1 | 1.2 | 1.5 | 2 | 2.5;
const FIELD_SCALES: FieldScale[] = [1, 1.2, 1.5, 2, 2.5];

const FIELD_SCALE_SELECT = 'theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, auto_consolidation_enabled, auto_consolidation_day, auto_consolidation_mode, field_scale_date, field_scale_value, field_scale_observations, pix_key, pix_name, pix_bank, pix_city, pix_presets';
const LEGACY_SELECT = 'theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, auto_consolidation_enabled, auto_consolidation_day, auto_consolidation_mode, pix_key, pix_name, pix_bank, pix_city, pix_presets';

export interface PixPreset {
  id: string;
  label: string;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
}

export interface CompanySettings {
  themeMode: CompanyThemeMode;
  timezone: string;
  recentSalesCount: RecentSalesCount;
  autoFocusSaleInput: boolean;
  autoFocusSaleInputDelay: number;
  autoConsolidationEnabled: boolean;
  autoConsolidationDay: number;
  autoConsolidationMode: 'all-previous' | 'previous-month';
  fieldScaleDate: FieldScale;
  fieldScaleValue: FieldScale;
  fieldScaleObservations: FieldScale;
  pixKey: string;
  pixName: string;
  pixBank: string;
  pixCity: string;
  pixPresets: PixPreset[];
}

export const MAX_PIX_PRESETS = 20;

export function normalizePixPresets(input: unknown): PixPreset[] | null {
  if (!Array.isArray(input) || input.length > MAX_PIX_PRESETS) return null;

  const presets: PixPreset[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') return null;
    const source = item as Record<string, unknown>;
    const preset = {
      id: String(source.id ?? '').trim(),
      label: String(source.label ?? '').trim(),
      pixKey: String(source.pixKey ?? '').trim(),
      pixName: String(source.pixName ?? '').trim(),
      pixBank: String(source.pixBank ?? '').trim(),
      pixCity: String(source.pixCity ?? '').trim(),
    };

    if (
      !preset.id || preset.id.length > 100
      || preset.label.length > 80
      || !preset.pixKey || preset.pixKey.length > 200
      || !preset.pixName || preset.pixName.length > 100
      || !preset.pixBank || preset.pixBank.length > 100
      || !preset.pixCity || preset.pixCity.length > 100
    ) {
      return null;
    }

    presets.push(preset);
  }

  return presets;
}

export interface CompanySettingsPatch {
  themeMode?: CompanyThemeMode;
  timezone?: string;
  recentSalesCount?: RecentSalesCount;
  autoFocusSaleInput?: boolean;
  autoFocusSaleInputDelay?: number;
  autoConsolidationEnabled?: boolean;
  autoConsolidationDay?: number;
  autoConsolidationMode?: 'all-previous' | 'previous-month';
  fieldScaleDate?: FieldScale;
  fieldScaleValue?: FieldScale;
  fieldScaleObservations?: FieldScale;
  pixKey?: string;
  pixName?: string;
  pixBank?: string;
  pixCity?: string;
}

function parsePixPresets(value: unknown): PixPreset[] {
  const raw = typeof value === 'string'
    ? (() => { try { return JSON.parse(value) as unknown; } catch { return []; } })()
    : value;
  return normalizePixPresets(raw) ?? [];
}

export interface CompanySettingsReadResult {
  companySettings: CompanySettings;
  fieldScalesAvailable: boolean;
}

function isMissingFieldScaleColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const details = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
  const serialized = [details.code, details.message, details.details, details.hint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return serialized.includes('field_scale_')
    || ((serialized.includes('42703') || serialized.includes('pgrst204')) && serialized.includes('field'));
}

function mapFieldScale(value: unknown): FieldScale {
  const numeric = Number(value ?? 1);
  return FIELD_SCALES.includes(numeric as FieldScale) ? numeric as FieldScale : 1;
}

function mapRow(row: Record<string, unknown>, fieldScalesAvailable = true): CompanySettings {
  return {
    themeMode: row.theme_mode as CompanyThemeMode,
    timezone: String(row.timezone),
    recentSalesCount: Number(row.recent_sales_count) as RecentSalesCount,
    autoFocusSaleInput: Boolean(row.auto_focus_sale_input),
    autoFocusSaleInputDelay: Number(row.auto_focus_sale_input_delay),
    autoConsolidationEnabled: Boolean(row.auto_consolidation_enabled),
    autoConsolidationDay: Number(row.auto_consolidation_day),
    autoConsolidationMode: String(row.auto_consolidation_mode ?? 'all-previous') as 'all-previous' | 'previous-month',
    fieldScaleDate: fieldScalesAvailable ? mapFieldScale(row.field_scale_date) : 1,
    fieldScaleValue: fieldScalesAvailable ? mapFieldScale(row.field_scale_value) : 1,
    fieldScaleObservations: fieldScalesAvailable ? mapFieldScale(row.field_scale_observations) : 1,
    pixKey: String(row.pix_key ?? ''),
    pixName: String(row.pix_name ?? ''),
    pixBank: String(row.pix_bank ?? ''),
    pixCity: String(row.pix_city ?? ''),
    pixPresets: parsePixPresets(row.pix_presets),
  };
}

async function runSettingsQuery(
  ctx: AuthContext,
  select: string,
  mode: 'select' | 'insert' | 'update',
  row?: Record<string, unknown>
) {
  const client = getSupabaseServerClient();

  if (mode === 'select') {
    return client.from('company_settings').select(select).eq('company_id', ctx.companyId).maybeSingle();
  }
  if (mode === 'insert') {
    return client.from('company_settings').insert(row ?? {}).select(select).single();
  }
  return client.from('company_settings').update(row ?? {}).eq('company_id', ctx.companyId).select(select).single();
}

async function createCompanySettingsRow(
  ctx: AuthContext,
  select: string
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await runSettingsQuery(ctx, select, 'insert', { company_id: ctx.companyId });
  return { data: data as unknown as Record<string, unknown> | null, error };
}

export async function inspectCompanySettings(ctx: AuthContext): Promise<CompanySettingsReadResult> {
  const initial = await runSettingsQuery(ctx, FIELD_SCALE_SELECT, 'select');

  if (!initial.error) {
    if (initial.data) {
      return { companySettings: mapRow(initial.data as unknown as Record<string, unknown>), fieldScalesAvailable: true };
    }

    const created = await createCompanySettingsRow(ctx, FIELD_SCALE_SELECT);
    if (!created.error) {
      return { companySettings: mapRow(created.data as unknown as Record<string, unknown>), fieldScalesAvailable: true };
    }
    if (!isMissingFieldScaleColumnError(created.error)) {
      throw new Error('Não foi possível criar as configurações da empresa.');
    }
  } else if (!isMissingFieldScaleColumnError(initial.error)) {
    throw new Error('Não foi possível carregar as configurações da empresa.');
  }

  const legacy = await runSettingsQuery(ctx, LEGACY_SELECT, 'select');
  if (legacy.error) throw new Error('Não foi possível carregar as configurações da empresa.');
  if (legacy.data) {
    return { companySettings: mapRow(legacy.data as unknown as Record<string, unknown>, false), fieldScalesAvailable: false };
  }

  const created = await createCompanySettingsRow(ctx, LEGACY_SELECT);
  if (created.error) throw new Error('Não foi possível criar as configurações da empresa.');
  return { companySettings: mapRow(created.data as unknown as Record<string, unknown>, false), fieldScalesAvailable: false };
}

export async function getCompanySettings(ctx: AuthContext): Promise<CompanySettings> {
  const result = await inspectCompanySettings(ctx);
  return result.companySettings;
}

export async function updateCompanySettingsWithDiagnostics(
  patch: CompanySettingsPatch,
  ctx: AuthContext
): Promise<CompanySettingsReadResult> {
  const row: Record<string, unknown> = { updated_by: ctx.userId };

  if (patch.themeMode !== undefined) row.theme_mode = patch.themeMode;
  if (patch.timezone !== undefined) row.timezone = patch.timezone.trim();
  if (patch.recentSalesCount !== undefined) row.recent_sales_count = patch.recentSalesCount;
  if (patch.autoFocusSaleInput !== undefined) row.auto_focus_sale_input = patch.autoFocusSaleInput;
  if (patch.autoFocusSaleInputDelay !== undefined) row.auto_focus_sale_input_delay = Math.floor(patch.autoFocusSaleInputDelay);
  if (patch.autoConsolidationEnabled !== undefined) row.auto_consolidation_enabled = patch.autoConsolidationEnabled;
  if (patch.autoConsolidationDay !== undefined) {
    const day = Math.floor(patch.autoConsolidationDay);
    if (!Number.isFinite(day) || day < 1 || day > 28) {
      throw new Error('Dia de auto consolidação inválido.');
    }
    row.auto_consolidation_day = day;
  }
  if (patch.autoConsolidationMode !== undefined) {
    if (!['all-previous', 'previous-month'].includes(patch.autoConsolidationMode)) {
      throw new Error('Modo de auto consolidação inválido.');
    }
    row.auto_consolidation_mode = patch.autoConsolidationMode;
  }
  for (const field of ['fieldScaleDate', 'fieldScaleValue', 'fieldScaleObservations'] as const) {
    const value = patch[field];
    if (value !== undefined) {
      if (!FIELD_SCALES.includes(value)) {
        throw new Error('Ampliação de campo inválida.');
      }
      const key = field.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
      row[key] = value;
    }
  }
  if (patch.pixKey !== undefined) row.pix_key = patch.pixKey.trim();
  if (patch.pixName !== undefined) row.pix_name = patch.pixName.trim();
  if (patch.pixBank !== undefined) row.pix_bank = patch.pixBank.trim();
  if (patch.pixCity !== undefined) row.pix_city = patch.pixCity.trim();

  const hasScalePatch = ['fieldScaleDate', 'fieldScaleValue', 'fieldScaleObservations']
    .some((field) => patch[field as 'fieldScaleDate' | 'fieldScaleValue' | 'fieldScaleObservations'] !== undefined);
  const updated = await runSettingsQuery(ctx, FIELD_SCALE_SELECT, 'update', row);

  if (!updated.error) {
    return {
      companySettings: mapRow(updated.data as unknown as Record<string, unknown>),
      fieldScalesAvailable: true,
    };
  }

  if (!isMissingFieldScaleColumnError(updated.error)) {
    throw new Error('Não foi possível atualizar as configurações da empresa.');
  }

  if (hasScalePatch) {
    throw new Error('A ampliação dos campos requer a migration 0026-add-sale-field-scales.sql.');
  }

  const legacyUpdate = { ...row };
  delete legacyUpdate.field_scale_date;
  delete legacyUpdate.field_scale_value;
  delete legacyUpdate.field_scale_observations;
  const legacy = await runSettingsQuery(ctx, LEGACY_SELECT, 'update', legacyUpdate);
  if (legacy.error) throw new Error('Não foi possível atualizar as configurações da empresa.');
  return {
    companySettings: mapRow(legacy.data as unknown as Record<string, unknown>, false),
    fieldScalesAvailable: false,
  };
}

export async function updateCompanySettings(
  patch: CompanySettingsPatch,
  ctx: AuthContext
): Promise<CompanySettings> {
  const result = await updateCompanySettingsWithDiagnostics(patch, ctx);
  return result.companySettings;
}

export async function upsertPixPreset(
  preset: PixPreset,
  ctx: AuthContext
): Promise<CompanySettings> {
  const client = getSupabaseServerClient();
  const { error } = await client.rpc('upsert_pix_preset', {
    p_company_id: ctx.companyId,
    p_preset: preset,
  });

  if (error) throw new Error('Não foi possível salvar o preset PIX.');
  return getCompanySettings(ctx);
}

export async function deletePixPreset(
  presetId: string,
  ctx: AuthContext
): Promise<CompanySettings> {
  const client = getSupabaseServerClient();
  const { error } = await client.rpc('delete_pix_preset', {
    p_company_id: ctx.companyId,
    p_preset_id: presetId,
  });

  if (error) throw new Error('Não foi possível remover o preset PIX.');
  return getCompanySettings(ctx);
}
