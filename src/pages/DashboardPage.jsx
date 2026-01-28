import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingOverlay } from '../components/Layout';
import { SingaporeMap } from '../components/Map';
import { SidePanel } from '../components/Dashboard';
import OverviewStats from '../components/Dashboard/OverviewStats';
import { AgentPanel, RecommendationsPanel } from '../components/Agent';
import { useDistrictAssessment } from '../hooks/useDistrictData';
import { useAgentStream } from '../hooks/useAgentStream';
import { useAgentContext } from '../contexts/AgentContext';

export default function DashboardPage() {
  const location = useLocation();

  const {
    districtScores,
    isLoadingScores,
    isThinking,
    recommendations,
    insights,
    addActivity,
    agentSpeak,
  } = useAgentContext();

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Handle navigation from other pages (e.g. districts page clicking a district)
  useEffect(() => {
    if (location.state?.selectedDistrict) {
      setSelectedDistrict(location.state.selectedDistrict);
    }
  }, [location.state]);

  // Fetch assessment for selected district
  const {
    assessment: districtData,
    isLoading: isLoadingAssessment
  } = useDistrictAssessment(selectedDistrict);

  // Agent stream for improvements
  const {
    improvements,
    improvementSummary,
    deliberation,
    simulationResult,
    isLoadingPlan,
    isLoadingSimulation,
    getImprovementPlan,
    simulateImpact,
    reset: resetAgent
  } = useAgentStream();

  // Update agent status based on loading states
  useEffect(() => {
    if (isLoadingAssessment) {
      setAgentStatus('analyzing');
    } else if (isLoadingPlan) {
      setAgentStatus('generating');
    } else if (districtData) {
      setAgentStatus('complete');
    } else {
      setAgentStatus('idle');
    }
  }, [isLoadingAssessment, isLoadingPlan, districtData]);

  // Build pipeline steps reactively from current state
  const pipelineSteps = useMemo(() => {
    if (!selectedDistrict) return [];

    const steps = [];

    // Monitor Agent — active when district selected, done when assessment starts
    if (isLoadingAssessment) {
      steps.push({ agent: 'monitor', status: 'done', message: `Detected selection: ${selectedDistrict}` });
      steps.push({ agent: 'analyst', status: 'active', message: 'Scoring from data.gov.sg, GeoJSON, MRT data...' });
    } else if (districtData) {
      steps.push({ agent: 'monitor', status: 'done', message: `Detected selection: ${selectedDistrict}` });
      steps.push({ agent: 'analyst', status: 'done', message: `Scored ${selectedDistrict}: ${districtData.scores?.overall || '?'}/100 from ${districtData.dataSource === 'real' ? 'live data' : 'cached data'}` });

      // Recommender Agent
      if (isLoadingPlan) {
        steps.push({ agent: 'recommender', status: 'active', message: 'Generating improvement plan via Gemini...' });
      } else if (improvements.length > 0) {
        steps.push({ agent: 'recommender', status: 'done', message: `${improvements.length} improvements identified` });

        // Critic Agent
        if (deliberation && deliberation.length > 0) {
          const critic = deliberation.find(d => d.agent === 'critic');
          steps.push({ agent: 'critic', status: 'done', message: critic ? `Review: ${critic.agreement || 'complete'}` : 'Deliberation complete' });
        } else if (isLoadingPlan) {
          // Still part of the plan loading phase
        } else {
          steps.push({ agent: 'critic', status: 'done', message: 'Review complete' });
        }

        // Vision Agent
        if (isLoadingSimulation) {
          steps.push({ agent: 'vision', status: 'active', message: 'Generating visualization via Gemini...' });
        } else if (simulationResult) {
          steps.push({ agent: 'vision', status: 'done', message: simulationResult.imageUrl ? 'Impact vision generated' : 'Vision generation attempted' });
        } else {
          steps.push({ agent: 'vision', status: 'idle', message: 'Awaiting visualization request' });
        }
      } else {
        steps.push({ agent: 'recommender', status: 'idle', message: 'Awaiting plan request' });
      }
    } else if (selectedDistrict) {
      steps.push({ agent: 'monitor', status: 'active', message: `Selecting ${selectedDistrict}...` });
    }

    return steps;
  }, [selectedDistrict, isLoadingAssessment, districtData, isLoadingPlan, improvements, deliberation, isLoadingSimulation, simulationResult]);

  const handleDistrictSelect = useCallback((district) => {
    setSelectedDistrict(district);
    resetAgent();
    addActivity({ type: 'analysis', message: `Started analysis of ${district}` });
  }, [resetAgent, addActivity]);

  const handleDistrictHover = useCallback((district) => {
    setHoveredDistrict(district);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedDistrict(null);
    resetAgent();
  }, [resetAgent]);

  const handleGetPlan = useCallback(async () => {
    if (!selectedDistrict || !districtData) return;
    try {
      agentSpeak(`Analyzing ${selectedDistrict}'s weak areas and generating targeted improvements...`, 'info', 8000);
      const data = await getImprovementPlan(selectedDistrict, districtData.scores);
      addActivity({ type: 'action', message: `Generated improvement plan for ${selectedDistrict}` });
      if (data.reasoning) {
        agentSpeak(data.reasoning, 'recommendation', 10000);
      }
    } catch (err) {
      agentSpeak(`Failed to generate plan for ${selectedDistrict}. Using fallback analysis.`, 'warning', 5000);
      console.error('Failed to get improvement plan:', err);
    }
  }, [selectedDistrict, districtData, getImprovementPlan, addActivity, agentSpeak]);

  const handleSimulate = useCallback(async () => {
    if (!selectedDistrict || improvements.length === 0) return;
    try {
      agentSpeak(`Generating a vision of ${selectedDistrict} after improvements...`, 'info', 12000);
      const result = await simulateImpact(selectedDistrict, improvements);
      addActivity({ type: 'insight', message: `Generated impact vision for ${selectedDistrict}` });
      agentSpeak(result.analysis || `Here's what ${selectedDistrict} could look like after the improvements.`, 'recommendation', 10000);
    } catch (err) {
      agentSpeak(`Simulation encountered an issue. Retrying with fallback model.`, 'warning', 5000);
      console.error('Failed to simulate impact:', err);
    }
  }, [selectedDistrict, improvements, simulateImpact, addActivity, agentSpeak]);

  if (isLoadingScores) {
    return <LoadingOverlay message="Loading district data..." />;
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative">
        <SingaporeMap
          districtScores={districtScores}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={handleDistrictSelect}
          onDistrictHover={handleDistrictHover}
        />

        {/* Recommendations Toggle Button */}
        <button
          data-tour="recommendations"
          onClick={() => setShowRecommendations(!showRecommendations)}
          className={`absolute top-16 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            showRecommendations
              ? 'bg-leaf text-forest-dark'
              : 'bg-forest/90 backdrop-blur border border-forest-light/50 hover:border-leaf/40'
          }`}
        >
          <svg className={`w-5 h-5 ${showRecommendations ? 'text-forest-dark' : 'text-leaf'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className={`text-sm ${showRecommendations ? 'text-forest-dark' : 'text-text-secondary'}`}>
            {isThinking ? 'Analyzing...' : 'Recommendations'}
          </span>
          {recommendations.length > 0 && !showRecommendations && (
            <span className="bg-leaf text-forest-dark text-xs font-bold px-1.5 py-0.5 rounded-full">
              {recommendations.length}
            </span>
          )}
        </button>

        {/* Recommendations Panel Overlay */}
        {showRecommendations && (recommendations.length > 0 || insights.length > 0) && (
          <div className="absolute top-28 left-4 z-[1000] w-96 max-h-[calc(100vh-240px)] overflow-auto">
            <RecommendationsPanel
              recommendations={recommendations}
              insights={insights}
              onAction={(rec) => {
                if (rec.district) {
                  handleDistrictSelect(rec.district);
                  setShowRecommendations(false);
                }
              }}
              onClose={() => setShowRecommendations(false)}
            />
          </div>
        )}

      </div>

      {/* Side Panel */}
      <SidePanel
        district={selectedDistrict}
        districtData={districtData}
        isLoading={isLoadingAssessment}
        onClose={handleClosePanel}
        overviewContent={<OverviewStats districtScores={districtScores} onDistrictSelect={handleDistrictSelect} />}
      >
        {districtData && (
          <AgentPanel
            district={selectedDistrict}
            insights={districtData.insights || []}
            status={agentStatus}
            improvements={improvements}
            improvementSummary={improvementSummary}
            deliberation={deliberation}
            simulationResult={simulationResult}
            pipelineSteps={pipelineSteps}
            onGetPlan={handleGetPlan}
            onSimulate={handleSimulate}
            isLoadingPlan={isLoadingPlan}
            isLoadingSimulation={isLoadingSimulation}
          />
        )}
      </SidePanel>
    </div>
  );
}
