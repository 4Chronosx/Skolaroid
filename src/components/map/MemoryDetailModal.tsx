'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, ThumbsUp } from 'lucide-react';
import { VISIBILITY_LABELS, type MemoryWithRelations } from '@/lib/schemas';
import Image from 'next/image';

interface MemoryDetailModalProps {
  memory: MemoryWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoryDetailModal({
  memory,
  open,
  onOpenChange,
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
