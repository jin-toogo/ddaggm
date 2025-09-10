import { useState, useEffect } from 'react';
import { TemporaryUserSession } from '@/types/auth';

export function usePendingUser() {
  const [pendingUser, setPendingUser] = useState<TemporaryUserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPendingUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/auth/pending-user', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setPendingUser(data.user);
        } else if (response.status === 404) {
          // No pending session
          setPendingUser(null);
        } else {
          throw new Error('Failed to fetch pending user');
        }
      } catch (err) {
        console.error('Error fetching pending user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPendingUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingUser();
  }, []);

  return {
    pendingUser,
    loading,
    error,
    hasPendingUser: !!pendingUser,
  };
}