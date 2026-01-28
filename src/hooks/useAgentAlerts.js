import { useState, useEffect, useCallback } from 'react';
import { agentService } from '../services/agentService';

// Poll Supabase for alerts every 30 seconds
const DEFAULT_POLL_INTERVAL = 30000;

export function useAgentAlerts(pollInterval = DEFAULT_POLL_INTERVAL) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await agentService.getLatestAlerts();
      if (data.success) {
        // Alerts come from Supabase already deduplicated
        const alertsList = data.alerts || [];
        setAlerts(alertsList);
        setLastUpdate(data.lastUpdate || new Date().toISOString());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll Supabase for alerts
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollInterval]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback(async (alertId) => {
    const result = await agentService.updateAlertStatus(alertId, 'acknowledged');
    if (result.success) {
      await fetchAlerts();
    }
    return result;
  }, [fetchAlerts]);

  // Resolve an alert
  const resolveAlert = useCallback(async (alertId) => {
    const result = await agentService.updateAlertStatus(alertId, 'resolved');
    if (result.success) {
      await fetchAlerts();
    }
    return result;
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    lastUpdate,
    refetch: fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
  };
}

export default useAgentAlerts;
