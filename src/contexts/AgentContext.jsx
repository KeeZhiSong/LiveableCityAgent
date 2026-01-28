import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDistrictData } from '../hooks/useDistrictData';
import { useAgentAlerts } from '../hooks/useAgentAlerts';
import { useProactiveAgent } from '../hooks/useProactiveAgent';
import { agentService } from '../services/agentService';

const AgentContext = createContext(null);

export function AgentContextProvider({ children }) {
  // District scores (global - used by Dashboard, Districts page)
  const { districtScores, isLoading: isLoadingScores, lastUpdated, refetch: refetchScores } = useDistrictData();

  // Agent alerts from Supabase
  const { alerts, loading: alertsLoading, acknowledgeAlert, resolveAlert, refetch: refetchAlerts } = useAgentAlerts();

  // Proactive agent - monitors scores, generates recommendations
  const {
    notifications,
    agentMessage,
    isThinking,
    recommendations,
    insights,
    pushNotification,
    dismissNotification,
    clearNotifications,
    agentSpeak,
    clearAgentMessage,
    refetchRecommendations,
  } = useProactiveAgent(districtScores);

  // Local activity feed
  const [activityFeed, setActivityFeed] = useState([]);

  const addActivity = useCallback((activity) => {
    setActivityFeed(prev => [{
      id: Date.now(),
      timestamp: 'Just now',
      ...activity,
    }, ...prev.slice(0, 9)]);
  }, []);

  // Fetch activity feed on mount
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const activities = await agentService.getActivityFeed(10);
        setActivityFeed(activities);
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      }
    };
    fetchActivity();
  }, []);

  const value = {
    // District scores
    districtScores,
    isLoadingScores,
    lastUpdated,
    refetchScores,

    // Alerts
    alerts,
    alertsLoading,
    acknowledgeAlert,
    resolveAlert,
    refetchAlerts,

    // Proactive agent
    notifications,
    agentMessage,
    isThinking,
    recommendations,
    insights,
    pushNotification,
    dismissNotification,
    clearNotifications,
    agentSpeak,
    clearAgentMessage,
    refetchRecommendations,

    // Activity
    activityFeed,
    addActivity,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within AgentContextProvider');
  }
  return context;
}

export default AgentContext;
