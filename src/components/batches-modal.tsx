'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  X,
  Search,
  SlidersHorizontal,
  Calendar,
  Heart,
  Plus,
} from 'lucide-react';
import { MOCK_MEMORIES } from '@/lib/mock-data';
import {
  FilterMemoriesModal,
  DEFAULT_FILTERS,
  type MemoryFilters,
} from './map/FilterMemoriesModal';

// =============================================================================
// TYPES
// =============================================================================

interface BatchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DecadeOption {
  label: string;
  value: number | null; // null = "All"
}

// =============================================================================
// CONSTANTS
// =============================================================================

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

export function BatchesModal({ open, onOpenChange }: BatchesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MemoryFilters>(DEFAULT_FILTERS);

  // Extract unique tags and years from the full memory set for the filter panel
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    MOCK_MEMORIES.forEach((m) => m.tags.forEach((t) => tagSet.add(t.name)));
    return Array.from(tagSet).sort();
  }, []);

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    MOCK_MEMORIES.forEach((m) =>
      yearSet.add(new Date(m.uploadDate).getFullYear())
    );
    return Array.from(yearSet).sort((a, b) => b - a);
  }, []);

  // Filter memories by decade, search, and applied filters (AND logic)
  const displayedMemories = useMemo(() => {
    let result = [...MOCK_MEMORIES];

    // Decade sidebar filter
    if (selectedDecade !== null) {
      result = result.filter((m) => {
        const year = new Date(m.uploadDate).getFullYear();
        return year >= selectedDecade && year < selectedDecade + 10;
      });
    }

    // Keyword search (title + description)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }

    // Visibility filter
    if (filters.visibility !== 'ALL') {
      result = result.filter((m) => m.visibility === filters.visibility);
    }

    // Tags filter (AND — memory must contain ALL selected tags)
    if (filters.selectedTags.length > 0) {
      result = result.filter((m) => {
        const tagNames = m.tags.map((t) => t.name);
        return filters.selectedTags.every((st) => tagNames.includes(st));
      });
    }

    // Year filter
    if (filters.selectedYear !== null) {
      result = result.filter(
        (m) => new Date(m.uploadDate).getFullYear() === filters.selectedYear
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'date-newest':
        result.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
        break;
      case 'date-oldest':
        result.sort(
          (a, b) =>
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        );
        break;
      case 'upvotes-high':
        result.sort((a, b) => b._count.votes - a._count.votes);
        break;
      case 'upvotes-low':
        result.sort((a, b) => a._count.votes - b._count.votes);
        break;
    }

    return result;
  }, [selectedDecade, searchQuery, filters]);

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
                placeholder="Search"
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
                const isActive = selectedDecade === decade.value;
                return (
                  <button
                    key={decade.label}
                    onClick={() => setSelectedDecade(decade.value)}
                    className={cn(
                      'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    )}
                  >
                    {decade.label}
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
                  <div
                    key={memory.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(memory.uploadDate)}</span>
                        <span className="text-gray-300">•</span>
                        <Heart className="h-3.5 w-3.5" />
                        <span>{memory._count.votes}</span>
                      </div>
                      {memory.tags.length > 0 && (
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
                  </div>
                ))}

                {/* Placeholder "add" card */}
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <Plus className="h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">
                    No entry uploaded yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <p className="text-sm text-gray-400">No memories found</p>
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
