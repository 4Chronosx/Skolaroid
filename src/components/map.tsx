'use client';

import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MAP_STYLES = [
  {
    id: 'streets',
    label: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v12',
  },
  { id: 'light', label: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', label: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
] as const;

export function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>(MAP_STYLES[0].id);

  const handleStyleChange = (styleId: string) => {
    const style = MAP_STYLES.find((s) => s.id === styleId);
    if (!style || !mapRef.current) return;

    setActiveStyle(styleId);
    mapRef.current.setStyle(style.url);
  };

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
          style: MAP_STYLES[0].url,
          center: [-74.5, 40],
          zoom: 9,
          pitch: 60,
          bearing: -17.6,
          attributionControl: false,
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

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

      {/* Style Switcher */}
      <div className="absolute bottom-6 left-4 flex gap-1 rounded-lg bg-white p-1 shadow-lg">
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeStyle === style.id
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}
