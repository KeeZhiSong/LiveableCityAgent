// Real Scoring Service - Computes liveability scores from real Singapore data
import { datagovService } from './datagovService';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

// District centroids (approximate coordinates for each planning area)
const DISTRICT_CENTROIDS = {
  "Ang Mo Kio": { lat: 1.3691, lng: 103.8454, region: 'north' },
  "Bedok": { lat: 1.3236, lng: 103.9273, region: 'east' },
  "Bishan": { lat: 1.3526, lng: 103.8352, region: 'central' },
  "Boon Lay": { lat: 1.3187, lng: 103.7064, region: 'west' },
  "Bukit Batok": { lat: 1.3590, lng: 103.7637, region: 'west' },
  "Bukit Merah": { lat: 1.2819, lng: 103.8239, region: 'south' },
  "Bukit Panjang": { lat: 1.3774, lng: 103.7719, region: 'west' },
  "Bukit Timah": { lat: 1.3294, lng: 103.8021, region: 'central' },
  "Choa Chu Kang": { lat: 1.3840, lng: 103.7470, region: 'west' },
  "Clementi": { lat: 1.3162, lng: 103.7649, region: 'west' },
  "Geylang": { lat: 1.3201, lng: 103.8918, region: 'central' },
  "Hougang": { lat: 1.3612, lng: 103.8863, region: 'north' },
  "Jurong East": { lat: 1.3329, lng: 103.7436, region: 'west' },
  "Jurong West": { lat: 1.3404, lng: 103.7090, region: 'west' },
  "Kallang": { lat: 1.3100, lng: 103.8651, region: 'central' },
  "Marine Parade": { lat: 1.3017, lng: 103.9073, region: 'east' },
  "Novena": { lat: 1.3204, lng: 103.8438, region: 'central' },
  "Pasir Ris": { lat: 1.3721, lng: 103.9474, region: 'east' },
  "Paya Lebar": { lat: 1.3180, lng: 103.8914, region: 'central' },
  "Punggol": { lat: 1.4041, lng: 103.9025, region: 'north' },
  "Queenstown": { lat: 1.2942, lng: 103.7861, region: 'central' },
  "Sembawang": { lat: 1.4491, lng: 103.8185, region: 'north' },
  "Sengkang": { lat: 1.3868, lng: 103.8914, region: 'north' },
  "Serangoon": { lat: 1.3554, lng: 103.8679, region: 'north' },
  "Tampines": { lat: 1.3496, lng: 103.9568, region: 'east' },
  "Toa Payoh": { lat: 1.3343, lng: 103.8563, region: 'central' },
  "Woodlands": { lat: 1.4382, lng: 103.7890, region: 'north' },
  "Yishun": { lat: 1.4304, lng: 103.8354, region: 'north' },
  "Downtown Core": { lat: 1.2789, lng: 103.8536, region: 'central' },
  "Marina East": { lat: 1.2807, lng: 103.8636, region: 'central' },
  "Marina South": { lat: 1.2730, lng: 103.8607, region: 'central' },
  "Museum": { lat: 1.2966, lng: 103.8485, region: 'central' },
  "Newton": { lat: 1.3138, lng: 103.8381, region: 'central' },
  "Orchard": { lat: 1.3048, lng: 103.8318, region: 'central' },
  "Outram": { lat: 1.2801, lng: 103.8387, region: 'central' },
  "River Valley": { lat: 1.2916, lng: 103.8302, region: 'central' },
  "Rochor": { lat: 1.3036, lng: 103.8554, region: 'central' },
  "Singapore River": { lat: 1.2879, lng: 103.8461, region: 'central' },
  "Tanglin": { lat: 1.3077, lng: 103.8123, region: 'central' },
  "Changi": { lat: 1.3644, lng: 103.9915, region: 'east' },
  "Changi Bay": { lat: 1.3311, lng: 104.0086, region: 'east' },
  "Pioneer": { lat: 1.3149, lng: 103.6973, region: 'west' },
  "Tuas": { lat: 1.3187, lng: 103.6363, region: 'west' },
  "Sungei Kadut": { lat: 1.4172, lng: 103.7548, region: 'north' },
  "Central Water Catchment": { lat: 1.3724, lng: 103.8133, region: 'central' },
  "Lim Chu Kang": { lat: 1.4258, lng: 103.7122, region: 'west' },
  "Mandai": { lat: 1.4044, lng: 103.7888, region: 'north' },
  "Seletar": { lat: 1.4047, lng: 103.8679, region: 'north' },
  "Simpang": { lat: 1.4315, lng: 103.8648, region: 'north' },
  "Western Water Catchment": { lat: 1.3842, lng: 103.6989, region: 'west' },
  "Tengah": { lat: 1.3685, lng: 103.7390, region: 'west' },
  "Straits View": { lat: 1.2750, lng: 103.8650, region: 'south' },
  "North-Eastern Islands": { lat: 1.3789, lng: 104.0183, region: 'east' },
  "Southern Islands": { lat: 1.2300, lng: 103.8300, region: 'south' },
  "Western Islands": { lat: 1.2600, lng: 103.7200, region: 'west' },
};

