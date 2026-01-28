import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Amenity marker colors
const markerColors = {
  hawker: '#f97316', // orange
  park: '#22c55e',   // green
  supermarket: '#3b82f6', // blue
  childcare: '#ec4899', // pink
  gym: '#8b5cf6',    // purple
  cycling: '#06b6d4', // cyan
  location: '#ef4444', // red (current location)
};

const MiniMap = ({ lat, lng, amenities = [], onAmenityClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      });

      // Use OneMap Night tiles
      L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png', {
        detectRetina: true,
        maxZoom: 19,
        minZoom: 11,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Set view to current location
    map.setView([lat, lng], 16);

    // Add current location marker (larger, pulsing)
    const locationMarker = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: markerColors.location,
      fillOpacity: 0.9,
      color: '#fff',
      weight: 3,
    }).addTo(map);

    // Add amenity markers
    amenities.forEach((amenity) => {
      if (amenity.lat && amenity.lng) {
        const marker = L.circleMarker([amenity.lat, amenity.lng], {
          radius: 6,
          fillColor: markerColors[amenity.type] || '#9ca3af',
          fillOpacity: 0.8,
          color: '#fff',
          weight: 2,
        }).addTo(map);

        // Add click handler
        if (onAmenityClick) {
          marker.on('click', () => onAmenityClick(amenity));
        }

        // Add tooltip
        marker.bindTooltip(amenity.name, {
          permanent: false,
          direction: 'top',
          className: 'mini-map-tooltip',
        });
      }
    });

    return () => {
      // Cleanup on unmount
    };
  }, [lat, lng, amenities, onAmenityClick]);

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-40 w-full rounded-lg overflow-hidden"
        style={{ background: '#0a1f17' }}
      />
      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
        <div className="flex items-center gap-1 bg-forest-dark/80 px-1.5 py-0.5 rounded text-[10px]">
          <span className="w-2 h-2 rounded-full" style={{ background: markerColors.location }} />
          <span className="text-text-secondary">You</span>
        </div>
        {amenities.length > 0 && (
          <div className="flex items-center gap-1 bg-forest-dark/80 px-1.5 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-forest-light/200" />
            <span className="text-text-secondary">Amenities</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniMap;
