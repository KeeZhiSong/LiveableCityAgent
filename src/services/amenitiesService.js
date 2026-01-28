// Amenities Service - Loads GeoJSON data and provides proximity queries

// Cache for loaded data
const dataCache = new Map();

// Load GeoJSON file with caching
async function loadGeoJSON(filename) {
  if (dataCache.has(filename)) {
    return dataCache.get(filename);
  }

  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) throw new Error(`Failed to load ${filename}`);
    const data = await response.json();
    dataCache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return { features: [] };
  }
}

// Preload essential data files
let dataLoaded = false;
async function ensureDataLoaded() {
  if (dataLoaded) return;

  await Promise.all([
    loadGeoJSON('HawkerCentresGEOJSON.geojson'),
    loadGeoJSON('Parks.geojson'),
    loadGeoJSON('SupermarketsGEOJSON.geojson'),
    loadGeoJSON('ChildCareServices.geojson'),
    loadGeoJSON('GymsSGGEOJSON.geojson'),
    loadGeoJSON('CyclingPathNetworkGEOJSON.geojson'),
    loadGeoJSON('DengueClustersGEOJSON.geojson'),
  ]);

  dataLoaded = true;
}

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Extract coordinates from GeoJSON feature
function getCoordinates(feature) {
  if (!feature.geometry) return null;

  const { type, coordinates } = feature.geometry;

  if (type === 'Point') {
    // GeoJSON uses [lng, lat] order
    return { lat: coordinates[1], lng: coordinates[0] };
  } else if (type === 'LineString') {
    // For lines, return the midpoint
    const midIndex = Math.floor(coordinates.length / 2);
    return { lat: coordinates[midIndex][1], lng: coordinates[midIndex][0] };
  } else if (type === 'Polygon') {
    // For polygons, calculate centroid of first ring
    const ring = coordinates[0];
    const n = ring.length;
    let latSum = 0, lngSum = 0;
    for (const coord of ring) {
      lngSum += coord[0];
      latSum += coord[1];
    }
    return { lat: latSum / n, lng: lngSum / n };
  }

  return null;
}

// Extract name from feature properties
function getName(feature, type) {
  const props = feature.properties || {};

  switch (type) {
    case 'hawker':
      return props.NAME || props.ADDRESSBUILDINGNAME || 'Hawker Centre';
    case 'park':
      return props.NAME || 'Park';
    case 'supermarket':
      // Parse HTML description for supermarket data
      if (props.Description) {
        const match = props.Description.match(/LIC_NAME<\/th>\s*<td>([^<]+)/);
        if (match) {
          // Clean up the name
          let name = match[1].trim();
          // Shorten long names
          if (name.length > 30) {
            name = name.substring(0, 27) + '...';
          }
          return name;
        }
      }
      return 'Supermarket';
    case 'childcare':
      if (props.Description) {
        const match = props.Description.match(/NAME<\/th>\s*<td>([^<]+)/);
        if (match) return match[1].trim();
      }
      return props.CENTRE_NAME || props.NAME || 'Childcare';
    case 'preschool':
      if (props.Description) {
        const match = props.Description.match(/CENTRE_NAME<\/th>\s*<td>([^<]+)/);
        if (match) return match[1].trim();
      }
      return 'Preschool';
    case 'gym':
      return props.NAME || 'Gym';
    case 'museum':
      return props.NAME || 'Museum';
    case 'cycling':
      return props.CYL_PATH ? `${props.CYL_PATH} Cycling Path` : 'Cycling Path';
    case 'dengue':
      return 'Dengue Cluster';
    default:
      return props.NAME || props.name || 'Unknown';
  }
}

// Find nearest amenities of a given type
function findNearest(lat, lng, features, type, limit = 1, maxDistance = 5000) {
  const results = [];

  for (const feature of features) {
    const coords = getCoordinates(feature);
    if (!coords) continue;

    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);

    if (distance <= maxDistance) {
      results.push({
        type,
        name: getName(feature, type),
        distance: Math.round(distance),
        lat: coords.lat,
        lng: coords.lng,
      });
    }
  }

  // Sort by distance and return top N
  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, limit);
}

// Find distance to nearest cycling path (LineString)
function findNearestCyclingPath(lat, lng, features, maxDistance = 2000) {
  let minDistance = Infinity;
  let nearestPath = null;

  for (const feature of features) {
    if (feature.geometry?.type !== 'LineString') continue;

    const coordinates = feature.geometry.coordinates;

    // Check distance to each point of the line (simplified)
    for (const coord of coordinates) {
      const distance = calculateDistance(lat, lng, coord[1], coord[0]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPath = feature;
      }
    }
  }

  if (minDistance <= maxDistance && nearestPath) {
    return {
      type: 'cycling',
      name: nearestPath.properties?.CYL_PATH ? `${nearestPath.properties.CYL_PATH} Path` : 'Cycling Path',
      distance: Math.round(minDistance),
    };
  }

  return null;
}

