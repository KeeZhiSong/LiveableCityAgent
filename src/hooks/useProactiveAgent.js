import { useState, useEffect, useCallback, useRef } from 'react';
import { agentService } from '../services/agentService';

// Poll Supabase for recommendations every 30 seconds
const RECOMMENDATIONS_POLL_INTERVAL = 30000;

// Simulated anomaly detection thresholds
const ANOMALY_THRESHOLDS = {
  scoreDropPercent: 5,    // Alert if score drops more than 5%
  lowScoreThreshold: 60,  // Alert for scores below 60
  criticalThreshold: 50,  // Critical alert for scores below 50
};

// Agent personality messages
const AGENT_MESSAGES = {
  greeting: [
    "Good morning! I've been monitoring Singapore's districts overnight.",
    "Hello! I've completed my latest analysis of liveability metrics.",
    "I'm actively monitoring all 28 districts for changes.",
  ],
  investigating: [
    "I noticed something interesting - investigating now...",
    "Anomaly detected. Running deeper analysis...",
    "Something caught my attention. Let me look into this.",
  ],
  recommendation: [
    "Based on my analysis, I recommend focusing on",
    "My data suggests prioritizing",
    "I've identified an opportunity in",
  ],
  insight: [
    "Here's what I found:",
    "My analysis reveals:",
    "Interesting discovery:",
  ],
};

