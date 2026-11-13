import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../utils/serverAuth';
import { getCompany, updateCompanyProfile } from '../../../database/adminRepository';
import { normalizeCompanyProfile } from '../../../utils/businessProfile';
import { invalidateCompanyNameCache } from '../../../utils/companyCache';

const buildCompanyPatch = (body: unknown) => {
  const result = normalizeCompanyProfile(body as Record<string, unknown>);
  if (!result.ok) return result;
  return { ok: true as const, company: result.value };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    try {
      const company = await getCompany(ctx);
      return res.status(200).json({ company });
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return res.status(500).json({ error: 'Não foi possível carregar a empresa.' });
    }
  }

  if (req.method === 'PATCH') {
    const parsed = buildCompanyPatch(req.body ?? {});
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.message ?? 'Dados da empresa inválidos.' });
    }

    try {
      const company = await updateCompanyProfile(parsed.company, ctx);
      invalidateCompanyNameCache(ctx.companyId);
      return res.status(200).json({ company });
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar a empresa.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
