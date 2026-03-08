# Batches Modal → Map FlyTo → Memory Detail Transition

## Goal

When a user clicks a memory card in the Batches Modal, close the modal, fly the map to the memory's coordinates, and open the MemoryDetailModal from the map context — creating a spatial connection between browsing memories and their map locations.

## Prerequisites

Make sure that the user is currently on the `feat/batches-flyto-memory-transition` branch before beginning implementation.
If not, move them to the correct branch. If the branch does not exist, create it from main.

---

### Step-by-Step Instructions

#### Step 1: Simplify BatchesModal — remove internal MemoryDetailModal and era-switch dialog

The BatchesModal currently manages its own `MemoryDetailModal` and era-switch confirmation dialog. We'll replace all of that with a single `onMemorySelected` callback that delegates to the parent (MapComponent).

- [ ] Open `src/components/batches-modal.tsx`
- [ ] Replace the **entire file** with the code below:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, getEraFromBatchTag } from '@/lib/utils';
import {
  X,
  Search,
  SlidersHorizontal,
  Calendar,
  Heart,
  Plus,
  MapPin,
} from 'lucide-react';
import { MOCK_MEMORIES, MOCK_LOCATIONS } from '@/lib/mock-data';
import {
  FilterMemoriesModal,
  DEFAULT_FILTERS,
  type MemoryFilters,
} from './map/FilterMemoriesModal';
import type { MemoryWithCoordinates } from '@/lib/hooks/useAllMemoriesWithCoordinates';

// =============================================================================
// TYPES
// =============================================================================

interface BatchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The currently active map era (decade start year, e.g. 2020). */
  activeMapEra?: number;
  /** All memories from the parent map component (same data shown as map pins). Falls back to MOCK_MEMORIES. */
  memories?: MemoryWithCoordinates[];
  /** Called when the user clicks "Add an Entry". Receives the currently selected decade. */
  onAddMemory?: (era: number | null) => void;
  /** Called when a memory card is clicked. The parent handles era switching, flyTo, and modal display. */
  onMemorySelected?: (memory: MemoryWithCoordinates) => void;
}

