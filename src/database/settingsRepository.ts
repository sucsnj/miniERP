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
      || !preset.label || preset.label.length > 80
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
  pixKey?: string;
  pixName?: string;
  pixBank?: string;
  pixCity?: string;
  pixPresets?: PixPreset[];
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
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, pix_key, pix_name, pix_bank, pix_city, pix_presets')
    .eq('company_id', ctx.companyId)
    .maybeSingle();

  if (error) throw new Error('Não foi possível carregar as configurações da empresa.');
  if (data) return mapRow(data as Record<string, unknown>);

  const { data: created, error: insertError } = await client
    .from('company_settings')
    .insert({ company_id: ctx.companyId })
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, pix_key, pix_name, pix_bank, pix_city, pix_presets')
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
  if (patch.pixKey !== undefined) row.pix_key = patch.pixKey.trim();
  if (patch.pixName !== undefined) row.pix_name = patch.pixName.trim();
  if (patch.pixBank !== undefined) row.pix_bank = patch.pixBank.trim();
  if (patch.pixCity !== undefined) row.pix_city = patch.pixCity.trim();
  if (patch.pixPresets !== undefined) {
    const presets = normalizePixPresets(patch.pixPresets);
    if (!presets) throw new Error('Presets PIX inválidos.');
    row.pix_presets = presets;
  }

  const { data, error } = await client
    .from('company_settings')
    .update(row)
    .eq('company_id', ctx.companyId)
    .select('theme_mode, timezone, recent_sales_count, auto_focus_sale_input, auto_focus_sale_input_delay, pix_key, pix_name, pix_bank, pix_city, pix_presets')
    .single();

  if (error) throw new Error('Não foi possível atualizar as configurações da empresa.');
  return mapRow(data as Record<string, unknown>);
}
