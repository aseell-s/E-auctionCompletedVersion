import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Simulated auction data
  const auctions = [
    {
      id: '1',
      title: 'Rare Painting',
      description: 'A beautiful masterpiece.',
      currentPrice: 500,
      images: ['/images/painting.jpg'],
      status: 'active',
      endTime: new Date().toISOString(),
      seller: { name: 'John Doe', id: '123' },
      _count: { bids: 3 },
    },
    {
      id: '2',
      title: 'Vintage Guitar',
      description: 'A 1960s Fender Stratocaster.',
      currentPrice: 1200,
      images: ['/images/guitar.jpg'],
      status: 'active',
      endTime: new Date().toISOString(),
      seller: { name: 'Alice Smith', id: '456' },
      _count: { bids: 5 },
    },
  ];

  res.status(200).json(auctions);
}
