'use client';

import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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

export function MapComponent() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [addMemoryOpen, setAddMemoryOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [batchesModalOpen, setBatchesModalOpen] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [selectedMemory, setSelectedMemory] =
    useState<MemoryWithCoordinates | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerRootsRef = useRef<{ root: Root; landmark: Landmark }[]>([]);
  const memoryMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const memoryRootsRef = useRef<Root[]>([]);

  const { data: countsData } = useMemoryCountsByLandmark();
  const memoryCounts = useMemo(() => countsData?.data ?? {}, [countsData]);

  const { data: memoriesData } = useAllMemoriesWithCoordinates();
  const memories = useMemo(() => memoriesData?.data ?? [], [memoriesData]);

  // Keep a stable ref for the click handler so detached roots always call the latest version
  const handleClickRef = useRef<(landmark: Landmark) => void>(() => {});
  handleClickRef.current = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

  const handleLandmarkClick = useCallback((landmark: Landmark) => {
    handleClickRef.current(landmark);
  }, []);

  const handleMemoryClickRef = useRef<(memory: MemoryWithCoordinates) => void>(
    () => {}
  );
  handleMemoryClickRef.current = (memory: MemoryWithCoordinates) => {
    setSelectedMemory(memory);
    setMemoryDetailOpen(true);
  };

  const handleMemoryClick = useCallback((memory: MemoryWithCoordinates) => {
    handleMemoryClickRef.current(memory);
  }, []);

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
        setMapError(
          'Failed to initialize map. Please refresh the page or try a different browser.'
        );
      }
    }
  }, [handleLandmarkClick]);

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

  // Render memory pin markers
  useEffect(() => {
    if (!mapRef.current || memories.length === 0) return;

    // Clean up existing memory markers
    memoryMarkersRef.current.forEach((m) => m.remove());
    memoryMarkersRef.current = [];

    // Unmount roots asynchronously to avoid race condition
    const oldRoots = [...memoryRootsRef.current];
    memoryRootsRef.current = [];
    setTimeout(() => {
      oldRoots.forEach((r) => r.unmount());
    }, 0);

    // Render memory pins
    memories.forEach((memory) => {
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
  }, [memories, handleMemoryClick]);

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
        onToggleLandmarks={setShowLandmarks}
      />

      {/* Group Modal */}
      <GroupModal open={groupModalOpen} onOpenChange={setGroupModalOpen} />

      {/* Batches Modal */}
      <BatchesModal
        open={batchesModalOpen}
        onOpenChange={setBatchesModalOpen}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal open={addMemoryOpen} onOpenChange={setAddMemoryOpen} />

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
      />
    </div>
  );
}
