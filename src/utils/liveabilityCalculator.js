// Liveability score calculation weights
const WEIGHTS = {
  airQuality: 0.20,
  transport: 0.25,
  greenSpace: 0.15,
  amenities: 0.25,
  safety: 0.10,
  comfort: 0.05,
};

// Region mapping for PSI/PM2.5 data from data.gov.sg
const REGION_MAPPING = {
  north: [
    'Woodlands', 'Sembawang', 'Yishun', 'Mandai', 'Simpang',
    'Sungei Kadut', 'Lim Chu Kang', 'Seletar'
  ],
  south: [
    'Bukit Merah', 'Queenstown', 'Sentosa', 'Telok Blangah',
    'Southern Islands', 'Straits View'
  ],
  east: [
    'Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar',
    'Geylang', 'Marine Parade', 'Changi Bay'
  ],
  west: [
    'Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok',
    'Bukit Panjang', 'Choa Chu Kang', 'Tengah', 'Tuas',
    'Pioneer', 'Boon Lay', 'Western Water Catchment'
  ],
  central: [
    'Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Serangoon', 'Hougang',
    'Sengkang', 'Punggol', 'Orchard', 'Newton', 'Novena',
    'Kallang', 'Bukit Timah', 'Tanglin', 'River Valley',
    'Rochor', 'Downtown Core', 'Marina East', 'Marina South',
    'Museum', 'Singapore River', 'Outram', 'Central Water Catchment'
  ],
};

// Get PSI region for a district
export function getRegionForDistrict(district) {
  const normalizedDistrict = district.toLowerCase();
  for (const [region, areas] of Object.entries(REGION_MAPPING)) {
    if (areas.some(area => normalizedDistrict.includes(area.toLowerCase()))) {
      return region;
    }
  }
  return 'central'; // Default fallback
}

// Calculate air quality score from PSI and PM2.5
export function calculateAirQualityScore(psi, pm25) {
  // PSI scoring: 0-50 = Excellent, 51-100 = Good, 101-200 = Moderate, >200 = Poor
  let psiScore = 100;
  if (psi !== null && psi !== undefined) {
    if (psi <= 50) {
      psiScore = 100;
    } else if (psi <= 100) {
      psiScore = 90 - ((psi - 50) * 0.4); // 90 to 70
    } else if (psi <= 200) {
      psiScore = 70 - ((psi - 100) * 0.5); // 70 to 20
    } else {
      psiScore = Math.max(0, 20 - ((psi - 200) * 0.2));
    }
  }

  // PM2.5 scoring: 0-12 = Excellent, 13-35 = Good, 36-55 = Moderate, >55 = Poor
  let pm25Score = 100;
  if (pm25 !== null && pm25 !== undefined) {
    if (pm25 <= 12) {
      pm25Score = 100;
    } else if (pm25 <= 35) {
      pm25Score = 90 - ((pm25 - 12) * 0.9); // 90 to 70
    } else if (pm25 <= 55) {
      pm25Score = 70 - ((pm25 - 35) * 1.5); // 70 to 40
    } else {
      pm25Score = Math.max(0, 40 - ((pm25 - 55) * 0.8));
    }
  }

  return Math.round((psiScore * 0.6) + (pm25Score * 0.4));
}

// Calculate transport score based on distance to MRT and bus stop count
export function calculateTransportScore(mrtDistance, busStopCount) {
  // MRT proximity: within 500m = excellent, 500-1000m = good
  let mrtScore = 100;
  if (mrtDistance !== null && mrtDistance !== undefined) {
    if (mrtDistance <= 300) {
      mrtScore = 100;
    } else if (mrtDistance <= 500) {
      mrtScore = 95 - ((mrtDistance - 300) * 0.025);
    } else if (mrtDistance <= 1000) {
      mrtScore = 90 - ((mrtDistance - 500) * 0.06);
    } else {
      mrtScore = Math.max(40, 60 - ((mrtDistance - 1000) * 0.02));
    }
  }

  // Bus stops: more = better, max useful count ~10
  let busScore = 50;
  if (busStopCount !== null && busStopCount !== undefined) {
    busScore = Math.min(100, 40 + (busStopCount * 6));
  }

  return Math.round((mrtScore * 0.6) + (busScore * 0.4));
}

// Calculate green space score based on park proximity and count
export function calculateGreenSpaceScore(parkDistance, parkCount) {
  // Park proximity: within 300m = excellent
  let proximityScore = 100;
  if (parkDistance !== null && parkDistance !== undefined) {
    if (parkDistance <= 200) {
      proximityScore = 100;
    } else if (parkDistance <= 500) {
      proximityScore = 95 - ((parkDistance - 200) * 0.05);
    } else if (parkDistance <= 1000) {
      proximityScore = 80 - ((parkDistance - 500) * 0.04);
    } else {
      proximityScore = Math.max(30, 60 - ((parkDistance - 1000) * 0.02));
    }
  }

  // Park count: more parks nearby = better
  let countScore = 50;
  if (parkCount !== null && parkCount !== undefined) {
    countScore = Math.min(100, 40 + (parkCount * 15));
  }

  return Math.round((proximityScore * 0.7) + (countScore * 0.3));
}

