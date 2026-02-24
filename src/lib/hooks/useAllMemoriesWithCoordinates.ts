'use client';

import { useQuery } from '@tanstack/react-query';
import type { MemoryWithRelations } from '@/lib/schemas';

interface MemoryWithCoordinates extends MemoryWithRelations {
  location: {
    buildingName: string;
    latitude: number;
    longitude: number;
  };
}

interface AllMemoriesResponse {
  success: boolean;
  message: string;
  data: MemoryWithCoordinates[];
}

export function useAllMemoriesWithCoordinates() {
  return useQuery({
    queryKey: ['memories', 'all-with-coordinates'],
    queryFn: async () => {
      const res = await fetch('/api/prisma/memory/get-all-with-coordinates');
      if (!res.ok) throw new Error('Failed to fetch memories');
      return res.json() as Promise<AllMemoriesResponse>;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { MemoryWithCoordinates };
