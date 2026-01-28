import { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DistrictLayer from './DistrictLayer';
import MapLegend from './MapLegend';
import MapControls from './MapControls';
import AmenityLayers from './AmenityLayers';
import LayerControlPanel from './LayerControlPanel';
import StreetViewToggle from './StreetViewToggle';
import { StreetViewPanel } from '../StreetView';
import StreetViewModeIndicator from '../StreetView/StreetViewModeIndicator';
import { oneMapService } from '../../services/oneMapService';

const SINGAPORE_CENTER = [1.3521, 103.8198];
const SINGAPORE_BOUNDS = [
  [1.15, 103.59],  // Southwest corner
  [1.47, 104.05]   // Northeast corner
];

// Map click handler component
const MapClickHandler = ({ onMapClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Component to expose map instance
const MapController = ({ mapRef }) => {
  const map = useMap();
  mapRef.current = map;
  return null;
};

const SingaporeMap = ({
  districtScores = {},
  selectedDistrict,
  onDistrictSelect,
  onDistrictHover
}) => {
  const [overlayMode, setOverlayMode] = useState('subtle');
  const [activeLayers, setActiveLayers] = useState({});
  const [streetViewMode, setStreetViewMode] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const mapRef = useRef(null);

  const handleMapClick = async (lat, lng) => {
    // Get address via reverse geocoding using authenticated service
    const address = await oneMapService.reverseGeocode(lat, lng);
    setStreetViewLocation({ lat, lng, address });
  };

  const handleCloseStreetView = () => {
    setStreetViewLocation(null);
  };

  const handleToggleStreetView = () => {
    setStreetViewMode(!streetViewMode);
    if (streetViewMode) {
      // Exiting street view mode - close panel
      setStreetViewLocation(null);
    }
  };

  const handleExitStreetViewMode = () => {
    setStreetViewMode(false);
    setStreetViewLocation(null);
  };

  // Pan map to a specific location
  const handlePanToLocation = useCallback((lat, lng) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17, { animate: true });
    }
  }, []);

  // Save a location for comparison
  const handleSaveLocation = useCallback((location) => {
    setSavedLocations(prev => {
      // Don't add duplicates
      const exists = prev.some(
        loc => Math.abs(loc.lat - location.lat) < 0.0001 && Math.abs(loc.lng - location.lng) < 0.0001
      );
      if (exists) return prev;
      return [...prev, location];
    });
  }, []);

  // Remove a saved location
  const handleRemoveLocation = useCallback((index) => {
    setSavedLocations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleToggleLayer = useCallback((key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Select a saved location to view
  const handleSelectLocation = useCallback(async (location) => {
    // Update the street view panel with this location
    const address = location.address || await oneMapService.reverseGeocode(location.lat, location.lng);
    setStreetViewLocation({ lat: location.lat, lng: location.lng, address });
    // Pan map to this location
    handlePanToLocation(location.lat, location.lng);
  }, [handlePanToLocation]);

  return (
    <div data-tour="map" className={`relative w-full h-full ${streetViewMode ? 'street-view-cursor' : ''}`}>
      <MapContainer
        center={SINGAPORE_CENTER}
        zoom={12}
        minZoom={11}
        maxZoom={19}
        maxBounds={SINGAPORE_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#0c1f17' }}
      >
        <MapController mapRef={mapRef} />
        <TileLayer
          url="https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.onemap.gov.sg" target="_blank">OneMap</a> &copy; <a href="https://www.sla.gov.sg" target="_blank">Singapore Land Authority</a>'
          maxZoom={19}
          minZoom={11}
        />
        <ZoomControl position="bottomleft" />
        <DistrictLayer
          districtScores={districtScores}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={streetViewMode ? undefined : onDistrictSelect}
          onDistrictHover={streetViewMode ? undefined : onDistrictHover}
          overlayMode={streetViewMode ? 'minimal' : overlayMode}
        />
        <AmenityLayers activeLayers={activeLayers} />
        <MapClickHandler
          onMapClick={handleMapClick}
          enabled={streetViewMode}
        />
      </MapContainer>

      {/* Layer Controls */}
      <LayerControlPanel activeLayers={activeLayers} onToggle={handleToggleLayer} />

      {/* Street View Toggle Button */}
      <StreetViewToggle
        enabled={streetViewMode}
        onToggle={handleToggleStreetView}
      />

      {/* Street View Mode Indicator */}
      {streetViewMode && !streetViewLocation && (
        <StreetViewModeIndicator onExit={handleExitStreetViewMode} />
      )}

      {/* Overlay Mode Controls - hide when street view panel is open */}
      {!streetViewLocation && (
        <MapControls
          currentMode={overlayMode}
          onModeChange={setOverlayMode}
        />
      )}

      <MapLegend />

      {/* Street View Panel */}
      {streetViewLocation && (
        <StreetViewPanel
          lat={streetViewLocation.lat}
          lng={streetViewLocation.lng}
          address={streetViewLocation.address}
          onClose={handleCloseStreetView}
          onPanToLocation={handlePanToLocation}
          savedLocations={savedLocations}
          onSaveLocation={handleSaveLocation}
          onRemoveLocation={handleRemoveLocation}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </div>
  );
};

export default SingaporeMap;
