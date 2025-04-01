import { useState, useEffect } from 'react';

export function useApprovals() {
  const [data, setData] = useState({
    pendingSellers: [],
    pendingAuctions: [],
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // const fetchData = async () => {
  //   try {
  //     const response = await fetch("/api/admin/approvals");
  //     const result = await response.json();
  //     setData(result);
  //   } catch (error) {
  //     console.error("Failed to fetch approvals:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/approvals');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const text = await response.text(); // Read as text first
      const result = text ? JSON.parse(text) : {}; // Parse if not empty
      setData(result);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    type: 'seller' | 'auction',
    id: string,
    approved: boolean
  ) => {
    try {
      await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, approved }),
      });
      await fetchData(); // Refresh data after approval
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, handleApproval, refresh: fetchData };
}