// MRT stations per district (static data - updated as of 2024)
const MRT_STATIONS = {
  "Ang Mo Kio": 3,
  "Bedok": 4,
  "Bishan": 2,
  "Boon Lay": 2,
  "Bukit Batok": 2,
  "Bukit Merah": 5,
  "Bukit Panjang": 3,
  "Bukit Timah": 4,
  "Choa Chu Kang": 2,
  "Clementi": 2,
  "Geylang": 3,
  "Hougang": 3,
  "Jurong East": 2,
  "Jurong West": 3,
  "Kallang": 3,
  "Marine Parade": 3,
  "Novena": 2,
  "Pasir Ris": 3,
  "Paya Lebar": 2,
  "Punggol": 3,
  "Queenstown": 4,
  "Sembawang": 2,
  "Sengkang": 4,
  "Serangoon": 3,
  "Tampines": 5,
  "Toa Payoh": 2,
  "Woodlands": 3,
  "Yishun": 2,
  "Downtown Core": 8,
  "Marina East": 1,
  "Marina South": 2,
  "Museum": 3,
  "Newton": 1,
  "Orchard": 3,
  "Outram": 4,
  "River Valley": 1,
  "Rochor": 2,
  "Singapore River": 2,
  "Tanglin": 1,
  "Changi": 2,
  "Changi Bay": 0,
  "Pioneer": 1,
  "Tuas": 0,
  "Sungei Kadut": 0,
  "Central Water Catchment": 0,
  "Lim Chu Kang": 0,
  "Mandai": 0,
  "Seletar": 0,
  "Simpang": 0,
  "Western Water Catchment": 0,
  "Tengah": 0,
  "Straits View": 0,
  "North-Eastern Islands": 0,
  "Southern Islands": 0,
  "Western Islands": 0,
};

// Cache for computed scores and amenity data
const scoreCache = new Map();
const amenityCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for real-time data
const STATIC_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for static data

// Load and cache GeoJSON data
async function loadGeoJSON(filename) {
  if (amenityCache.has(filename)) {
    const cached = amenityCache.get(filename);
    if (Date.now() - cached.timestamp < STATIC_CACHE_DURATION) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) throw new Error(`Failed to load ${filename}`);
    const data = await response.json();
    amenityCache.set(filename, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return { features: [] };
  }
}