// Calculate amenities score
export function calculateAmenitiesScore(hawkerDistance, healthcareDistance, mallDistance) {
  // Hawker centre proximity
  let hawkerScore = 70;
  if (hawkerDistance !== null && hawkerDistance !== undefined) {
    if (hawkerDistance <= 300) {
      hawkerScore = 100;
    } else if (hawkerDistance <= 500) {
      hawkerScore = 95 - ((hawkerDistance - 300) * 0.025);
    } else if (hawkerDistance <= 1000) {
      hawkerScore = 90 - ((hawkerDistance - 500) * 0.04);
    } else {
      hawkerScore = Math.max(40, 70 - ((hawkerDistance - 1000) * 0.02));
    }
  }

  // Healthcare proximity
  let healthcareScore = 70;
  if (healthcareDistance !== null && healthcareDistance !== undefined) {
    if (healthcareDistance <= 500) {
      healthcareScore = 100;
    } else if (healthcareDistance <= 1000) {
      healthcareScore = 90 - ((healthcareDistance - 500) * 0.02);
    } else if (healthcareDistance <= 2000) {
      healthcareScore = 80 - ((healthcareDistance - 1000) * 0.02);
    } else {
      healthcareScore = Math.max(40, 60 - ((healthcareDistance - 2000) * 0.01));
    }
  }

  // Mall/shopping proximity
  let mallScore = 60;
  if (mallDistance !== null && mallDistance !== undefined) {
    if (mallDistance <= 500) {
      mallScore = 100;
    } else if (mallDistance <= 1000) {
      mallScore = 90 - ((mallDistance - 500) * 0.02);
    } else {
      mallScore = Math.max(40, 80 - ((mallDistance - 1000) * 0.02));
    }
  }

  return Math.round((hawkerScore * 0.40) + (healthcareScore * 0.35) + (mallScore * 0.25));
}

// Calculate comfort score from temperature and humidity
export function calculateComfortScore(temperature, humidity) {
  // Optimal temperature: 24-28°C
  let tempScore = 100;
  if (temperature !== null && temperature !== undefined) {
    if (temperature >= 24 && temperature <= 28) {
      tempScore = 100;
    } else if (temperature < 24) {
      tempScore = Math.max(60, 100 - ((24 - temperature) * 8));
    } else {
      tempScore = Math.max(40, 100 - ((temperature - 28) * 12));
    }
  }

  // Optimal humidity: 50-70%
  let humidityScore = 100;
  if (humidity !== null && humidity !== undefined) {
    if (humidity >= 50 && humidity <= 70) {
      humidityScore = 100;
    } else if (humidity < 50) {
      humidityScore = Math.max(60, 100 - ((50 - humidity) * 2));
    } else {
      humidityScore = Math.max(50, 100 - ((humidity - 70) * 2.5));
    }
  }

  return Math.round((tempScore * 0.6) + (humidityScore * 0.4));
}

// Calculate overall liveability score
export function calculateOverallScore(scores) {
  const {
    airQuality = 70,
    transport = 70,
    greenSpace = 70,
    amenities = 70,
    safety = 75,
    comfort = 70
  } = scores;

  return Math.round(
    (airQuality * WEIGHTS.airQuality) +
    (transport * WEIGHTS.transport) +
    (greenSpace * WEIGHTS.greenSpace) +
    (amenities * WEIGHTS.amenities) +
    (safety * WEIGHTS.safety) +
    (comfort * WEIGHTS.comfort)
  );
}

// Calculate walkability score for street view
export function calculateWalkabilityScore(proximityData) {
  if (!proximityData?.amenities) return 70;

  let score = 50; // Base score

  for (const amenity of proximityData.amenities) {
    const distance = amenity.distance;

    // Add points based on amenity type and distance
    switch (amenity.type) {
      case 'mrt':
        if (distance <= 400) score += 15;
        else if (distance <= 800) score += 10;
        else if (distance <= 1200) score += 5;
        break;
      case 'bus':
        if (distance <= 200) score += 10;
        else if (distance <= 400) score += 5;
        break;
      case 'hawker':
        if (distance <= 300) score += 12;
        else if (distance <= 500) score += 8;
        else if (distance <= 800) score += 4;
        break;
      case 'park':
        if (distance <= 300) score += 10;
        else if (distance <= 500) score += 6;
        else if (distance <= 800) score += 3;
        break;
      case 'supermarket':
        if (distance <= 400) score += 8;
        else if (distance <= 700) score += 5;
        else if (distance <= 1000) score += 2;
        break;
      case 'childcare':
      case 'preschool':
        if (distance <= 500) score += 5;
        else if (distance <= 800) score += 3;
        break;
      case 'cycling':
        if (distance <= 200) score += 8;
        else if (distance <= 500) score += 5;
        else if (distance <= 800) score += 2;
        break;
      case 'gym':
        if (distance <= 500) score += 3;
        else if (distance <= 1000) score += 1;
        break;
      case 'mall':
        if (distance <= 500) score += 5;
        else if (distance <= 1000) score += 2;
        break;
    }
  }

  // Penalty for dengue cluster
  if (proximityData.dengueStatus?.inCluster) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
}

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistance(lat1, lng1, lat2, lng2) {
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

export default {
  WEIGHTS,
  getRegionForDistrict,
  calculateAirQualityScore,
  calculateTransportScore,
  calculateGreenSpaceScore,
  calculateAmenitiesScore,
  calculateComfortScore,
  calculateOverallScore,
  calculateWalkabilityScore,
  calculateDistance,
};
