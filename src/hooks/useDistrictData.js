import { useState, useEffect, useCallback } from 'react';
import { agentService } from '../services/agentService';

export const useDistrictData = () => {
  const [districtScores, setDistrictScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await agentService.getAllDistrictScores();
      setDistrictScores(data.districts || {});
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch district scores:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return {
    districtScores,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchScores
  };
};

export const useDistrictAssessment = (districtName) => {
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssessment = useCallback(async () => {
    if (!districtName) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await agentService.assessDistrict(districtName);
      setAssessment(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to assess district:', err);
    } finally {
      setIsLoading(false);
    }
  }, [districtName]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  return {
    assessment,
    isLoading,
    error,
    refetch: fetchAssessment
  };
};

export default useDistrictData;