// Haversine distance in meters
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get coordinates from GeoJSON feature
function getCoords(feature) {
  if (!feature.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Point') return { lat: coordinates[1], lng: coordinates[0] };
  if (type === 'Polygon') {
    const ring = coordinates[0];
    const lat = ring.reduce((sum, c) => sum + c[1], 0) / ring.length;
    const lng = ring.reduce((sum, c) => sum + c[0], 0) / ring.length;
    return { lat, lng };
  }
  return null;
}

// Count amenities within radius of a point
function countAmenitiesInRadius(lat, lng, features, radius = 2000) {
  let count = 0;
  for (const feature of features) {
    const coords = getCoords(feature);
    if (coords && calculateDistance(lat, lng, coords.lat, coords.lng) <= radius) {
      count++;
    }
  }
  return count;
}

// PSI to score conversion (lower PSI = higher score)
function psiToScore(psi) {
  if (psi === null || psi === undefined) return 70; // Default
  if (psi <= 50) return 95 - (psi * 0.2);  // Good: 95-85
  if (psi <= 100) return 85 - ((psi - 50) * 0.4);  // Moderate: 85-65
  if (psi <= 150) return 65 - ((psi - 100) * 0.4); // Unhealthy: 65-45
  if (psi <= 200) return 45 - ((psi - 150) * 0.3); // Very Unhealthy: 45-30
  return Math.max(10, 30 - ((psi - 200) * 0.2));   // Hazardous: 30-10
}

// Map region name to data.gov.sg region
function mapToDataGovRegion(region) {
  const mapping = {
    'north': 'north',
    'south': 'south',
    'east': 'east',
    'west': 'west',
    'central': 'central',
  };
  return mapping[region] || 'central';
}

// Rainfall to climate score: moderate rainfall = healthy environment
function rainfallToScore(mmPerHour) {
  if (mmPerHour === null || mmPerHour === undefined) return 70;
  if (mmPerHour <= 0) return 60;    // dry/heat stress
  if (mmPerHour <= 5) return 90;    // ideal
  if (mmPerHour <= 20) return 75;   // good
  if (mmPerHour <= 50) return 55;   // heavy
  return 40;                        // flooding concern
}

export const scoringService = {
  /**
   * Get real-time PSI data for all regions
   */
  async getPSIData() {
    const cacheKey = 'psi_data';
    const cached = scoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const psiResponse = await datagovService.getPSI();
      const readings = psiResponse?.items?.[0]?.readings?.psi_twenty_four_hourly || {};
      scoreCache.set(cacheKey, { data: readings, timestamp: Date.now() });
      return readings;
    } catch (error) {
      console.error('Failed to fetch PSI:', error);
      return null;
    }
  },

  /**
   * Load all amenity data for scoring (batch load for speed)
   */
  async loadAllAmenityData() {
    const [hawkers, parks, supermarkets, gyms, childcare, cycling, dengue] = await Promise.all([
      loadGeoJSON('HawkerCentresGEOJSON.geojson'),
      loadGeoJSON('Parks.geojson'),
      loadGeoJSON('SupermarketsGEOJSON.geojson'),
      loadGeoJSON('GymsSGGEOJSON.geojson'),
      loadGeoJSON('ChildCareServices.geojson'),
      loadGeoJSON('CyclingPathNetworkGEOJSON.geojson'),
      loadGeoJSON('DengueClustersGEOJSON.geojson'),
    ]);

    return { hawkers, parks, supermarkets, gyms, childcare, cycling, dengue };
  },

  /**
   * Calculate air quality score for a district
   */
  calculateAirQualityScore(district, psiData) {
    const centroid = DISTRICT_CENTROIDS[district];
    if (!centroid || !psiData) return { score: 70, source: 'default' };

    const region = mapToDataGovRegion(centroid.region);
    const psi = psiData[region];

    if (psi !== undefined) {
      return {
        score: Math.round(psiToScore(psi)),
        psi,
        region,
        source: 'data.gov.sg',
      };
    }

    return { score: 70, source: 'default' };
  },

  /**
   * Calculate transport score based on MRT stations
   */
  calculateTransportScore(district) {
    const stations = MRT_STATIONS[district] || 0;
    // Score formula: base 40 + up to 50 points based on stations
    const score = Math.min(95, 40 + (stations * 8));
    return {
      score,
      mrtStations: stations,
      source: 'static',
    };
  },

  /**
   * Calculate green space score based on parks
   */
  calculateGreenSpaceScore(district, parksData) {
    const centroid = DISTRICT_CENTROIDS[district];
    if (!centroid) return { score: 60, source: 'default' };

    const parksCount = countAmenitiesInRadius(
      centroid.lat, centroid.lng,
      parksData?.features || [],
      3000 // 3km radius
    );

    // Score: base 40 + parks contribution (capped)
    const score = Math.min(95, 40 + (parksCount * 6));
    return {
      score,
      parksNearby: parksCount,
      source: 'geojson',
    };
  },

  /**
   * Calculate amenities score based on hawkers, supermarkets, childcare
   */
  calculateAmenitiesScore(district, amenityData) {
    const centroid = DISTRICT_CENTROIDS[district];
    if (!centroid) return { score: 60, source: 'default' };

    const radius = 2000; // 2km
    const hawkers = countAmenitiesInRadius(centroid.lat, centroid.lng, amenityData.hawkers?.features || [], radius);
    const supermarkets = countAmenitiesInRadius(centroid.lat, centroid.lng, amenityData.supermarkets?.features || [], radius);
    const childcare = countAmenitiesInRadius(centroid.lat, centroid.lng, amenityData.childcare?.features || [], radius);
    const gyms = countAmenitiesInRadius(centroid.lat, centroid.lng, amenityData.gyms?.features || [], radius);

    // Weighted scoring
    const score = Math.min(95, 35 + (hawkers * 5) + (supermarkets * 3) + (childcare * 2) + (gyms * 2));

    return {
      score,
      hawkers,
      supermarkets,
      childcare,
      gyms,
      source: 'geojson',
    };
  },

  /**
   * Calculate safety score based on dengue clusters
   */
  calculateSafetyScore(district, dengueData) {
    const centroid = DISTRICT_CENTROIDS[district];
    if (!centroid) return { score: 75, source: 'default' };

    // Check for dengue clusters within 1km
    const dengueNearby = countAmenitiesInRadius(
      centroid.lat, centroid.lng,
      dengueData?.features || [],
      1000
    );

    // Base score 85, reduce for each dengue cluster
    const score = Math.max(40, 85 - (dengueNearby * 10));

    return {
      score,
      dengueClusters: dengueNearby,
      source: 'geojson',
    };
  },

  /**
   * Get real-time rainfall data
   */
  async getRainfallData() {
    const cacheKey = 'rainfall_data';
    const cached = scoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const rainfallResponse = await datagovService.getRainfall();
      const readings = rainfallResponse?.items?.[0]?.readings || [];
      const stations = rainfallResponse?.metadata?.stations || [];
      const data = { readings, stations };
      scoreCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Failed to fetch rainfall:', error);
      return null;
    }
  },

  /**
   * Calculate climate score based on rainfall data
   */
  calculateClimateScore(district, rainfallData) {
    const centroid = DISTRICT_CENTROIDS[district];
    if (!centroid || !rainfallData?.readings?.length) return { score: 70, source: 'default' };

    // Find nearest rainfall station
    let nearest = null;
    let minDist = Infinity;
    for (const reading of rainfallData.readings) {
      const station = rainfallData.stations.find(s => s.id === reading.station_id);
      if (!station?.location) continue;
      const dist = Math.sqrt(
        Math.pow(station.location.latitude - centroid.lat, 2) +
        Math.pow(station.location.longitude - centroid.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = { value: reading.value, station: station.name };
      }
    }

    if (nearest) {
      return {
        score: Math.round(rainfallToScore(nearest.value)),
        rainfall: nearest.value,
        station: nearest.station,
        source: 'data.gov.sg',
      };
    }
    return { score: 70, source: 'default' };
  },

  /**
   * Compute Environmental Outcomes score for a district
   */
  computeEnvironmentalScore(district, airQualityResult, greenSpaceResult, safetyResult, climateResult) {
    const weights = { airQuality: 0.35, greenCoverage: 0.30, vectorSafety: 0.20, climate: 0.15 };

    const envScore = Math.round(
      airQualityResult.score * weights.airQuality +
      greenSpaceResult.score * weights.greenCoverage +
      safetyResult.score * weights.vectorSafety +
      climateResult.score * weights.climate
    );

    return {
      envScore,
      envAirQuality: airQualityResult.score,
      envGreenCoverage: greenSpaceResult.score,
      envVectorSafety: safetyResult.score,
      envClimate: climateResult.score,
      envDetails: {
        airQuality: airQualityResult,
        greenCoverage: greenSpaceResult,
        vectorSafety: safetyResult,
        climate: climateResult,
      },
    };
  },

  /**
   * Compute full liveability scores for a district
   */
  async computeDistrictScore(district) {
    // Check cache first
    const cacheKey = `score_${district}`;
    const cached = scoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Load all data in parallel
    const [psiData, amenityData, rainfallData] = await Promise.all([
      this.getPSIData(),
      this.loadAllAmenityData(),
      this.getRainfallData(),
    ]);

    // Calculate each metric
    const airQuality = this.calculateAirQualityScore(district, psiData);
    const transport = this.calculateTransportScore(district);
    const greenSpace = this.calculateGreenSpaceScore(district, amenityData.parks);
    const amenities = this.calculateAmenitiesScore(district, amenityData);
    const safety = this.calculateSafetyScore(district, amenityData.dengue);
    const climate = this.calculateClimateScore(district, rainfallData);

    // Calculate weighted overall score (liveability)
    const weights = {
      airQuality: 0.20,
      transport: 0.25,
      greenSpace: 0.20,
      amenities: 0.20,
      safety: 0.15,
    };

    const overall = Math.round(
      airQuality.score * weights.airQuality +
      transport.score * weights.transport +
      greenSpace.score * weights.greenSpace +
      amenities.score * weights.amenities +
      safety.score * weights.safety
    );

    // Calculate environmental outcomes score
    const env = this.computeEnvironmentalScore(district, airQuality, greenSpace, safety, climate);

    const result = {
      district,
      overall,
      airQuality: airQuality.score,
      transport: transport.score,
      greenSpace: greenSpace.score,
      amenities: amenities.score,
      safety: safety.score,
      ...env,
      details: {
        airQuality,
        transport,
        greenSpace,
        amenities,
        safety,
        climate,
      },
      sources: {
        airQuality: airQuality.source,
        transport: 'mrt_stations',
        greenSpace: 'parks_geojson',
        amenities: 'amenities_geojson',
        safety: 'dengue_geojson',
        climate: climate.source,
      },
      computedAt: new Date().toISOString(),
    };

    // Cache the result
    scoreCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  },

  /**
   * Compute scores for ALL districts (optimized batch processing)
   */
  async computeAllDistrictScores() {
    const cacheKey = 'all_scores';
    const cached = scoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    console.log('[ScoringService] Computing scores for all districts...');
    const startTime = Date.now();

    // Load all data once
    const [psiData, amenityData, rainfallData] = await Promise.all([
      this.getPSIData(),
      this.loadAllAmenityData(),
      this.getRainfallData(),
    ]);

    const districts = Object.keys(DISTRICT_CENTROIDS);
    const scores = {};

    // Process all districts
    for (const district of districts) {
      const airQuality = this.calculateAirQualityScore(district, psiData);
      const transport = this.calculateTransportScore(district);
      const greenSpace = this.calculateGreenSpaceScore(district, amenityData.parks);
      const amenitiesScore = this.calculateAmenitiesScore(district, amenityData);
      const safety = this.calculateSafetyScore(district, amenityData.dengue);
      const climate = this.calculateClimateScore(district, rainfallData);

      const weights = { airQuality: 0.20, transport: 0.25, greenSpace: 0.20, amenities: 0.20, safety: 0.15 };
      const overall = Math.round(
        airQuality.score * weights.airQuality +
        transport.score * weights.transport +
        greenSpace.score * weights.greenSpace +
        amenitiesScore.score * weights.amenities +
        safety.score * weights.safety
      );

      const env = this.computeEnvironmentalScore(district, airQuality, greenSpace, safety, climate);

      scores[district] = {
        overall,
        airQuality: airQuality.score,
        transport: transport.score,
        greenSpace: greenSpace.score,
        amenities: amenitiesScore.score,
        safety: safety.score,
        ...env,
      };
    }

    const elapsed = Date.now() - startTime;
    console.log(`[ScoringService] Computed ${districts.length} districts in ${elapsed}ms`);

    const result = {
      districts: scores,
      lastUpdated: new Date().toISOString(),
      sources: ['data.gov.sg PSI', 'GeoJSON amenities', 'Static MRT data'],
      computeTime: elapsed,
    };

    scoreCache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Save to Supabase for n8n to access
    this.saveScoresToSupabase(result).catch(err => {
      console.warn('[ScoringService] Failed to save to Supabase:', err);
    });

    return result;
  },

  /**
   * Save scores to Supabase for external access (n8n, etc.)
   */
  async saveScoresToSupabase(scoresData) {
    if (!isSupabaseEnabled()) {
      console.log('[ScoringService] Supabase not configured, skipping save');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('district_scores')
        .upsert({
          id: 'latest',
          scores: scoresData.districts,
          sources: scoresData.sources,
          computed_at: scoresData.lastUpdated,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      console.log('[ScoringService] Saved scores to Supabase');
      return data;
    } catch (error) {
      console.error('[ScoringService] Supabase save error:', error);
      throw error;
    }
  },

  /**
   * Get all supported districts
   */
  getDistrictList() {
    return Object.keys(DISTRICT_CENTROIDS);
  },

  /**
   * Get centroid for a district
   */
  getDistrictCentroid(district) {
    return DISTRICT_CENTROIDS[district] || null;
  },

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache() {
    scoreCache.clear();
    console.log('[ScoringService] Cache cleared');
  },
};

export default scoringService;
