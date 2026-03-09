import type { Landmark } from '@/lib/constants/landmarks';

/** The mode the map is currently operating in for location selection. */
export type LocationSelectionMode = 'inactive' | 'landmark' | 'custom';

/** Data returned when a user selects a location on the map. */
export interface MapLocationSelection {
  /** The mode used to select this location. */
  mode: 'landmark' | 'custom';
  /** The landmark selected (only for mode 'landmark'). */
  landmark?: Landmark;
  /** The location ID to use for memory creation (existing location UUID). */
  locationId?: string;
  /** Custom coordinate data (only for mode 'custom'). */
  customLocation?: {
    latitude: number;
    longitude: number;
    buildingName: string;
  };
}

/** Props passed to the AddMemoryModal for map selection integration. */
export interface MapSelectionCallbacks {
  /** Called when the modal wants to enter map selection mode. */
  onRequestMapSelection: (mode: 'landmark' | 'custom') => void;
  /** Called when the modal wants to cancel map selection. */
  onCancelMapSelection: () => void;
}