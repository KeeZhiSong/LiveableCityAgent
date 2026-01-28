import { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

const MAPILLARY_ACCESS_TOKEN = import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN;

const MapillaryEmbed = ({ lat, lng }) => {
  const [imageId, setImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNearestImage(lat, lng);
  }, [lat, lng]);

  const fetchNearestImage = async (lat, lng) => {
    setLoading(true);
    setError(null);

    // If no API token, show placeholder
    if (!MAPILLARY_ACCESS_TOKEN) {
      setError('Mapillary API token not configured');
      setLoading(false);
      return;
    }

    try {
      // Mapillary API to find nearest image within small bbox
      const response = await fetch(
        `https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id,thumb_1024_url,captured_at&bbox=${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Mapillary API request failed');
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setImageId(data.data[0].id);
      } else {
        // Try with larger radius
        const widerResponse = await fetch(
          `https://graph.mapillary.com/images?access_token=${MAPILLARY_ACCESS_TOKEN}&fields=id&bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&limit=1`
        );

        if (!widerResponse.ok) {
          throw new Error('Mapillary API request failed');
        }

        const widerData = await widerResponse.json();

        if (widerData.data && widerData.data.length > 0) {
          setImageId(widerData.data[0].id);
        } else {
          setError('No street imagery available for this location');
        }
      }
    } catch (err) {
      console.error('Mapillary fetch error:', err);
      setError('Failed to load street imagery');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[250px] bg-forest flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-leaf mx-auto mb-2" size={32} />
          <p className="text-text-secondary text-sm">Finding street imagery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[250px] bg-forest flex items-center justify-center">
        <div className="text-center px-4">
          <ImageOff className="text-text-muted mx-auto mb-2" size={32} />
          <p className="text-text-secondary text-sm">{error}</p>
          <p className="text-text-muted text-xs mt-1">Try clicking a different location</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.mapillary.com/embed?image_key=${imageId}&style=photo`}
      width="100%"
      height="250"
      frameBorder="0"
      title="Street View"
      className="bg-forest"
      allow="fullscreen"
    />
  );
};

export default MapillaryEmbed;
