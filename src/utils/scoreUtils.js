export const getScoreCategory = (score) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'critical';
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e'; // leaf
  if (score >= 60) return '#84cc16'; // lime
  if (score >= 40) return '#f59e0b'; // amber
  return '#f43f5e'; // rose
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

export const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    default: return '→';
  }
};

export const getTrendColor = (trend) => {
  switch (trend) {
    case 'up': return '#22c55e';
    case 'down': return '#f43f5e';
    default: return '#6b7280';
  }
};

export const formatScore = (score) => {
  return Math.round(score);
};

export const calculateOverallScore = (scores) => {
  const weights = {
    airQuality: 0.2,
    transport: 0.25,
    greenSpace: 0.2,
    amenities: 0.2,
    safety: 0.15
  };

  let total = 0;
  let weightSum = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    if (scores[key] !== undefined) {
      total += scores[key] * weight;
      weightSum += weight;
    }
  });

  return weightSum > 0 ? Math.round(total / weightSum * weightSum) : 0;
};
