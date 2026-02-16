'use client';

import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AddMemoryModal } from './add-memory-modal';
import { ExpandableToolbar } from './expandable-toolbar';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [addMemoryOpen, setAddMemoryOpen] = useState(false);

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
          style: {
            version: 8,
            sources: {
              'custom-map': {
                type: 'image',
                url: '/assets/images/temporary_map.png',
                coordinates: [
                  [-80, 50],
                  [-60, 50],
                  [-60, 30],
                  [-80, 30],
                ],
              },
            },
            layers: [
              {
                id: 'background',
                type: 'background',
                paint: { 'background-color': '#f0f0f0' },
              },
              {
                id: 'custom-map-layer',
                type: 'raster',
                source: 'custom-map',
                paint: { 'raster-opacity': 1 },
              },
            ],
          },
          center: [-70, 40],
          zoom: 5,
          attributionControl: false,
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-left');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

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
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Add Memory Button - Bottom Right */}
      <button
        onClick={() => setAddMemoryOpen(true)}
        className="absolute bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
        aria-label="Add memory"
      >
        <Plus size={24} />
      </button>

      {/* Expandable Toolbar - Top Right */}
      <ExpandableToolbar
        onPrimaryClick={() => console.log('Primary action clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        onShareClick={() => console.log('Share clicked')}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal open={addMemoryOpen} onOpenChange={setAddMemoryOpen} />
    </div>
  );
}
