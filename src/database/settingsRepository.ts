import { getSupabaseServerClient } from './supabase';
import type { AuthContext } from '../utils/serverAuth';

export type CompanyThemeMode = 'system' | 'light' | 'dark';
export type RecentSalesCount = 0 | 2 | 4 | 6 | 8;

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

function mapRow(row: Record<string, unknown>): CompanySettings {
  return {
    themeMode: row.theme_mode as CompanyThemeMode,
    timezone: String(row.timezone),
    recentSalesCount: Number(row.recent_sales_count) as RecentSalesCount,
    autoFocusSaleInput: Boolean(row.auto_focus_sale_input),
    autoFocusSaleInputDelay: Number(row.auto_focus_sale_input_delay),
    autoConsolidationEnabled: Boolean(row.auto_consolidation_enabled),
    autoConsolidationDay: Number(row.auto_consolidation_day),
    autoConsolidationMode: String(row.auto_consolidation_mode ?? 'all-previous') as 'all-previous' | 'previous-month',
    pixKey: String(row.pix_key ?? ''),
    pixName: String(row.pix_name ?? ''),
    pixBank: String(row.pix_bank ?? ''),
    pixCity: String(row.pix_city ?? ''),
    pixPresets: parsePixPresets(row.pix_presets),
  };
}

export async function getCompanySettings(ctx: AuthContext): Promise<CompanySettings> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('company_settings')
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, auto_consolidation_enabled, auto_consolidation_day, auto_consolidation_mode, pix_key, pix_name, pix_bank, pix_city, pix_presets')
    .eq('company_id', ctx.companyId)
    .maybeSingle();

  if (error) throw new Error('Não foi possível carregar as configurações da empresa.');
  if (data) return mapRow(data as Record<string, unknown>);

  const { data: created, error: insertError } = await client
    .from('company_settings')
    .insert({ company_id: ctx.companyId })
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, auto_consolidation_enabled, auto_consolidation_day, auto_consolidation_mode, pix_key, pix_name, pix_bank, pix_city, pix_presets')
    .single();

  if (insertError) throw new Error('Não foi possível criar as configurações da empresa.');
  return mapRow(created as Record<string, unknown>);
}

export async function updateCompanySettings(
  patch: CompanySettingsPatch,
  ctx: AuthContext
): Promise<CompanySettings> {
  const client = getSupabaseServerClient();
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
  if (patch.pixKey !== undefined) row.pix_key = patch.pixKey.trim();
  if (patch.pixName !== undefined) row.pix_name = patch.pixName.trim();
  if (patch.pixBank !== undefined) row.pix_bank = patch.pixBank.trim();
  if (patch.pixCity !== undefined) row.pix_city = patch.pixCity.trim();

  const { data, error } = await client
    .from('company_settings')
    .update(row)
    .eq('company_id', ctx.companyId)
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, auto_consolidation_enabled, auto_consolidation_day, auto_consolidation_mode, pix_key, pix_name, pix_bank, pix_city, pix_presets')
    .single();

  if (error) throw new Error('Não foi possível atualizar as configurações da empresa.');
  return mapRow(data as Record<string, unknown>);
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
