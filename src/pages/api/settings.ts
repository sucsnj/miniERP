import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi, requireApiAuth } from '../../utils/serverAuth';
import {
  inspectCompanySettings,
  updateCompanySettingsWithDiagnostics,
  type CompanySettingsPatch,
  type CompanyThemeMode,
  type RecentSalesCount,
  type FieldScale,
} from '../../database/settingsRepository';

const THEMES: CompanyThemeMode[] = ['system', 'light', 'dark'];
const COUNTS: RecentSalesCount[] = [0, 2, 4, 6, 8];
const FIELD_SCALES: FieldScale[] = [1, 1.2, 1.5, 2, 2.5];

function parsePatch(body: unknown): CompanySettingsPatch | null {
  if (!body || typeof body !== 'object') return null;
  const source = body as Record<string, unknown>;
  const patch: CompanySettingsPatch = {};

  if (source.themeMode !== undefined) {
    if (!THEMES.includes(source.themeMode as CompanyThemeMode)) return null;
    patch.themeMode = source.themeMode as CompanyThemeMode;
  }
  if (source.timezone !== undefined) {
    const timezone = String(source.timezone).trim();
    if (!timezone || timezone.length > 120 || !/^[A-Za-z0-9_+.-]+(?:\/[A-Za-z0-9_+.-]+)*$/.test(timezone)) return null;
    patch.timezone = timezone;
  }
  if (source.recentSalesCount !== undefined) {
    const count = Number(source.recentSalesCount);
    if (!COUNTS.includes(count as RecentSalesCount)) return null;
    patch.recentSalesCount = count as RecentSalesCount;
  }
  if (source.autoFocusSaleInput !== undefined) {
    if (typeof source.autoFocusSaleInput !== 'boolean') return null;
    patch.autoFocusSaleInput = source.autoFocusSaleInput;
  }
  if (source.autoFocusSaleInputDelay !== undefined) {
    const delay = Number(source.autoFocusSaleInputDelay);
    if (!Number.isFinite(delay) || delay < 5 || delay > 3600) return null;
    patch.autoFocusSaleInputDelay = Math.floor(delay);
  }
  if (source.autoConsolidationEnabled !== undefined) {
    if (typeof source.autoConsolidationEnabled !== 'boolean') return null;
    patch.autoConsolidationEnabled = source.autoConsolidationEnabled;
  }
  if (source.autoConsolidationDay !== undefined) {
    const day = Number(source.autoConsolidationDay);
    if (!Number.isFinite(day) || day < 1 || day > 28) return null;
    patch.autoConsolidationDay = Math.floor(day);
  }
  if (source.autoConsolidationMode !== undefined) {
    if (source.autoConsolidationMode !== 'all-previous' && source.autoConsolidationMode !== 'previous-month') return null;
    patch.autoConsolidationMode = source.autoConsolidationMode;
  }
  for (const field of ['fieldScaleDate', 'fieldScaleValue', 'fieldScaleObservations'] as const) {
    if (source[field] !== undefined) {
      const value = Number(source[field]);
      if (!FIELD_SCALES.includes(value as FieldScale)) return null;
      patch[field] = value as FieldScale;
    }
  }
  if (source.pixKey !== undefined) patch.pixKey = String(source.pixKey);
  if (source.pixName !== undefined) patch.pixName = String(source.pixName);
  if (source.pixBank !== undefined) patch.pixBank = String(source.pixBank);
  if (source.pixCity !== undefined) patch.pixCity = String(source.pixCity);

  // Presets são alterados somente pelos endpoints atômicos /api/settings/pix-presets.
  if (source.pixPresets !== undefined) return null;

  return patch;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ctx = await requireApiAuth(req, res);
    if (!ctx) return;

    try {
      const { companySettings, fieldScalesAvailable } = await inspectCompanySettings(ctx);
      return res.status(200).json({ companySettings, fieldScalesAvailable });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Não foi possível carregar as configurações.' });
    }
  }

  if (req.method === 'PATCH') {
    const ctx = await requireAdminApi(req, res);
    if (!ctx) return;

    const patch = parsePatch(req.body);
    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Configuração inválida.' });
    }

    try {
      const { companySettings, fieldScalesAvailable } = await updateCompanySettingsWithDiagnostics(patch, ctx);
      return res.status(200).json({ companySettings, fieldScalesAvailable });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar as configurações.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