export function useProactiveAgent(districtScores = {}) {
  const [notifications, setNotifications] = useState([]);
  const [agentMessage, setAgentMessage] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const previousScoresRef = useRef({});
  const hasGreetedRef = useRef(false);
  const analysisTimeoutRef = useRef(null);
  const lastGreetingRef = useRef(null);

  // Add a notification
  const pushNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    return id;
  }, []);

  // Dismiss a notification
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set agent speaking message
  const agentSpeak = useCallback((message, type = 'info', duration = 5000) => {
    if (!message) {
      setAgentMessage(null);
      return;
    }

    setAgentMessage({ message, type, timestamp: Date.now() });

    if (duration > 0) {
      setTimeout(() => {
        setAgentMessage(null);
      }, duration);
    }
  }, []);

  // Clear agent message
  const clearAgentMessage = useCallback(() => {
    setAgentMessage(null);
  }, []);

  // Detect anomalies in district scores
  const detectAnomalies = useCallback((currentScores, previousScores) => {
    const anomalies = [];

    Object.entries(currentScores).forEach(([district, data]) => {
      const current = data.overall || data;
      const previous = previousScores[district]?.overall || previousScores[district];

      // Check for score drops
      if (previous && current < previous) {
        const dropPercent = ((previous - current) / previous) * 100;
        if (dropPercent >= ANOMALY_THRESHOLDS.scoreDropPercent) {
          anomalies.push({
            type: 'score_drop',
            severity: dropPercent >= 10 ? 'high' : 'medium',
            district,
            message: `${district} liveability score dropped ${dropPercent.toFixed(1)}%`,
            detail: `Score changed from ${previous.toFixed(1)} to ${current.toFixed(1)}`,
            current,
            previous,
            dropPercent,
          });
        }
      }

      // Check for critically low scores
      if (current <= ANOMALY_THRESHOLDS.criticalThreshold) {
        anomalies.push({
          type: 'critical_score',
          severity: 'critical',
          district,
          message: `${district} has critically low liveability score`,
          detail: `Current score: ${current.toFixed(1)} - immediate attention needed`,
          current,
        });
      } else if (current <= ANOMALY_THRESHOLDS.lowScoreThreshold) {
        anomalies.push({
          type: 'low_score',
          severity: 'medium',
          district,
          message: `${district} liveability score needs attention`,
          detail: `Current score: ${current.toFixed(1)} - below recommended threshold`,
          current,
        });
      }
    });

    return anomalies;
  }, []);

  // Fetch recommendations from Supabase
  const fetchRecommendations = useCallback(async () => {
    try {
      console.log('[ProactiveAgent] Fetching recommendations from Supabase...');
      const data = await agentService.getRecommendations();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      // Normalize recommendations format
      const recs = (data.recommendations || []).map((rec, index) => ({
        id: rec.id || `ai-rec-${index}`,
        type: rec.type || 'focus',
        priority: rec.priority || 'medium',
        district: rec.district || null,
        title: rec.title || rec.issue || rec.district || 'Recommendation',
        message: rec.message || rec.impact || rec.reason || '',
        action: rec.action || (rec.district ? 'View District' : null),
        data: rec.data || null,
        timeline: rec.timeline || null,
        rank: rec.rank || index + 1,
      }));

      setRecommendations(recs);
      setInsights(data.insights || []);

      // Show greeting if it's new (different from last one)
      if (data.greeting && data.greeting !== lastGreetingRef.current) {
        lastGreetingRef.current = data.greeting;
        agentSpeak(data.greeting, 'greeting', 8000);
      }

      return { recommendations: recs, greeting: data.greeting, insights: data.insights };
    } catch (error) {
      console.warn('[ProactiveAgent] Failed to fetch recommendations:', error);
      return { recommendations: [], greeting: null, insights: [] };
    }
  }, [agentSpeak]);

  // Fallback local recommendations (rule-based)
  const generateLocalRecommendations = useCallback((scores) => {
    const districts = Object.entries(scores)
      .map(([name, data]) => ({
        name,
        score: data.overall || data,
        ...data,
      }))
      .sort((a, b) => a.score - b.score);

    const recs = [];

    if (districts.length > 0) {
      const lowest = districts[0];
      recs.push({
        id: 'focus-lowest',
        type: 'focus',
        priority: 'high',
        district: lowest.name,
        title: `Focus on ${lowest.name}`,
        message: `${lowest.name} has the lowest liveability score (${lowest.score.toFixed(1)}). Recommend investigating underlying factors.`,
        action: 'View District',
      });
    }

    return recs.slice(0, 3);
  }, []);

  // Initial greeting when agent starts
  useEffect(() => {
    if (!hasGreetedRef.current && Object.keys(districtScores).length > 0) {
      hasGreetedRef.current = true;

      // Fetch recommendations immediately (will show greeting from Supabase if available)
      fetchRecommendations().then(result => {
        // If no greeting from Supabase, use local greeting
        if (!result.greeting) {
          const greeting = AGENT_MESSAGES.greeting[Math.floor(Math.random() * AGENT_MESSAGES.greeting.length)];
          agentSpeak(greeting, 'greeting', 6000);
        }
      });
    }
  }, [districtScores, agentSpeak, fetchRecommendations]);

  // Poll Supabase for recommendations periodically
  useEffect(() => {
    const interval = setInterval(fetchRecommendations, RECOMMENDATIONS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  // Monitor for anomalies when scores change
  useEffect(() => {
    if (Object.keys(districtScores).length === 0) return;

    // Clear any pending analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Agent "thinking" while analyzing
    setIsThinking(true);

    analysisTimeoutRef.current = setTimeout(async () => {
      const previousScores = previousScoresRef.current;

      // Detect anomalies
      const anomalies = detectAnomalies(districtScores, previousScores);

      // Push notifications for anomalies
      anomalies.forEach(anomaly => {
        pushNotification({
          type: anomaly.type,
          severity: anomaly.severity,
          district: anomaly.district,
          title: anomaly.message,
          message: anomaly.detail,
        });
      });

      // If anomalies found, agent speaks about it
      if (anomalies.length > 0) {
        const critical = anomalies.filter(a => a.severity === 'critical');
        if (critical.length > 0) {
          agentSpeak(
            `I've detected ${critical.length} critical issue${critical.length > 1 ? 's' : ''} requiring immediate attention.`,
            'alert',
            8000
          );
        } else {
          agentSpeak(
            `I've identified ${anomalies.length} area${anomalies.length > 1 ? 's' : ''} that need${anomalies.length === 1 ? 's' : ''} attention.`,
            'warning',
            6000
          );
        }
      }

      // If no recommendations from Supabase yet, generate local ones
      if (recommendations.length === 0) {
        setRecommendations(generateLocalRecommendations(districtScores));
      }

      // Store current scores as previous for next comparison
      previousScoresRef.current = { ...districtScores };
      setIsThinking(false);
    }, 1500);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [districtScores, detectAnomalies, generateLocalRecommendations, pushNotification, agentSpeak, recommendations.length]);

  // Periodic proactive check-ins
  useEffect(() => {
    const checkInInterval = setInterval(() => {
      if (recommendations.length > 0 && !agentMessage) {
        const rec = recommendations[0];
        const prefix = AGENT_MESSAGES.recommendation[Math.floor(Math.random() * AGENT_MESSAGES.recommendation.length)];
        agentSpeak(`${prefix} ${rec.district}. ${rec.message.split('.')[0]}.`, 'recommendation', 8000);
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(checkInInterval);
  }, [recommendations, agentMessage, agentSpeak]);

  return {
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
    refetchRecommendations: fetchRecommendations,
  };
}

export default useProactiveAgent;
