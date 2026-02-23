'use client';

// TODO: Update next.config.ts images.remotePatterns when real media URLs
// (e.g., Supabase storage) are used instead of local placeholders.

import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MemoryVisibility } from '@/lib/schemas';

const VISIBILITY_LABELS: Record<MemoryVisibility, string> = {
  PUBLIC: 'Public',
  PROGRAM_ONLY: 'Program',
  BATCH_ONLY: 'Batch',
  PRIVATE: 'Private',
};

export interface MemoryCardMemory {
  id: string;
  title: string;
  description?: string | null;
  mediaURL?: string | null;
  visibility: MemoryVisibility;
  tags?: { id: string; name: string }[];
  location?: { buildingName: string };
  _count?: { votes: number };
}

interface MemoryCardProps {
  memory: MemoryCardMemory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <Card className="overflow-hidden">
      {memory.mediaURL && (
        <div className="relative h-48 w-full">
          <Image
            src={memory.mediaURL}
            alt={memory.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{memory.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {VISIBILITY_LABELS[memory.visibility]}
          </Badge>
        </div>
        {memory.location && (
          <CardDescription>{memory.location.buildingName}</CardDescription>
        )}
      </CardHeader>
      {memory.description && (
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {memory.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          {memory.tags?.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
        {memory._count != null && <span>{memory._count.votes} votes</span>}
      </CardFooter>
    </Card>
  );
}
