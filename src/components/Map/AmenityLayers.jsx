import { useState, useEffect } from 'react';
import { CircleMarker, Tooltip, LayerGroup, useMap } from 'react-leaflet';

const LAYER_CONFIG = {
  parks: {
    label: 'Parks',
    file: 'Parks.geojson',
    color: '#22c55e',
    radius: 5,
  },
  hawkers: {
    label: 'Hawker Centres',
    file: 'HawkerCentresGEOJSON.geojson',
    color: '#f97316',
    radius: 4,
  },
  gyms: {
    label: 'Gyms',
    file: 'GymsSGGEOJSON.geojson',
    color: '#a855f7',
    radius: 3,
  },
  supermarkets: {
    label: 'Supermarkets',
    file: 'SupermarketsGEOJSON.geojson',
    color: '#3b82f6',
    radius: 3,
  },
  dengue: {
    label: 'Dengue Clusters',
    file: 'DengueClustersGEOJSON.geojson',
    color: '#ef4444',
    radius: 6,
  },
  childcare: {
    label: 'Childcare',
    file: 'ChildCareServices.geojson',
    color: '#f59e0b',
    radius: 3,
  },
};

function getCoords(feature) {
  const { type, coordinates } = feature.geometry || {};
  if (type === 'Point') return [coordinates[1], coordinates[0]];
  if (type === 'Polygon') {
    const ring = coordinates[0];
    const n = ring.length;
    return [
      ring.reduce((s, c) => s + c[1], 0) / n,
      ring.reduce((s, c) => s + c[0], 0) / n,
    ];
  }
  return null;
}

function getName(feature, key) {
  const p = feature.properties || {};
  if (p.NAME || p.name) return p.NAME || p.name;
  if (key === 'supermarkets' && p.Description) {
    const m = p.Description.match(/LIC_NAME<\/th>\s*<td>([^<]+)/);
    if (m) return m[1].trim();
  }
  if (key === 'childcare' && p.Description) {
    const m = p.Description.match(/NAME<\/th>\s*<td>([^<]+)/);
    if (m) return m[1].trim();
  }
  return LAYER_CONFIG[key]?.label || '';
}

function AmenityLayer({ layerKey, config }) {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/data/${config.file}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFeatures(data.features || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [config.file]);

  return (
    <LayerGroup>
      {features.map((f, i) => {
        const pos = getCoords(f);
        if (!pos) return null;
        return (
          <CircleMarker
            key={i}
            center={pos}
            radius={config.radius}
            pathOptions={{
              color: config.color,
              fillColor: config.color,
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <span className="text-xs">{getName(f, layerKey)}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </LayerGroup>
  );
}

export default function AmenityLayers({ activeLayers }) {
  return (
    <>
      {Object.entries(LAYER_CONFIG).map(([key, config]) =>
        activeLayers[key] ? (
          <AmenityLayer key={key} layerKey={key} config={config} />
        ) : null
      )}
    </>
  );
}

export { LAYER_CONFIG };
