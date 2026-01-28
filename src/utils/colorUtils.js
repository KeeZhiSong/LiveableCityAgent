export const getDistrictFillColor = (score) => {
  if (score >= 80) return '#22c55e'; // leaf green
  if (score >= 60) return '#84cc16'; // lime
  if (score >= 40) return '#f59e0b'; // amber
  return '#f43f5e'; // rose
};

export const getDistrictOpacity = (score, isHovered, isSelected) => {
  if (isSelected) return 0.8;
  if (isHovered) return 0.75;
  return 0.5;
};

export const getDistrictBorderColor = (isSelected) => {
  return isSelected ? '#4ade80' : 'rgba(34, 197, 94, 0.3)';
};

export const getDistrictBorderWeight = (isSelected) => {
  return isSelected ? 3 : 1;
};

export const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getImpactColor = (impact) => {
  switch (impact) {
    case 'high': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'low': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    transport: '#14b8a6',
    greenSpace: '#22c55e',
    airQuality: '#84cc16',
    amenities: '#f59e0b',
    safety: '#8b5cf6',
    greenCoverage: '#10b981',
    vectorSafety: '#f43f5e',
    climate: '#06b6d4'
  };
  return colors[category] || '#6b7280';
};
