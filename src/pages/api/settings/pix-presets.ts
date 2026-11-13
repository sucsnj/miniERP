import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../utils/serverAuth';
import {
  deletePixPreset,
  normalizePixPresets,
  upsertPixPreset,
} from '../../../database/settingsRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method === 'POST') {
    const presets = normalizePixPresets([req.body?.preset]);
    if (!presets) {
      return res.status(400).json({ error: 'Preset PIX inválido.' });
    }

    try {
      const companySettings = await upsertPixPreset(presets[0], ctx);
      return res.status(200).json({ companySettings });
    } catch (error) {
      console.error('Erro ao salvar preset PIX:', error);
      return res.status(500).json({ error: 'Não foi possível salvar o preset PIX.' });
    }
  }

  if (req.method === 'DELETE') {
    const presetId = String(req.body?.id ?? req.query?.id ?? '').trim();
    if (!presetId || presetId.length > 100) {
      return res.status(400).json({ error: 'Informe o preset a remover.' });
    }

    try {
      const companySettings = await deletePixPreset(presetId, ctx);
      return res.status(200).json({ companySettings });
    } catch (error) {
      console.error('Erro ao remover preset PIX:', error);
      return res.status(500).json({ error: 'Não foi possível remover o preset PIX.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
