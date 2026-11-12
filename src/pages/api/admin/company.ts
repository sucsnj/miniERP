import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../utils/serverAuth';
import { getCompany, updateCompanyName } from '../../../database/adminRepository';
import { isValidName, normalizeName } from '../../../utils/serverAuth';
import { invalidateCompanyNameCache } from '../../../utils/companyCache';

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
    const name = normalizeName(req.body?.name);
    if (!isValidName(name)) {
      return res.status(400).json({ error: 'A empresa deve ter entre 2 e 120 caracteres.' });
    }

    try {
      await updateCompanyName(name, ctx);
      invalidateCompanyNameCache(ctx.companyId);
      return res.status(200).json({ company: { id: ctx.companyId, name } });
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar a empresa.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
