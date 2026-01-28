import { useState, useCallback } from 'react';
import { agentService } from '../services/agentService';

export const useAgentStream = () => {
  const [improvements, setImprovements] = useState([]);
  const [improvementSummary, setImprovementSummary] = useState('');
  const [deliberation, setDeliberation] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [error, setError] = useState(null);

  const getImprovementPlan = useCallback(async (districtName, currentScores) => {
    try {
      setIsLoadingPlan(true);
      setError(null);
      const data = await agentService.getImprovementPlan(districtName, currentScores);
      setImprovements(data.improvements || []);
      setImprovementSummary(data.summary || '');
      setDeliberation(data.deliberation || null);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get improvement plan:', err);
      throw err;
    } finally {
      setIsLoadingPlan(false);
    }
  }, []);

  const simulateImpact = useCallback(async (districtName, selectedImprovements) => {
    try {
      setIsLoadingSimulation(true);
      setError(null);
      const data = await agentService.simulateImpact(districtName, selectedImprovements);
      setSimulationResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to simulate impact:', err);
      throw err;
    } finally {
      setIsLoadingSimulation(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImprovements([]);
    setImprovementSummary('');
    setDeliberation(null);
    setSimulationResult(null);
    setError(null);
  }, []);

  return {
    improvements,
    improvementSummary,
    deliberation,
    simulationResult,
    isLoadingPlan,
    isLoadingSimulation,
    error,
    getImprovementPlan,
    simulateImpact,
    reset
  };
};

export default useAgentStream;
