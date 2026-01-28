import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

const POLL_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function usePredictiveInsights(pollInterval = POLL_INTERVAL) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      setError('Supabase not configured');
      return;
    }

    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('predictive_insights')
        .select('*')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setInsights(data || []);
        setLastUpdated(new Date().toISOString());
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, pollInterval);
    return () => clearInterval(interval);
  }, [fetchInsights, pollInterval]);

  return { insights, isLoading, lastUpdated, error, refresh: fetchInsights };
}

export default usePredictiveInsights;
