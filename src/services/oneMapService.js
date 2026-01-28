const ONEMAP_API_KEY = import.meta.env.VITE_ONEMAP_API_KEY;
// Use proxy in development to avoid CORS issues
const ONEMAP_BASE_URL = import.meta.env.DEV
  ? '/api/onemap'
  : 'https://www.onemap.gov.sg/api';

// Helper to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': ONEMAP_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`OneMap API error: ${response.status}`);
  }

  return response.json();
};

export const oneMapService = {
  /**
   * Get population data for a planning area
   * @param {string} planningArea - Planning area name (e.g., "Tampines")
   * @param {string} year - Year for data (default: "2020")
   */
  async getPopulationData(planningArea, year = '2020') {
    try {
      const url = `${ONEMAP_BASE_URL}/public/popapi/getPopulationByPlanningArea?planningArea=${encodeURIComponent(planningArea)}&year=${year}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error(`Failed to get population for ${planningArea}:`, error);
      return null;
    }
  },

  /**
   * Get economic status data for a planning area
   */
  async getEconomicStatus(planningArea, year = '2020') {
    try {
      const url = `${ONEMAP_BASE_URL}/public/popapi/getEconomicStatus?planningArea=${encodeURIComponent(planningArea)}&year=${year}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error(`Failed to get economic status for ${planningArea}:`, error);
      return null;
    }
  },

  /**
   * Search for nearby amenities/transport
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters
   */
  async searchNearby(lat, lng, searchVal, radius = 500) {
    try {
      const url = `${ONEMAP_BASE_URL}/public/revgeocode?location=${lat},${lng}&buffer=${radius}&addressType=All&otherFeatures=Y`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error('Failed to search nearby:', error);
      return null;
    }
  },

  /**
   * Get theme data (parks, hawker centers, etc.)
   * @param {string} queryName - Theme query name
   */
  async getThemeData(queryName) {
    try {
      const url = `${ONEMAP_BASE_URL}/public/themesvc/retrieveTheme?queryName=${encodeURIComponent(queryName)}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error(`Failed to get theme ${queryName}:`, error);
      return null;
    }
  },

  /**
   * Get all available themes
   */
  async getAllThemes() {
    try {
      const url = `${ONEMAP_BASE_URL}/public/themesvc/getAllThemesInfo`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error('Failed to get themes:', error);
      return null;
    }
  },

  /**
   * Get routing between two points
   */
  async getRoute(startLat, startLng, endLat, endLng, routeType = 'pt') {
    try {
      const url = `${ONEMAP_BASE_URL}/public/routingsvc/route?start=${startLat},${startLng}&end=${endLat},${endLng}&routeType=${routeType}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error('Failed to get route:', error);
      return null;
    }
  },

  /**
   * Search for a location
   */
  async search(searchVal, returnGeom = 'Y', getAddrDetails = 'Y') {
    try {
      const url = `${ONEMAP_BASE_URL}/common/elastic/search?searchVal=${encodeURIComponent(searchVal)}&returnGeom=${returnGeom}&getAddrDetails=${getAddrDetails}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error('Failed to search:', error);
      return null;
    }
  },

  /**
   * Get planning area for a coordinate
   */
  async getPlanningArea(lat, lng, year = '2019') {
    try {
      const url = `${ONEMAP_BASE_URL}/public/popapi/getPlanningareaNames?year=${year}`;
      const data = await fetchWithAuth(url);
      return data;
    } catch (error) {
      console.error('Failed to get planning area:', error);
      return null;
    }
  },

  /**
   * Reverse geocode a coordinate to get address
   */
  async reverseGeocode(lat, lng, buffer = 50) {
    try {
      const url = `${ONEMAP_BASE_URL}/public/revgeocode?location=${lat},${lng}&buffer=${buffer}&addressType=All`;
      const data = await fetchWithAuth(url);
      if (data.GeocodeInfo && data.GeocodeInfo.length > 0) {
        const info = data.GeocodeInfo[0];
        return info.BUILDINGNAME || (info.BLOCK ? `${info.BLOCK} ${info.ROAD}` : info.ROAD) || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
      return null;
    }
  },

  /**
   * Fetch comprehensive district data including population breakdown
   */
  async getDistrictAnalytics(planningArea) {
    try {
      const [population, economic] = await Promise.all([
        this.getPopulationData(planningArea),
        this.getEconomicStatus(planningArea),
      ]);

      // Calculate metrics from real data
      let totalPopulation = 0;
      let workingPopulation = 0;

      if (population && population.Result) {
        // Sum up population from all age groups
        population.Result.forEach(item => {
          const pop = parseInt(item.population) || 0;
          totalPopulation += pop;
        });
      }

      if (economic && economic.Result) {
        economic.Result.forEach(item => {
          const employed = parseInt(item.employed) || 0;
          workingPopulation += employed;
        });
      }

      return {
        planningArea,
        totalPopulation,
        workingPopulation,
        employmentRate: totalPopulation > 0 ? (workingPopulation / totalPopulation * 100).toFixed(1) : 0,
        rawPopulation: population,
        rawEconomic: economic,
      };
    } catch (error) {
      console.error(`Failed to get district analytics for ${planningArea}:`, error);
      return null;
    }
  }
};

export default oneMapService;
