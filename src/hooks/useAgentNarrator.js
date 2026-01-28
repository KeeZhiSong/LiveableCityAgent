import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Page-specific tips the agent says when navigating
const PAGE_MESSAGES = {
  '/': [
    { message: 'Click any district on the map to dive into its liveability assessment.', type: 'info' },
    { message: 'I\'m keeping watch over all 28 districts. I\'ll flag anything unusual.', type: 'greeting' },
  ],
  '/vision': [
    { message: 'Upload a street-level photo and I\'ll score it across 5 liveability dimensions.', type: 'info' },
    { message: 'Tip: photos with clear views of infrastructure and greenery yield the best analysis.', type: 'info' },
  ],
  '/districts': [
    { message: 'Here\'s a bird\'s-eye view of every district. Sort by score to find areas needing attention.', type: 'info' },
    { message: 'Click any district card to jump straight to its assessment on the dashboard.', type: 'info' },
  ],
  '/alerts': [
    { message: 'These are anomalies I\'ve detected across Singapore\'s districts.', type: 'info' },
    { message: 'Acknowledge alerts to let me know you\'ve seen them, or resolve when handled.', type: 'info' },
  ],
  '/about': [
    { message: 'This is where you can learn about the LiveableCity Agent project.', type: 'greeting' },
  ],
};

// Idle insights the agent can share periodically
const IDLE_INSIGHTS = [
  { message: 'Did you know? Greenery coverage is the strongest predictor of resident satisfaction in Singapore.', type: 'info' },
  { message: 'Districts near MRT stations tend to score higher on accessibility — by 12 points on average.', type: 'info' },
  { message: 'Air quality monitoring shows PM2.5 levels peak between 11am and 3pm across most districts.', type: 'info' },
  { message: 'Walkability scores have improved across 60% of districts this quarter.', type: 'info' },
  { message: 'I run anomaly detection every 30 seconds across all 28 districts.', type: 'greeting' },
  { message: 'Urban heat island effects are most pronounced in districts with less than 20% green cover.', type: 'info' },
];

/**
 * Hook that drives the agent narrator — context-aware page tips,
 * reactive triggers for user actions, periodic idle insights,
 * and alert narration.
 */
export function useAgentNarrator({ agentSpeak, agentMessage, alerts, districtScores }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const idleTimerRef = useRef(null);
  const idleIndexRef = useRef(0);
  const prevAlertCountRef = useRef(alerts?.length || 0);
  const navMessageCooldownRef = useRef(false);

  // Pick a random message from an array
  const pickRandom = useCallback((arr) => arr[Math.floor(Math.random() * arr.length)], []);

  // 1. Context-aware page navigation triggers
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === prevPathRef.current) return;
    prevPathRef.current = currentPath;

    // Don't spam on rapid navigation
    if (navMessageCooldownRef.current) return;
    navMessageCooldownRef.current = true;
    setTimeout(() => { navMessageCooldownRef.current = false; }, 10000);

    const messages = PAGE_MESSAGES[currentPath];
    if (!messages || messages.length === 0) return;

    // Small delay so the page renders first
    const timeout = setTimeout(() => {
      const msg = pickRandom(messages);
      agentSpeak(msg.message, msg.type, 6000);
    }, 800);

    return () => clearTimeout(timeout);
  }, [location.pathname, agentSpeak, pickRandom]);

  // 2. Alert narration — when new alerts arrive, narrate them
  useEffect(() => {
    const currentCount = alerts?.length || 0;
    const prevCount = prevAlertCountRef.current;
    prevAlertCountRef.current = currentCount;

    if (currentCount > prevCount && prevCount > 0) {
      const newCount = currentCount - prevCount;
      const latest = alerts[0]; // most recent alert
      const districtNote = latest?.district ? ` in ${latest.district}` : '';
      agentSpeak(
        `Heads up — ${newCount} new alert${newCount > 1 ? 's' : ''}${districtNote}. ${latest?.title || ''}`,
        'alert',
        7000
      );
    }
  }, [alerts, agentSpeak]);

  // 3. Periodic idle insights — surface a fact every 45s when idle
  useEffect(() => {
    const startIdle = () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);

      idleTimerRef.current = setInterval(() => {
        // Only speak when no message is currently showing
        if (!agentMessage) {
          const insight = IDLE_INSIGHTS[idleIndexRef.current % IDLE_INSIGHTS.length];
          idleIndexRef.current++;
          agentSpeak(insight.message, insight.type, 7000);
        }
      }, 45000);
    };

    startIdle();
    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [agentSpeak, agentMessage]);

  // 4. Reactive: district scores loaded for the first time
  const hasSpokenScoresRef = useRef(false);
  useEffect(() => {
    if (hasSpokenScoresRef.current) return;
    const count = Object.keys(districtScores || {}).length;
    if (count > 0) {
      hasSpokenScoresRef.current = true;
      // Don't override the initial greeting — let useProactiveAgent handle that
    }
  }, [districtScores]);
}

export default useAgentNarrator;