interface DecadeOption {
  label: string;
  value: number | null; // null = "All"
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default active map era when no prop is provided. */
const DEFAULT_ACTIVE_ERA = 2020;

const DECADES: DecadeOption[] = [
  { label: 'All', value: null },
  { label: '2020s', value: 2020 },
  { label: '2010s', value: 2010 },
  { label: '2000s', value: 2000 },
  { label: '1990s', value: 1990 },
  { label: '1980s', value: 1980 },
  { label: '1970s', value: 1970 },
  { label: '1960s', value: 1960 },
  { label: '1950s', value: 1950 },
  { label: '1940s', value: 1940 },
];

/** Lookup coordinates by building name from MOCK_LOCATIONS. */
const COORDS_BY_BUILDING: Record<
  string,
  { latitude: number; longitude: number }
> = {};
for (const loc of MOCK_LOCATIONS) {
  COORDS_BY_BUILDING[loc.buildingName] = {
    latitude: loc.latitude,
    longitude: loc.longitude,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BatchesModal({
  open,
  onOpenChange,
  activeMapEra = DEFAULT_ACTIVE_ERA,
  memories: memoriesProp,
  onAddMemory,
  onMemorySelected,
}: BatchesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState<number | null>(
    activeMapEra
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MemoryFilters>(DEFAULT_FILTERS);

  // Resolve memory source: prop data from the map (real API) or MOCK_MEMORIES fallback
  const allMemories = useMemo<MemoryWithCoordinates[]>(() => {
    if (memoriesProp) return memoriesProp;
    return MOCK_MEMORIES.map((m) => {
      const coords = COORDS_BY_BUILDING[m.location.buildingName] ?? {
        latitude: 0,
        longitude: 0,
      };
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        mediaURL: m.mediaURL,
        visibility: m.visibility,
        createdAt: m.createdAt,
        tags: m.tags,
        location: { buildingName: m.location.buildingName, ...coords },
        _count: m._count,
      };
    });
  }, [memoriesProp]);

  // Extract unique tags and years from the resolved memory set for the filter panel
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allMemories.forEach((m) =>
      (m.tags ?? []).forEach((t) => tagSet.add(t.name))
    );
    return Array.from(tagSet).sort();
  }, [allMemories]);

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    allMemories.forEach((m) => {
      if (m.createdAt) yearSet.add(new Date(m.createdAt).getFullYear());
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [allMemories]);

  // Filter memories by era (batch tag), search, and applied filters (AND logic)
  const displayedMemories = useMemo<MemoryWithCoordinates[]>(() => {
    let result = [...allMemories];

    // Decade sidebar filter — era derived from batch tag (e.g. batch-2024 → 2020s)
    if (selectedDecade !== null) {
      result = result.filter(
        (m) => getEraFromBatchTag(m.tags ?? [], m.createdAt) === selectedDecade
      );
    }

    // Keyword search (title + description + tags)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.tags ?? []).some((t) => t.name.toLowerCase().includes(q))
      );
    }

    // Visibility filter
    if (filters.visibility !== 'ALL') {
      result = result.filter((m) => m.visibility === filters.visibility);
    }

    // Tags filter (AND — memory must have ALL selected tags)
    if (filters.selectedTags.length > 0) {
      result = result.filter((m) => {
        const tagNames = (m.tags ?? []).map((t) => t.name);
        return filters.selectedTags.every((st) => tagNames.includes(st));
      });
    }

    // Year filter — based on createdAt
    if (filters.selectedYear !== null) {
      result = result.filter(
        (m) =>
          m.createdAt &&
          new Date(m.createdAt).getFullYear() === filters.selectedYear
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'date-newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt ?? '').getTime() -
            new Date(a.createdAt ?? '').getTime()
        );
        break;
      case 'date-oldest':
        result.sort(
          (a, b) =>
            new Date(a.createdAt ?? '').getTime() -
            new Date(b.createdAt ?? '').getTime()
        );
        break;
      case 'upvotes-high':
        result.sort((a, b) => (b._count?.votes ?? 0) - (a._count?.votes ?? 0));
        break;
      case 'upvotes-low':
        result.sort((a, b) => (a._count?.votes ?? 0) - (b._count?.votes ?? 0));
        break;
    }

    return result;
  }, [allMemories, selectedDecade, searchQuery, filters]);