// Check if location is near a dengue cluster
function checkDengueClusters(lat, lng, features, maxDistance = 500) {
  for (const feature of features) {
    const coords = getCoordinates(feature);
    if (!coords) continue;

    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance <= maxDistance) {
      return {
        inCluster: true,
        distance: Math.round(distance),
      };
    }
  }
  return { inCluster: false };
}

// Calculate walkability score based on amenity distances with breakdown
function calculateWalkabilityScore(amenities, dengueStatus) {
  let score = 50; // Base score
  const breakdown = [{ label: 'Base score', points: 50, type: 'base' }];

  for (const amenity of amenities) {
    const { type, distance, name } = amenity;
    let points = 0;

    switch (type) {
      case 'hawker':
        if (distance <= 300) points = 12;
        else if (distance <= 500) points = 8;
        else if (distance <= 800) points = 4;
        break;
      case 'park':
        if (distance <= 300) points = 10;
        else if (distance <= 500) points = 6;
        else if (distance <= 800) points = 3;
        break;
      case 'supermarket':
        if (distance <= 400) points = 8;
        else if (distance <= 700) points = 5;
        else if (distance <= 1000) points = 2;
        break;
      case 'childcare':
        if (distance <= 500) points = 5;
        else if (distance <= 800) points = 3;
        break;
      case 'cycling':
        if (distance <= 200) points = 8;
        else if (distance <= 500) points = 5;
        else if (distance <= 800) points = 2;
        break;
      case 'gym':
        if (distance <= 500) points = 3;
        else if (distance <= 1000) points = 1;
        break;
    }

    if (points > 0) {
      score += points;
      breakdown.push({
        label: name || type,
        type,
        points,
        distance,
      });
    }
  }

  // Penalty for dengue cluster
  if (dengueStatus?.inCluster) {
    score -= 15;
    breakdown.push({
      label: 'Dengue cluster nearby',
      type: 'dengue',
      points: -15,
      distance: dengueStatus.distance,
    });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
  };
}

export const amenitiesService = {
  // Initialize / preload data
  async init() {
    await ensureDataLoaded();
  },

  // Get detailed proximity data for street view
  async getProximityData(lat, lng) {
    await ensureDataLoaded();

    const hawkerData = dataCache.get('HawkerCentresGEOJSON.geojson');
    const parksData = dataCache.get('Parks.geojson');
    const supermarketsData = dataCache.get('SupermarketsGEOJSON.geojson');
    const childcareData = dataCache.get('ChildCareServices.geojson');
    const gymsData = dataCache.get('GymsSGGEOJSON.geojson');
    const cyclingData = dataCache.get('CyclingPathNetworkGEOJSON.geojson');
    const dengueData = dataCache.get('DengueClustersGEOJSON.geojson');

    const amenities = [];

    // Find nearest of each type
    const hawkers = findNearest(lat, lng, hawkerData?.features || [], 'hawker', 1, 2000);
    const parks = findNearest(lat, lng, parksData?.features || [], 'park', 1, 2000);
    const supermarkets = findNearest(lat, lng, supermarketsData?.features || [], 'supermarket', 1, 2000);
    const childcare = findNearest(lat, lng, childcareData?.features || [], 'childcare', 1, 2000);
    const gyms = findNearest(lat, lng, gymsData?.features || [], 'gym', 1, 3000);

    // Add to results
    if (hawkers.length) amenities.push(hawkers[0]);
    if (parks.length) amenities.push(parks[0]);
    if (supermarkets.length) amenities.push(supermarkets[0]);
    if (childcare.length) amenities.push(childcare[0]);
    if (gyms.length) amenities.push(gyms[0]);

    // Check cycling path
    const cycling = findNearestCyclingPath(lat, lng, cyclingData?.features || []);
    if (cycling) amenities.push(cycling);

    // Check dengue clusters (safety)
    const dengueStatus = checkDengueClusters(lat, lng, dengueData?.features || []);

    // Sort by distance
    amenities.sort((a, b) => a.distance - b.distance);

    // Calculate walkability score with breakdown
    const walkabilityResult = calculateWalkabilityScore(amenities, dengueStatus);

    return {
      amenities,
      dengueStatus,
      walkabilityScore: walkabilityResult.score,
      scoreBreakdown: walkabilityResult.breakdown,
    };
  },

  // Get all nearby amenities (simple list)
  async getNearbyAmenities(lat, lng) {
    const data = await this.getProximityData(lat, lng);
    return data.amenities;
  },
};

export default amenitiesService;
