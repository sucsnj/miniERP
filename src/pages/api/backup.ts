import type { NextApiRequest, NextApiResponse } from 'next';
import { backupDatabase } from '../../database/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const path = backupDatabase();
      res.status(200).json({ message: 'Backup criado', path });
    } catch {
      res.status(500).json({ error: 'Erro no backup' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
