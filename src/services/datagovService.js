const DATAGOV_BASE = 'https://api.data.gov.sg/v1';

async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${DATAGOV_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Data.gov.sg API Error: ${endpoint}`, error);
    return null;
  }
}

export const datagovService = {
  // ============ ENVIRONMENT APIs ============

  async getPSI() {
    return fetchAPI('/environment/psi');
  },

  async getPM25() {
    return fetchAPI('/environment/pm25');
  },

  async getTemperature() {
    return fetchAPI('/environment/air-temperature');
  },

  async getHumidity() {
    return fetchAPI('/environment/relative-humidity');
  },

  async getRainfall() {
    return fetchAPI('/environment/rainfall');
  },

  async getUVIndex() {
    return fetchAPI('/environment/uv-index');
  },

  async getWeatherForecast(duration = '2-hour') {
    // duration: '2-hour', '24-hour', or '4-day'
    return fetchAPI(`/environment/${duration}-weather-forecast`);
  },

  // ============ TRANSPORT APIs ============

  async getCarparkAvailability() {
    return fetchAPI('/transport/carpark-availability');
  },

  async getTaxiAvailability() {
    return fetchAPI('/transport/taxi-availability');
  },

  async getTrafficImages() {
    return fetchAPI('/transport/traffic-images');
  },

  // ============ AGGREGATED FETCH ============

  async getAllEnvironmentData() {
    const [psi, pm25, temperature, humidity, forecast] = await Promise.all([
      this.getPSI(),
      this.getPM25(),
      this.getTemperature(),
      this.getHumidity(),
      this.getWeatherForecast('2-hour'),
    ]);

    return {
      psi: psi?.items?.[0] || null,
      pm25: pm25?.items?.[0] || null,
      temperature: temperature?.items?.[0] || null,
      humidity: humidity?.items?.[0] || null,
      forecast: forecast?.items?.[0] || null,
      timestamp: new Date().toISOString(),
    };
  },

  // Get PSI reading for a specific region
  getPSIForRegion(psiData, region) {
    if (!psiData?.readings?.psi_twenty_four_hourly) return null;
    return psiData.readings.psi_twenty_four_hourly[region] || null;
  },

  // Get PM2.5 reading for a specific region
  getPM25ForRegion(pm25Data, region) {
    if (!pm25Data?.readings?.pm25_one_hourly) return null;
    return pm25Data.readings.pm25_one_hourly[region] || null;
  },

  // Get weather forecast for a specific area
  getForecastForArea(forecastData, areaName) {
    if (!forecastData?.forecasts) return null;
    const match = forecastData.forecasts.find(
      f => f.area.toLowerCase() === areaName.toLowerCase()
    );
    return match?.forecast || null;
  },

  // Get nearest temperature reading
  getNearestTemperature(tempData, lat, lng) {
    if (!tempData?.readings || !tempData.metadata?.stations) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const reading of tempData.readings) {
      const station = tempData.metadata.stations.find(s => s.id === reading.station_id);
      if (!station?.location) continue;

      const dist = Math.sqrt(
        Math.pow(station.location.latitude - lat, 2) +
        Math.pow(station.location.longitude - lng, 2)
      );

      if (dist < minDist) {
        minDist = dist;
        nearest = { ...reading, station };
      }
    }

    return nearest;
  },

  // Get nearest humidity reading
  getNearestHumidity(humidityData, lat, lng) {
    if (!humidityData?.readings || !humidityData.metadata?.stations) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const reading of humidityData.readings) {
      const station = humidityData.metadata.stations.find(s => s.id === reading.station_id);
      if (!station?.location) continue;

      const dist = Math.sqrt(
        Math.pow(station.location.latitude - lat, 2) +
        Math.pow(station.location.longitude - lng, 2)
      );

      if (dist < minDist) {
        minDist = dist;
        nearest = { ...reading, station };
      }
    }

    return nearest;
  },
};

export default datagovService;