  // Handle clicking a memory card — always delegates to the parent
  const handleMemoryCardClick = (memory: MemoryWithCoordinates) => {
    onMemorySelected?.(memory);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery('');
    setFiltersOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[85vh] w-[70vw] max-w-5xl gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Batches</DialogTitle>

        {/* ====== Sidebar ====== */}
        <div className="flex w-56 shrink-0 flex-col border-r bg-white">
          {/* Header */}
          <div className="flex items-center px-5 pb-3 pt-5">
            <h2 className="text-2xl font-bold text-gray-900">Batches</h2>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title, caption, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 border-0 bg-gray-100 pl-8 text-sm placeholder:text-gray-400 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Decade List */}
          <div className="scrollbar-hide flex-1 overflow-y-auto px-3 pb-4">
            <div className="space-y-0.5">
              {DECADES.map((decade) => {
                const isSelected = selectedDecade === decade.value;
                const isActiveMap = decade.value === activeMapEra;
                return (
                  <button
                    key={decade.label}
                    onClick={() => setSelectedDecade(decade.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    )}
                  >
                    <span>{decade.label}</span>
                    {isActiveMap && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====== Content Area ====== */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Content Header — Filters + Close buttons */}
          <div className="flex items-center justify-end gap-2 border-b px-5 py-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={handleClose}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Memory Cards Grid */}
          <div className="scrollbar-hide flex-1 overflow-y-auto p-5">
            {displayedMemories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedMemories.map((memory) => (
                  <button
                    key={memory.id}
                    type="button"
                    onClick={() => handleMemoryCardClick(memory)}
                    className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Image */}
                    {memory.mediaURL ? (
                      <div className="relative h-44 w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            memory.mediaURL === '/temporary_map.png'
                              ? '/assets/images/temporary_map.png'
                              : memory.mediaURL
                          }
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          Batch
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex h-44 items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-400">No image</span>
                        <span className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          Batch
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {memory.title}
                      </h3>

                      {/* Caption / description snippet */}
                      {memory.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {memory.description}
                        </p>
                      )}

                      {/* Location */}
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{memory.location.buildingName}</span>
                      </div>

                      {/* Date + likes */}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(memory.createdAt ?? '')}</span>
                        <span className="text-gray-300">•</span>
                        <Heart className="h-3.5 w-3.5" />
                        <span>{memory._count?.votes ?? 0}</span>
                      </div>

                      {/* Tags */}
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {memory.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="rounded-full px-2 py-0.5 text-xs font-normal text-gray-600"
                            >
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {/* "Add an Entry" card */}
                <button
                  type="button"
                  onClick={() => {
                    onAddMemory?.(selectedDecade);
                    onOpenChange(false);
                  }}
                  className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 transition-colors hover:border-sky-400 hover:bg-sky-50"
                >
                  <Plus className="h-10 w-10 text-sky-400" />
                  <p className="mt-2 text-sm font-medium text-sky-600">
                    Add an Entry
                  </p>
                </button>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-sm text-gray-400">No memories found</p>
                <button
                  type="button"
                  onClick={() => {
                    onAddMemory?.(selectedDecade);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/50 px-6 py-3 text-sm font-medium text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50"
                >
                  <Plus className="h-5 w-5" />
                  Add an Entry
                </button>
              </div>
            )}
          </div>

          {/* ====== Filter Panel (overlay within content area) ====== */}
          <FilterMemoriesModal
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            filters={filters}
            onApply={setFilters}
            availableTags={availableTags}
            availableYears={availableYears}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

##### Step 1 Verification Checklist

- [ ] No build errors: run `pnpm type-check`
- [ ] Open BatchesModal from the map toolbar → memory cards still render with images, title, location, date, tags
- [ ] Click a memory card → modal closes (no MemoryDetailModal or era-switch dialog appears inside the modal)
- [ ] The "Add an Entry" card still works
- [ ] Sidebar decade filtering and search still work
- [ ] Filters panel still opens/closes and filters work

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 2: Wire up MapComponent to handle the batches → flyTo → detail flow

The MapComponent will now receive the selected memory from BatchesModal, fly the map to its location, switch eras if needed, and open the MemoryDetailModal once the fly animation completes.

- [ ] Open `src/components/map.tsx`
- [ ] Replace the **entire file** with the code below:

```tsx
'use client';

import mapboxgl from 'mapbox-gl';
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { getEraFromBatchTag } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createRoot, type Root } from 'react-dom/client';
import { Plus } from 'lucide-react';
import { AddMemoryModal } from './add-memory-modal';
import { GroupModal } from './group-modal';
import { BatchesModal } from './batches-modal';
import { ExpandableToolbar } from './expandable-toolbar';
import { LandmarkMarker } from './map/LandmarkMarker';
import { LandmarkMemoriesPanel } from './map/LandmarkMemoriesPanel';
import { MemoryPin } from './map/MemoryPin';
import { MemoryDetailModal } from './map/MemoryDetailModal';
import { useMemoryCountsByLandmark } from '@/lib/hooks/useMemoryCountsByLandmark';
import {
  useAllMemoriesWithCoordinates,
  type MemoryWithCoordinates,
} from '@/lib/hooks/useAllMemoriesWithCoordinates';
import { LANDMARKS, type Landmark } from '@/lib/constants/landmarks';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// ---------------------------------------------------------------------------
// Era → Mapbox style mapping
// Each decade gets a visually distinct style to convey the period feel.
// ---------------------------------------------------------------------------
const ERA_MAP_STYLES: Record<number, string> = {
  2020: 'mapbox://styles/mapbox/streets-v12', // Vibrant & modern
  2010: 'mapbox://styles/mapbox/light-v11', // Clean minimalist
  2000: 'mapbox://styles/mapbox/outdoors-v12', // Detailed outdoors
  1990: 'mapbox://styles/mapbox/satellite-streets-v12', // Classic photo map
  1980: 'mapbox://styles/mapbox/satellite-streets-v12',
  1970: 'mapbox://styles/mapbox/satellite-v9', // Vintage satellite
  1960: 'mapbox://styles/mapbox/satellite-v9',
  1950: 'mapbox://styles/mapbox/satellite-v9',
  1940: 'mapbox://styles/mapbox/satellite-v9',
};
const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

const ERA_OVERLAY: Record<number, { label: string; badge: string }> = {
  2020: { label: '2020s', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  2010: {
    label: '2010s',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  2000: {
    label: '2000s',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  1990: {
    label: '1990s',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  1980: {
    label: '1980s',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  1970: {
    label: '1970s',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  1960: {
    label: '1960s',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  1950: {
    label: '1950s',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  1940: {
    label: '1940s',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
  },
};

/** Distance threshold (degrees) — if map center is already within this of the target, skip flyTo. */
const FLY_TO_THRESHOLD = 0.0001;

/** Delay (ms) after closing BatchesModal before starting flyTo, so the Dialog close animation completes. */
const MODAL_CLOSE_DELAY = 300;

export function MapComponent() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [addMemoryOpen, setAddMemoryOpen] = useState(false);
  const [addMemoryEra, setAddMemoryEra] = useState<number | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [batchesModalOpen, setBatchesModalOpen] = useState(false);
  const [activeMapEra, setActiveMapEra] = useState(2020);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [selectedMemory, setSelectedMemory] =
    useState<MemoryWithCoordinates | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showMemoryPins, setShowMemoryPins] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerRootsRef = useRef<{ root: Root; landmark: Landmark }[]>([]);
  const memoryMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const memoryRootsRef = useRef<Root[]>([]);

  // Pending memory for the flyTo → open detail flow
  const pendingMemoryRef = useRef<MemoryWithCoordinates | null>(null);

  const { data: countsData } = useMemoryCountsByLandmark();
  const memoryCounts = useMemo(() => countsData?.data ?? {}, [countsData]);

  const { data: memoriesData } = useAllMemoriesWithCoordinates();
  const memories = useMemo(() => memoriesData?.data ?? [], [memoriesData]);

  // Only show memory pins for the active era (based on batch tag)
  const eraFilteredMemories = useMemo(() => {
    return memories.filter(
      (m) => getEraFromBatchTag(m.tags ?? [], m.createdAt) === activeMapEra
    );
  }, [memories, activeMapEra]);

  // Keep a stable ref for the click handler so detached roots always call the latest version
  const handleClickRef = useRef<(landmark: Landmark) => void>(() => {});
  useLayoutEffect(() => {
    handleClickRef.current = (landmark: Landmark) => {
      setSelectedLandmark(landmark);
    };
  });

  const handleLandmarkClick = useCallback((landmark: Landmark) => {
    handleClickRef.current(landmark);
  }, []);

  const handleMemoryClickRef = useRef<(memory: MemoryWithCoordinates) => void>(
    () => {}
  );
  useLayoutEffect(() => {
    handleMemoryClickRef.current = (memory: MemoryWithCoordinates) => {
      setSelectedMemory(memory);
      setMemoryDetailOpen(true);
    };
  });

  const handleMemoryClick = useCallback((memory: MemoryWithCoordinates) => {
    handleMemoryClickRef.current(memory);
  }, []);

  // ---------------------------------------------------------------------------
  // Batches → FlyTo → Detail handler
  // ---------------------------------------------------------------------------
  const handleBatchesMemorySelected = useCallback(
    (memory: MemoryWithCoordinates) => {
      // Close the batches modal (already done by BatchesModal, but ensure state is synced)
      setBatchesModalOpen(false);

      // Cancel any previous pending flyTo
      pendingMemoryRef.current = memory;

      const map = mapRef.current;

      // Fallback: if map isn't ready, just open the detail modal directly
      if (!map) {
        setSelectedMemory(memory);
        setMemoryDetailOpen(true);
        pendingMemoryRef.current = null;
        return;
      }

      const memoryEra = getEraFromBatchTag(memory.tags ?? [], memory.createdAt);
      const needsEraSwitch = memoryEra !== activeMapEra;

      const targetLng = memory.location.longitude;
      const targetLat = memory.location.latitude;

      // Check if the map is already centered on the target
      const center = map.getCenter();
      const isAlreadyCentered =
        Math.abs(center.lng - targetLng) < FLY_TO_THRESHOLD &&
        Math.abs(center.lat - targetLat) < FLY_TO_THRESHOLD &&
        !needsEraSwitch;

      // Helper: fly to the memory location, then open the detail modal
      const flyAndOpen = () => {
        // Guard: if a different memory was selected in the meantime, bail
        if (pendingMemoryRef.current?.id !== memory.id) return;

        if (isAlreadyCentered) {
          // Already there — open immediately
          setSelectedMemory(memory);
          setMemoryDetailOpen(true);
          pendingMemoryRef.current = null;
          return;
        }

        const onMoveEnd = () => {
          map.off('moveend', onMoveEnd);
          // Guard against stale events
          if (pendingMemoryRef.current?.id !== memory.id) return;
          setSelectedMemory(memory);
          setMemoryDetailOpen(true);
          pendingMemoryRef.current = null;
        };

        map.on('moveend', onMoveEnd);

        map.flyTo({
          center: [targetLng, targetLat],
          zoom: 20,
          duration: 1500,
        });
      };

      // Delay to let the BatchesModal Dialog close animation finish
      setTimeout(() => {
        // Guard: if a different memory was selected in the meantime, bail
        if (pendingMemoryRef.current?.id !== memory.id) return;

        if (needsEraSwitch) {
          // Switch era — this triggers a setStyle call which reloads the map style.
          // We need to wait for 'style.load' before calling flyTo.
          setActiveMapEra(memoryEra);

          const onStyleLoad = () => {
            map.off('style.load', onStyleLoad);
            // Guard: different memory selected?
            if (pendingMemoryRef.current?.id !== memory.id) return;
            flyAndOpen();
          };

          map.on('style.load', onStyleLoad);
        } else {
          flyAndOpen();
        }
      }, MODAL_CLOSE_DELAY);
    },
    [activeMapEra]
  );

  // Clear pending memory when user opens another modal or performs an action
  // that should cancel the flyTo flow
  const cancelPendingFlyTo = useCallback(() => {
    pendingMemoryRef.current = null;
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured');
      return;
    }
    if (!mapboxgl.supported()) {
      setMapError(
        'WebGL is not supported on this browser. Please use a modern browser with WebGL support.'
      );
      return;
    }
  }, []);

  useEffect(() => {
    if (!isClient || !MAPBOX_TOKEN || mapError) {
      return;
    }

    if (mapContainerRef.current && !mapRef.current) {
      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [123.8986, 10.3224],
          zoom: 17,
          minZoom: 16,
          maxZoom: 22,
          maxBounds: [
            [123.89, 10.32],
            [123.91, 10.33],
          ],
          attributionControl: false,
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-left');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

        // Render landmark markers
        LANDMARKS.forEach((landmark) => {
          const el = document.createElement('div');
          const root = createRoot(el);
          root.render(
            <LandmarkMarker
              landmark={landmark}
              memoryCount={0}
              onClick={handleLandmarkClick}
            />
          );

          markerRootsRef.current.push({ root, landmark });

          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(landmark.coordinates)
            .addTo(map);

          markersRef.current.push(marker);
        });

        return () => {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          memoryMarkersRef.current.forEach((m) => m.remove());
          memoryMarkersRef.current = [];

          // Unmount React roots asynchronously to avoid race condition
          const rootsToUnmount = [
            ...markerRootsRef.current,
            ...memoryRootsRef.current,
          ];
          setTimeout(() => {
            rootsToUnmount.forEach((item) => {
              if ('root' in item) {
                item.root.unmount();
              } else {
                item.unmount();
              }
            });
          }, 0);

          markerRootsRef.current = [];
          memoryRootsRef.current = [];
          map.remove();
          mapRef.current = null;
        };
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setTimeout(() => {
          setMapError(
            'Failed to initialize map. Please refresh the page or try a different browser.'
          );
        }, 0);
      }
    }
  }, [isClient, handleLandmarkClick, mapError]);

  // Switch Mapbox style when the active era changes
  useEffect(() => {
    if (!mapRef.current) return;
    const targetStyle = ERA_MAP_STYLES[activeMapEra] ?? DEFAULT_MAP_STYLE;
    mapRef.current.setStyle(targetStyle);
  }, [activeMapEra]);

  // Re-render marker roots when memory counts update or visibility changes
  useEffect(() => {
    for (const { root, landmark } of markerRootsRef.current) {
      root.render(
        <LandmarkMarker
          landmark={landmark}
          memoryCount={memoryCounts[landmark.id] ?? 0}
          onClick={handleLandmarkClick}
        />
      );
    }
  }, [memoryCounts, handleLandmarkClick]);

  // Toggle landmark marker visibility
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        element.style.display = showLandmarks ? 'block' : 'none';
      }
    });
  }, [showLandmarks]);

  // Toggle memory pin marker visibility
  useEffect(() => {
    if (!showMemoryPins) {
      // Clean up memory markers when hiding pins
      memoryMarkersRef.current.forEach((m) => m.remove());
      memoryMarkersRef.current = [];

      const oldRoots = [...memoryRootsRef.current];
      memoryRootsRef.current = [];
      setTimeout(() => {
        oldRoots.forEach((r) => r.unmount());
      }, 0);
    }
  }, [showMemoryPins]);

  // Render memory pin markers
  useEffect(() => {
    if (!mapRef.current || memories.length === 0 || !showMemoryPins) return;

    // Clean up existing memory markers
    memoryMarkersRef.current.forEach((m) => m.remove());
    memoryMarkersRef.current = [];

    // Unmount roots asynchronously to avoid race condition
    const oldRoots = [...memoryRootsRef.current];
    memoryRootsRef.current = [];
    setTimeout(() => {
      oldRoots.forEach((r) => r.unmount());
    }, 0);

    // Render memory pins (only for the active era)
    eraFilteredMemories.forEach((memory) => {
      if (!memory.mediaURL) return;

      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(
        <MemoryPin
          src={memory.mediaURL}
          alt={memory.title}
          onClick={() => handleMemoryClick(memory)}
        />
      );

      memoryRootsRef.current.push(root);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([memory.location.longitude, memory.location.latitude])
        .addTo(mapRef.current!);

      memoryMarkersRef.current.push(marker);
    });
  }, [
    eraFilteredMemories,
    eraFilteredMemories.length,
    memories.length,
    handleMemoryClick,
    showMemoryPins,
  ]);

  if (!isClient) {
    return <div className="relative h-full w-full" />;
  }

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

      {/* Era indicator — bottom left, above Mapbox attribution */}
      {(() => {
        const era = ERA_OVERLAY[activeMapEra];
        if (!era) return null;
        return (
          <div className="absolute bottom-8 left-4 z-10">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${era.badge}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {era.label} Map
            </div>
          </div>
        );
      })()}

      {/* Add Memory Button - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="group flex items-center gap-0 rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:gap-3">
          <button
            onClick={() => setAddMemoryOpen(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
            aria-label="Add memory"
          >
            <Plus size={20} />
          </button>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-gray-700 opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:pr-3 group-hover:opacity-100">
            Add Memory
          </span>
        </div>
      </div>

      {/* Expandable Toolbar - Top Right */}
      <ExpandableToolbar
        onPrimaryClick={() => setGroupModalOpen(true)}
        onBatchesClick={() => setBatchesModalOpen(true)}
        onConfigureClick={() => router.push('/admin')}
        showLandmarks={showLandmarks}
        onToggleLandmarks={(show) => {
          setShowLandmarks(show);
          setShowMemoryPins(!show);
        }}
      />

      {/* Group Modal */}
      <GroupModal
        open={groupModalOpen}
        onOpenChange={(isOpen) => {
          setGroupModalOpen(isOpen);
          if (isOpen) cancelPendingFlyTo();
        }}
      />

      {/* Batches Modal */}
      <BatchesModal
        open={batchesModalOpen}
        onOpenChange={setBatchesModalOpen}
        activeMapEra={activeMapEra}
        memories={memories}
        onAddMemory={(era) => {
          setBatchesModalOpen(false);
          setAddMemoryEra(era ?? activeMapEra);
          setAddMemoryOpen(true);
        }}
        onMemorySelected={handleBatchesMemorySelected}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal
        open={addMemoryOpen}
        onOpenChange={(isOpen) => {
          setAddMemoryOpen(isOpen);
          if (!isOpen) setAddMemoryEra(null);
        }}
        defaultEra={addMemoryEra}
      />

      {/* Landmark Memories Panel */}
      <LandmarkMemoriesPanel
        landmark={selectedLandmark}
        memoryCount={
          selectedLandmark ? (memoryCounts[selectedLandmark.id] ?? 0) : 0
        }
        onClose={() => setSelectedLandmark(null)}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        open={memoryDetailOpen}
        onOpenChange={setMemoryDetailOpen}
        hasPrevious={
          selectedMemory
            ? memories.findIndex((m) => m.id === selectedMemory.id) > 0
            : false
        }
        hasNext={
          selectedMemory
            ? memories.findIndex((m) => m.id === selectedMemory.id) <
              memories.length - 1
            : false
        }
        onPrevious={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            setSelectedMemory(memories[currentIndex - 1]);
          }
        }}
        onNext={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            setSelectedMemory(memories[currentIndex + 1]);
          }
        }}
      />
    </div>
  );
}
```

##### Step 2 Verification Checklist

- [ ] No build errors: run `pnpm type-check`
- [ ] **Same-era flow:** Open BatchesModal → click a memory that belongs to the current era (2020s) → modal closes → map flies to the memory's lat/lng → MemoryDetailModal opens with the book animation
- [ ] **Different-era flow:** Open BatchesModal → select "All" in the sidebar → click a memory from the 2010s → modal closes → map style changes to the 2010s style → map flies to the memory's location → MemoryDetailModal opens
- [ ] **Already-centered:** If you close the MemoryDetailModal and then re-select the same memory from Batches, the modal should open immediately without a fly animation (since the map is already centered)
- [ ] **Cancel via other modal:** While the map is flying, click to open the GroupModal → the MemoryDetailModal should NOT open after the fly completes
- [ ] **Map not loaded edge case:** If mapRef is null (unlikely but guarded), the MemoryDetailModal opens immediately without animation
- [ ] **Close MemoryDetailModal:** After the whole flow completes, closing the detail modal → map stays at the zoomed location, era indicator shows the correct era
- [ ] **Direct memory pin click:** Clicking a memory pin on the map still opens the MemoryDetailModal directly (unchanged behavior)
- [ ] **"Add an Entry" button in BatchesModal:** Still works — closes batches, opens AddMemoryModal

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.
