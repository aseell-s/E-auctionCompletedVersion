import { useState, useEffect } from 'react';

interface AuctionDetails {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  images: string[];
  status: string;
  createdAt: string;
  endTime: string;
  seller: {
    id: string;
    name: string;
    email: string;
    profile: {
      phone?: string;
      companyRegNo?: string;
      city?: string;
      state?: string;
      address?: string;
      company?: string;
    };
  };
  bids: Array<{
    id: string;
    amount: number;
    createdAt: string;
    bidder: {
      id: string;
      name: string;
    };
  }>;
  Comment: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

export function useAuctionDetails(auctionId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuctionDetails | null>(null);

  useEffect(() => {
    if (!auctionId) {
      setData(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auction details');
        }
        
        const auctionData = await response.json();
        setData(auctionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [auctionId]);

  return { data, loading, error };
}
