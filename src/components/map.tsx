'use client';

import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured');
      return;
    }

    if (mapContainerRef.current && !mapRef.current) {
      try {
        if (!mapboxgl.supported()) {
          setMapError(
            'WebGL is not supported on this browser. Please use a modern browser with WebGL support.'
          );
          return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.5, 40],
          zoom: 9,
          pitch: 60,
          bearing: -17.6,
          attributionControl: false,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add fullscreen control
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Clean up on unmount
        return () => {
          map.remove();
          mapRef.current = null;
        };
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError(
          'Failed to initialize map. Please refresh the page or try a different browser.'
        );
      }
    }
  }, []);

  if (mapError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">{mapError}</h2>
          <p className="text-red-600">
            {!MAPBOX_TOKEN
              ? 'Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file'
              : 'Please refresh the page and try again'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
