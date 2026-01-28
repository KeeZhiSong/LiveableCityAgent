import { useState, useEffect, useCallback } from 'react';
import { agentService } from '../services/agentService';

// Poll for agent status every 3 minutes
export function useAgentStatus(pollInterval = 180000) {
  const [status, setStatus] = useState({
    status: 'unknown',
    lastRun: null,
    runCount: 0,
    alertsActive: 0,
    districtsMonitored: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await agentService.getAgentStatus();
      setStatus({
        status: data.status || 'offline',
        lastRun: data.lastRun,
        lastStatus: data.lastStatus,
        runCount: data.runCount || 0,
        alertsActive: data.alertsActive || 0,
        districtsMonitored: data.districtsMonitored || 0,
        interval: data.interval,
        agent: data.agent,
        version: data.version,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus(prev => ({ ...prev, status: 'offline' }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  return {
    ...status,
    loading,
    error,
    refetch: fetchStatus,
    isOnline: status.status === 'online' || status.status === 'active',
  };
}

export default useAgentStatus;
