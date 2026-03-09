'use client';

import type {
  LocationSelectionMode,
  MapLocationSelection,
} from '@/lib/types/map';

interface MapLocationSelectorProps {
  mode: LocationSelectionMode;
  onCancel: () => void;
  onLocationSelected: (selection: MapLocationSelection) => void;
  pendingSelection: MapLocationSelection | null;
  /** Mapbox map instance ref — needed to attach click handlers for custom mode. */
  mapRef?: React.RefObject<mapboxgl.Map | null>;
}

export function MapLocationSelector({
  mode,
  onCancel,
}: MapLocationSelectorProps) {
  return (
    <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg">
        <div className="h-2 w-2 animate-pulse rounded-full bg-skolaroid-blue" />
        <span className="text-sm font-medium text-gray-700">
          {mode === 'landmark'
            ? 'Click a landmark on the map'
            : 'Click anywhere on the map to place a pin'}
        </span>
        <button
          onClick={onCancel}
          className="ml-2 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}