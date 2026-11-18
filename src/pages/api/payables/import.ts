import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../utils/serverAuth';
import { processPayablesXml, type PayablesImportOverride } from '../../../services/payablesImport';

const parseOverride = (body: unknown): PayablesImportOverride => {
  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const override: PayablesImportOverride = {};
  const distributorId = String(source.distributorId ?? '').trim();
  const newDistributorName = String(source.newDistributorName ?? '').trim();
  const aliases = Array.isArray(source.newDistributorAliases)
    ? source.newDistributorAliases.map((value) => String(value ?? '').trim()).filter(Boolean)
    : undefined;

  if (distributorId) override.distributorId = distributorId;
  if (newDistributorName) override.newDistributorName = newDistributorName;
  if (aliases && aliases.length > 0) override.newDistributorAliases = aliases;

  return override;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
    const xml = String(body.xml ?? '');
    if (!xml) {
      return res.status(400).json({ error: 'Arquivo XML não fornecido' });
    }

    const result = await processPayablesXml(
      xml,
      ctx,
      req.cookies?.timezone ?? 'America/Recife',
      parseOverride(body)
    );

    if ('code' in result && result.code) {
      return res.status(409).json({ sucesso: false, ...result });
    }

    if ('error' in result && result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao importar XML:', error);
    return res.status(500).json({ error: 'Erro interno ao processar XML' });
  }
}
