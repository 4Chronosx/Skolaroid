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

/** Camera animation configuration for smooth, cinematic flyTo transitions. */
const CAMERA_ANIMATION = {
  speed: 0.8, // Slower speed = smoother, more cinematic
  curve: 1.2, // Gentle arc for natural movement
  targetZoom: 20, // Zoom level when selecting a memory
  essential: true, // Ensures animation is not skipped even if user prefers reduced motion
};

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

      // Helper: fly to the memory location with sequence, then open the detail modal
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

        // Use the cinematic sequence: zoom out → fly → zoom in
        flyToMemoryWithSequence(memory, () => {
          // Guard against stale events
          if (pendingMemoryRef.current?.id !== memory.id) return;
          setSelectedMemory(memory);
          setMemoryDetailOpen(true);
          pendingMemoryRef.current = null;
        });
      };

      // Delay to let the BatchesModal Dialog close animation finish
      setTimeout(() => {
        // Guard: if a different memory was selected in the meantime, bail
        if (pendingMemoryRef.current?.id !== memory.id) return;

        if (needsEraSwitch) {
          // Switch era — directly call setStyle and listen for the event before flying.
          // Important: attach listener BEFORE calling setStyle to ensure we catch the event.
          const targetStyle = ERA_MAP_STYLES[memoryEra] ?? DEFAULT_MAP_STYLE;

          const onStyleLoad = () => {
            map.off('style.load', onStyleLoad);
            // Guard: different memory selected?
            if (pendingMemoryRef.current?.id !== memory.id) return;
            flyAndOpen();
          };

          map.on('style.load', onStyleLoad);
          map.setStyle(targetStyle);
          setActiveMapEra(memoryEra);
        } else {
          flyAndOpen();
        }
      }, MODAL_CLOSE_DELAY);
    },
    [activeMapEra, flyToMemoryWithSequence]
  );

  // Clear pending memory when user opens another modal or performs an action
  // that should cancel the flyTo flow
  const cancelPendingFlyTo = useCallback(() => {
    pendingMemoryRef.current = null;
  }, []);

  // Helper: Direct flyTo with optional callback on completion
  const flyToMemoryWithSequence = useCallback(
    (memory: MemoryWithCoordinates, onComplete?: () => void) => {
      const map = mapRef.current;
      if (!map) {
        onComplete?.();
        return;
      }

      // Direct flyTo with cinematic animation settings
      map.flyTo({
        center: [memory.location.longitude, memory.location.latitude],
        zoom: CAMERA_ANIMATION.targetZoom,
        speed: CAMERA_ANIMATION.speed,
        curve: CAMERA_ANIMATION.curve,
        duration: 1500,
        essential: CAMERA_ANIMATION.essential,
      });

      // Call completion callback when move ends
      const onMoveEnd = () => {
        map.off('moveend', onMoveEnd);
        onComplete?.();
      };
      map.once('moveend', onMoveEnd);
    },
    []
  );

  useLayoutEffect(() => {
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
            const prevMemory = memories[currentIndex - 1];
            if (prevMemory) {
              // Fly to previous memory with sequence animation
              flyToMemoryWithSequence(prevMemory, () => {
                setSelectedMemory(prevMemory);
              });
            }
          }
        }}
        onNext={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            const nextMemory = memories[currentIndex + 1];
            if (nextMemory) {
              // Fly to next memory with sequence animation
              flyToMemoryWithSequence(nextMemory, () => {
                setSelectedMemory(nextMemory);
              });
            }
          }
        }}
      />
    </div>
  );
}
