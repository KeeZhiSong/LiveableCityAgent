import { useState, useEffect, useCallback } from 'react';
import { datagovService } from '../services/datagovService';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useEnvironmentData(autoRefresh = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const envData = await datagovService.getAllEnvironmentData();
      setData(envData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch environment data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  // Helper to get PSI for a region
  const getPSIForRegion = useCallback((region) => {
    return datagovService.getPSIForRegion(data?.psi, region);
  }, [data?.psi]);

  // Helper to get PM2.5 for a region
  const getPM25ForRegion = useCallback((region) => {
    return datagovService.getPM25ForRegion(data?.pm25, region);
  }, [data?.pm25]);

  // Helper to get forecast for an area
  const getForecastForArea = useCallback((areaName) => {
    return datagovService.getForecastForArea(data?.forecast, areaName);
  }, [data?.forecast]);

  // Helper to get nearest temperature
  const getNearestTemperature = useCallback((lat, lng) => {
    return datagovService.getNearestTemperature(data?.temperature, lat, lng);
  }, [data?.temperature]);

  // Helper to get nearest humidity
  const getNearestHumidity = useCallback((lat, lng) => {
    return datagovService.getNearestHumidity(data?.humidity, lat, lng);
  }, [data?.humidity]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
    // Helpers
    getPSIForRegion,
    getPM25ForRegion,
    getForecastForArea,
    getNearestTemperature,
    getNearestHumidity,
  };
}

export default useEnvironmentData;
