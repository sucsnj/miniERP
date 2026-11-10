import type { NextApiRequest, NextApiResponse } from 'next';
import { backupContasDatabase } from '../../../database/contasDb';

// Handler de API ou componente exportado.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const path = backupContasDatabase();
    return res.status(200).json({ message: 'Backup de contas criado', path });
  } catch (error) {
    console.error('Erro no backup das contas:', error);
    return res.status(500).json({ error: 'Erro no backup de contas' });
  }
}
