'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { MemoryDetailModal } from './map/MemoryDetailModal';
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
  /** Called when the user confirms switching to a different era's map. */
  onEraSwitched?: (newEra: number) => void;
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
  onEraSwitched,
}: BatchesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState<number | null>(
    activeMapEra
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MemoryFilters>(DEFAULT_FILTERS);

  // MemoryDetailModal state
  const [selectedMemory, setSelectedMemory] =
    useState<MemoryWithCoordinates | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);

  // Era-switch confirmation state
  const [eraSwitchTarget, setEraSwitchTarget] = useState<{
    memory: MemoryWithCoordinates;
    decade: number;
  } | null>(null);

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

  // Handle clicking a memory card
  const handleMemoryCardClick = (memory: MemoryWithCoordinates) => {
    const memoryDecade = getEraFromBatchTag(
      memory.tags ?? [],
      memory.createdAt
    );

    // If the memory belongs to the active era, open directly
    if (memoryDecade === activeMapEra) {
      setSelectedMemory(memory);
      setMemoryDetailOpen(true);
      return;
    }

    // Otherwise, show confirmation to switch eras
    setEraSwitchTarget({ memory, decade: memoryDecade });
  };

  // Confirm era switch — notify parent, close this modal
  const handleConfirmEraSwitch = () => {
    if (!eraSwitchTarget) return;
    onEraSwitched?.(eraSwitchTarget.decade);
    onOpenChange(false);
    // Reset internal state
    setEraSwitchTarget(null);
    setSearchQuery('');
    setFiltersOpen(false);
    setMemoryDetailOpen(false);
    setSelectedMemory(null);
  };

  // Navigation within the displayed memories list
  const selectedIndex = selectedMemory
    ? displayedMemories.findIndex((m) => m.id === selectedMemory.id)
    : -1;

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery('');
    setFiltersOpen(false);
    setMemoryDetailOpen(false);
    setSelectedMemory(null);
    setEraSwitchTarget(null);
  };

  return (
    <>
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
                          <span className="text-sm text-gray-400">
                            No image
                          </span>
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

      {/* Era-Switch Confirmation Dialog */}
      <Dialog
        open={eraSwitchTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEraSwitchTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Switch Map Era?
          </DialogTitle>
          <p className="text-sm text-gray-600">
            This memory belongs to the{' '}
            <span className="font-semibold">{eraSwitchTarget?.decade}s</span>{' '}
            era. Viewing it will switch the active map to the{' '}
            <span className="font-semibold">{eraSwitchTarget?.decade}s</span>{' '}
            map.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEraSwitchTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEraSwitch}
              className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
            >
              Switch Era
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        open={memoryDetailOpen}
        onOpenChange={setMemoryDetailOpen}
        hasPrevious={selectedIndex > 0}
        hasNext={selectedIndex < displayedMemories.length - 1}
        onPrevious={() => {
          if (selectedIndex > 0) {
            setSelectedMemory(displayedMemories[selectedIndex - 1]);
          }
        }}
        onNext={() => {
          if (selectedIndex < displayedMemories.length - 1) {
            setSelectedMemory(displayedMemories[selectedIndex + 1]);
          }
        }}
      />
    </>
  );
}
