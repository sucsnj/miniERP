import type { NextApiRequest, NextApiResponse } from 'next';
import { listAvailableYears } from '../../../database/payablesRepository';
import { requireApiAuth } from '../../../utils/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireApiAuth(req, res);
  if (!ctx) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const years = await listAvailableYears(ctx);
  return res.status(200).json(years);
}