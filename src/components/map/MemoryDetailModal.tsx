'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { VISIBILITY_LABELS } from '@/lib/schemas';
import type { MemoryWithCoordinates } from '@/lib/hooks/useAllMemoriesWithCoordinates';
import Image from 'next/image';

interface MemoryDetailModalProps {
  memory: MemoryWithCoordinates | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function MemoryDetailModal({
  memory,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: MemoryDetailModalProps) {
  if (!memory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{memory.title}</DialogTitle>
        </DialogHeader>

        {/* Memory Image */}
        {memory.mediaURL && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={memory.mediaURL}
              alt={memory.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Navigation Buttons - Inside Modal */}
        {(hasPrevious || hasNext) && (
          <div className="flex items-center justify-between gap-4">
            {hasPrevious ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious?.();
                }}
                className="flex items-center gap-2 rounded-lg bg-skolaroid-blue px-4 py-2 text-white transition-all hover:bg-skolaroid-blue/90"
                aria-label="Previous memory"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Previous</span>
              </button>
            ) : (
              <div />
            )}

            {hasNext ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                className="flex items-center gap-2 rounded-lg bg-skolaroid-blue px-4 py-2 text-white transition-all hover:bg-skolaroid-blue/90"
                aria-label="Next memory"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {VISIBILITY_LABELS[memory.visibility]}
          </Badge>
          {memory.location && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {memory.location.buildingName}
            </Badge>
          )}
          {memory._count != null && (
            <Badge variant="outline" className="gap-1">
              <ThumbsUp className="h-3 w-3" />
              {memory._count.votes} votes
            </Badge>
          )}
        </div>

        {/* Description */}
        {memory.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">
              {memory.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
