import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../utils/serverAuth';
import { getCompanySettings, updateDistributorConfig } from '../../../database/settingsRepository';
import { normalizeDistributorConfig, type DistributorConfig } from '../../../utils/distributors';

const parseDistributors = (body: unknown): DistributorConfig[] | null => {
  const source = body && typeof body === 'object' ? (body as Record<string, unknown>).distributors : null;
  return normalizeDistributorConfig(source);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    try {
      const settings = await getCompanySettings(ctx);
      return res.status(200).json({ distributors: settings.distributorConfig });
    } catch (error) {
      console.error('Erro ao buscar distribuidoras:', error);
      return res.status(500).json({ error: 'Não foi possível carregar as distribuidoras.' });
    }
  }

  if (req.method === 'PUT') {
    const distributors = parseDistributors(req.body);

    if (!distributors) {
      return res.status(400).json({ error: 'Configuração de distribuidoras inválida.' });
    }

    try {
      const settings = await updateDistributorConfig(distributors, ctx);
      return res.status(200).json({ distributors: settings.distributorConfig });
    } catch (error) {
      console.error('Erro ao atualizar distribuidoras:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar as distribuidoras.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
