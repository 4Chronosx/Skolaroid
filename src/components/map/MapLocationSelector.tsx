'use client';

import { useEffect, useCallback, useState } from 'react';
import type {
  LocationSelectionMode,
  MapLocationSelection,
} from '@/lib/types/map';
import {
  isWithinCampusBounds,
  generateLocationName,
} from '@/lib/utils/map-utils';

interface MapLocationSelectorProps {
  mode: LocationSelectionMode;
  onCancel: () => void;
  onLocationSelected: (selection: MapLocationSelection) => void;
  pendingSelection: MapLocationSelection | null;
  mapRef?: React.RefObject<mapboxgl.Map | null>;
}

export function MapLocationSelector({
  mode,
  onCancel,
  onLocationSelected,
  mapRef,
}: MapLocationSelectorProps) {
  const [outOfBoundsError, setOutOfBoundsError] = useState(false);

  // Handle map click for custom coordinate mode
  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (mode !== 'custom') return;

      const { lng, lat } = e.lngLat;

      if (!isWithinCampusBounds(lat, lng)) {
        setOutOfBoundsError(true);
        setTimeout(() => setOutOfBoundsError(false), 3000);
        return;
      }

      const buildingName = generateLocationName(lat, lng);

      onLocationSelected({
        mode: 'custom',
        customLocation: {
          latitude: lat,
          longitude: lng,
          buildingName,
        },
      });
    },
    [mode, onLocationSelected]
  );

  // Handle mouse move to update cursor based on bounds
  const handleMouseMove = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (mode !== 'custom') return;
      const map = mapRef?.current;
      if (!map) return;

      const { lng, lat } = e.lngLat;
      const inBounds = isWithinCampusBounds(lat, lng);
      map.getCanvas().style.cursor = inBounds ? 'crosshair' : 'not-allowed';
    },
    [mode, mapRef]
  );

  // Attach click and mousemove handlers to map for custom mode
  useEffect(() => {
    const map = mapRef?.current;
    if (!map || mode !== 'custom') return;

    map.on('click', handleMapClick);
    map.on('mousemove', handleMouseMove);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      map.off('mousemove', handleMouseMove);
      map.getCanvas().style.cursor = '';
    };
  }, [mapRef, mode, handleMapClick, handleMouseMove]);

  // ESC key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Auto-timeout: restore modal after 2 minutes of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      onCancel();
    }, 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [onCancel]);

  return (
    <>
      {/* Instruction bar */}
      <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg ring-1 ring-black/5">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-skolaroid-blue" />
          <span className="text-sm font-medium text-gray-700">
            {mode === 'landmark'
              ? 'Click a landmark on the map to select it'
              : 'Click anywhere on the campus map to place a pin'}
          </span>
          <button
            onClick={onCancel}
            className="ml-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-block">
            ESC
          </kbd>
        </div>
      </div>

      {/* Out-of-bounds error toast */}
      {outOfBoundsError && (
        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 shadow-lg">
            <p className="text-sm font-medium text-red-700">
              Please select a location within campus
            </p>
          </div>
        </div>
      )}
    </>
  );
}
