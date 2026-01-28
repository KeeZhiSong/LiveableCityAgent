import { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Thermometer, Droplets, Wind, Bookmark, BookmarkCheck, Map, Sparkles } from 'lucide-react';
import MapillaryEmbed from './MapillaryEmbed';
import ProximityMetrics from './ProximityMetrics';
import StreetAIInsights from './StreetAIInsights';
import CollapsibleSection from './CollapsibleSection';
import MiniMap from './MiniMap';
import WalkabilityBreakdown from './WalkabilityBreakdown';
import SavedLocations from './SavedLocations';
import CompareModal from './CompareModal';
import { EnvironmentSkeleton, AmenitySkeleton, WalkabilityScoreSkeleton } from './SkeletonLoaders';
import { getMockStreetInsights } from '../../utils/mockStreetData';
import { datagovService } from '../../services/datagovService';
import { amenitiesService } from '../../services/amenitiesService';

const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n.app.n8n.cloud/webhook';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const StreetViewPanel = ({
  lat,
  lng,
  address,
  onClose,
  onPanToLocation,
  savedLocations = [],
  onSaveLocation,
  onRemoveLocation,
  onSelectLocation,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingEnv, setLoadingEnv] = useState(true);
  const [proximityData, setProximityData] = useState(null);
  const [envData, setEnvData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Check if current location is already saved
  const isCurrentLocationSaved = savedLocations.some(
    loc => Math.abs(loc.lat - lat) < 0.0001 && Math.abs(loc.lng - lng) < 0.0001
  );

  useEffect(() => {
    fetchProximityData(lat, lng);
    fetchEnvironmentData(lat, lng);
  }, [lat, lng]);

  const fetchEnvironmentData = async (lat, lng) => {
    setLoadingEnv(true);
    try {
      const allEnvData = await datagovService.getAllEnvironmentData();

      // Get nearest readings
      const temperature = datagovService.getNearestTemperature(allEnvData.temperature, lat, lng);
      const humidity = datagovService.getNearestHumidity(allEnvData.humidity, lat, lng);

      // Get PSI for the region (estimate based on location)
      let region = 'central';
      if (lat > 1.4) region = 'north';
      else if (lat < 1.28) region = 'south';
      else if (lng > 103.9) region = 'east';
      else if (lng < 103.75) region = 'west';

      const psi = datagovService.getPSIForRegion(allEnvData.psi, region);
      const pm25 = datagovService.getPM25ForRegion(allEnvData.pm25, region);

      setEnvData({
        temperature: temperature?.value,
        humidity: humidity?.value,
        psi,
        pm25,
        region,
      });
    } catch (error) {
      console.error('Failed to fetch environment data:', error);
    } finally {
      setLoadingEnv(false);
    }
  };

  const fetchProximityData = async (lat, lng) => {
    setLoading(true);
    setAiInsights(null);

    try {
      const data = await amenitiesService.getProximityData(lat, lng);
      setProximityData(data);
    } catch (error) {
      console.error('Failed to fetch proximity data:', error);
      setProximityData({ amenities: [], walkabilityScore: 50, scoreBreakdown: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    setLoadingInsights(true);

    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiInsights(getMockStreetInsights());
      setLoadingInsights(false);
      return;
    }

    try {
      const response = await fetch(`${N8N_BASE_URL}/street-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, proximityData })
      });
      const insights = await response.json();
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      setAiInsights(getMockStreetInsights());
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSaveLocation = () => {
    if (onSaveLocation && !isCurrentLocationSaved) {
      onSaveLocation({
        lat,
        lng,
        address,
        score: proximityData?.walkabilityScore || 0,
        amenities: proximityData?.amenities || [],
        dengueStatus: proximityData?.dengueStatus,
      });
    }
  };

  const handleAmenityClick = (amenity) => {
    if (onPanToLocation && amenity.lat && amenity.lng) {
      onPanToLocation(amenity.lat, amenity.lng);
    }
  };

  return (
    <>
      <div className="absolute right-0 top-0 h-full w-[420px] bg-forest-dark/95 backdrop-blur-xl border-l border-forest-light/50 z-[1000] overflow-y-auto street-view-panel">
        {/* Header */}
        <div className="sticky top-0 bg-forest-dark/90 backdrop-blur border-b border-forest-light/50 p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-leaf flex items-center gap-2">
              <MapPin size={20} />
              Street View
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSaveLocation}
                disabled={isCurrentLocationSaved || loading}
                className={`p-2 rounded-lg transition-colors ${
                  isCurrentLocationSaved
                    ? 'text-leaf bg-leaf/10'
                    : 'hover:bg-forest-light text-text-secondary hover:text-leaf'
                }`}
                title={isCurrentLocationSaved ? 'Location saved' : 'Save location'}
              >
                {isCurrentLocationSaved ? (
                  <BookmarkCheck size={20} />
                ) : (
                  <Bookmark size={20} />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-forest-light rounded-lg transition-colors"
              >
                <X size={20} className="text-text-primary" />
              </button>
            </div>
          </div>
          {address && (
            <p className="text-text-secondary text-sm mt-1">{address}</p>
          )}
          <p className="text-text-muted text-xs mt-1 font-mono">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>

        {/* Mapillary Embed */}
        <div className="p-4">
          <div className="rounded-xl overflow-hidden border border-forest-light/50">
            <MapillaryEmbed lat={lat} lng={lng} />
          </div>
          <p className="text-text-muted text-xs mt-2 text-center">
            Imagery from Mapillary
          </p>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Mini Map */}
          <CollapsibleSection title="Location Map" icon={Map} defaultOpen={true}>
            <MiniMap
              lat={lat}
              lng={lng}
              amenities={proximityData?.amenities || []}
              onAmenityClick={handleAmenityClick}
            />
          </CollapsibleSection>

          {/* Current Conditions */}
          <CollapsibleSection
            title="Current Conditions"
            icon={Thermometer}
            defaultOpen={true}
          >
            {loadingEnv ? (
              <EnvironmentSkeleton />
            ) : envData ? (
              <div className="grid grid-cols-2 gap-2">
                {envData.temperature && (
                  <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 flex items-center gap-2">
                    <Thermometer size={16} className="text-amber-400" />
                    <div>
                      <p className="text-text-muted text-xs">Temperature</p>
                      <p className="text-text-primary font-medium">{envData.temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                )}
                {envData.humidity && (
                  <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 flex items-center gap-2">
                    <Droplets size={16} className="text-blue-400" />
                    <div>
                      <p className="text-text-muted text-xs">Humidity</p>
                      <p className="text-text-primary font-medium">{envData.humidity.toFixed(0)}%</p>
                    </div>
                  </div>
                )}
                {envData.psi && (
                  <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 flex items-center gap-2">
                    <Wind size={16} className={envData.psi <= 50 ? 'text-leaf' : envData.psi <= 100 ? 'text-amber-400' : 'text-rose-400'} />
                    <div>
                      <p className="text-text-muted text-xs">PSI ({envData.region})</p>
                      <p className="text-text-primary font-medium">{envData.psi}</p>
                    </div>
                  </div>
                )}
                {envData.pm25 && (
                  <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 flex items-center gap-2">
                    <Wind size={16} className={envData.pm25 <= 12 ? 'text-leaf' : envData.pm25 <= 35 ? 'text-amber-400' : 'text-rose-400'} />
                    <div>
                      <p className="text-text-muted text-xs">PM2.5</p>
                      <p className="text-text-primary font-medium">{envData.pm25} µg/m³</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center py-4">
                Unable to load environment data
              </p>
            )}
          </CollapsibleSection>

          {/* Nearby Amenities */}
          <CollapsibleSection
            title="Nearby Amenities"
            icon={MapPin}
            badge={!loading && proximityData?.amenities?.length ? `${proximityData.amenities.length}` : undefined}
            defaultOpen={true}
          >
            {loading ? (
              <AmenitySkeleton />
            ) : (
              <ProximityMetrics
                data={proximityData}
                onAmenityClick={handleAmenityClick}
              />
            )}
          </CollapsibleSection>

          {/* Walkability Score */}
          <CollapsibleSection title="Walkability Score" defaultOpen={true}>
            {loading ? (
              <WalkabilityScoreSkeleton />
            ) : proximityData ? (
              <WalkabilityBreakdown
                score={proximityData.walkabilityScore}
                breakdown={proximityData.scoreBreakdown}
              />
            ) : null}
          </CollapsibleSection>

          {/* Saved Locations */}
          {savedLocations.length > 0 && (
            <CollapsibleSection
              title="Saved Locations"
              icon={Bookmark}
              badge={`${savedLocations.length}`}
              defaultOpen={false}
            >
              <SavedLocations
                locations={savedLocations}
                currentLocation={{ lat, lng }}
                onSelect={onSelectLocation}
                onRemove={onRemoveLocation}
                onCompare={() => setShowCompareModal(true)}
              />
            </CollapsibleSection>
          )}

          {/* AI Analysis */}
          <CollapsibleSection
            title="AI Street Analysis"
            icon={Sparkles}
            defaultOpen={true}
          >
            {!aiInsights ? (
              <button
                onClick={handleGetInsights}
                disabled={loadingInsights || loading}
                className="w-full py-3 px-4 bg-leaf/20 hover:bg-leaf/30 border border-leaf/30 rounded-lg text-leaf font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingInsights ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyzing location...
                  </>
                ) : (
                  'Analyze This Location'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <StreetAIInsights insights={aiInsights} />
                {aiInsights?.suggestions && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                      Suggested Improvements
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 border-l-2 border-l-teal"
                        >
                          <p className="text-text-primary text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          locations={savedLocations}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
};

export default StreetViewPanel;
