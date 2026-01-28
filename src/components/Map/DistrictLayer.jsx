import { useEffect, useState, useMemo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { getDistrictFillColor } from '../../utils/colorUtils';
import singaporeGeoJson from '../../data/singapore-planning-areas.json';

// Convert "BEDOK" to "Bedok", "ANG MO KIO" to "Ang Mo Kio"
const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get the district name from feature properties
const getDistrictName = (feature) => {
  const rawName = feature.properties.PLN_AREA_N || feature.properties.name || 'Unknown';
  return toTitleCase(rawName);
};

// Style presets for different overlay modes
const overlayStyles = {
  detailed: {
    baseFillOpacity: 0.55,
    hoverFillOpacity: 0.7,
    selectedFillOpacity: 0.8,
    borderOpacity: 0.6,
    weight: 2,
    selectedWeight: 3,
  },
  subtle: {
    baseFillOpacity: 0.35,
    hoverFillOpacity: 0.5,
    selectedFillOpacity: 0.6,
    borderOpacity: 0.4,
    weight: 1.5,
    selectedWeight: 3,
  },
  minimal: {
    baseFillOpacity: 0,
    hoverFillOpacity: 0.15,
    selectedFillOpacity: 0.25,
    borderOpacity: 0.5,
    weight: 2,
    selectedWeight: 3,
  },
  hidden: {
    baseFillOpacity: 0,
    hoverFillOpacity: 0,
    selectedFillOpacity: 0,
    borderOpacity: 0,
    weight: 0,
    selectedWeight: 0,
  },
};

const DistrictLayer = ({
  districtScores = {},
  selectedDistrict,
  onDistrictSelect,
  onDistrictHover,
  overlayMode = 'subtle'
}) => {
  const map = useMap();
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  const modeStyles = overlayStyles[overlayMode] || overlayStyles.subtle;

  // Stable hash of scores to avoid JSON.stringify on every render
  const scoresKey = useMemo(() => {
    const entries = Object.entries(districtScores);
    if (entries.length === 0) return '0';
    return entries.reduce((h, [k, v]) => h + k.length + (v?.overall || 0), 0).toString();
  }, [districtScores]);

  const getDistrictStyle = (feature) => {
    const districtName = getDistrictName(feature);
    const score = districtScores[districtName]?.overall || 50;
    const isSelected = selectedDistrict === districtName;
    const isHovered = hoveredDistrict === districtName;

    // For hidden mode, still show selected district faintly
    if (overlayMode === 'hidden' && !isSelected) {
      return {
        fillColor: 'transparent',
        fillOpacity: 0,
        color: 'transparent',
        weight: 0,
      };
    }

    return {
      fillColor: getDistrictFillColor(score),
      fillOpacity: isSelected
        ? modeStyles.selectedFillOpacity
        : isHovered
          ? modeStyles.hoverFillOpacity
          : modeStyles.baseFillOpacity,
      color: isSelected
        ? '#4ade80'
        : `rgba(34, 197, 94, ${modeStyles.borderOpacity})`,
      weight: isSelected ? modeStyles.selectedWeight : modeStyles.weight,
      dashArray: overlayMode === 'minimal' && !isSelected ? '5, 5' : '',
    };
  };

  const onEachFeature = (feature, layer) => {
    const districtName = getDistrictName(feature);
    const score = districtScores[districtName]?.overall || 'N/A';
    const envScore = districtScores[districtName]?.envScore;

    layer.bindTooltip(
      `<div class="px-2 py-1">
        <div class="font-semibold">${districtName}</div>
        <div class="text-sm opacity-80">Liveability: ${score}${envScore != null ? ` | Environment: ${envScore}` : ''}</div>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        className: 'district-tooltip'
      }
    );

    layer.on({
      mouseover: (e) => {
        if (overlayMode === 'hidden') return;
        setHoveredDistrict(districtName);
        onDistrictHover?.(districtName);
        e.target.setStyle({
          fillOpacity: modeStyles.hoverFillOpacity,
          weight: modeStyles.weight + 0.5
        });
      },
      mouseout: (e) => {
        setHoveredDistrict(null);
        onDistrictHover?.(null);
        e.target.setStyle(getDistrictStyle(feature));
      },
      click: () => {
        onDistrictSelect?.(districtName);
      }
    });
  };

  useEffect(() => {
    if (selectedDistrict) {
      const feature = singaporeGeoJson.features.find(
        f => getDistrictName(f) === selectedDistrict
      );
      if (feature && feature.geometry.coordinates) {
        // Handle both Polygon and MultiPolygon
        let coords;
        if (feature.geometry.type === 'MultiPolygon') {
          coords = feature.geometry.coordinates[0][0];
        } else {
          coords = feature.geometry.coordinates[0];
        }

        if (coords && coords.length > 0) {
          const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
          const centerLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
          map.setView([centerLat, centerLng], 13, { animate: true });
        }
      }
    }
  }, [selectedDistrict, map]);

  return (
    <GeoJSON
      key={`${selectedDistrict}-${hoveredDistrict}-${overlayMode}-${scoresKey}`}
      data={singaporeGeoJson}
      style={getDistrictStyle}
      onEachFeature={onEachFeature}
    />
  );
};

export default DistrictLayer;
