import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const statistics = dbOperations.getStatistics();
      return res.status(200).json(statistics);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

