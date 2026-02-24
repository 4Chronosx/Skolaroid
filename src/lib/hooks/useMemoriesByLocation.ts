'use client';

import { useQuery } from '@tanstack/react-query';
import type { MemoryWithRelations } from '@/lib/schemas';

interface MemoriesByLocationResponse {
  success: boolean;
  message: string;
  data: MemoryWithRelations[];
}

interface UseMemoriesByLocationParams {
  locationId?: string | null;
  buildingName?: string | null;
}

export function useMemoriesByLocation(params: UseMemoriesByLocationParams) {
  const { locationId, buildingName } = params;
  const enabled = !!(locationId || buildingName);

  return useQuery({
    queryKey: ['memories', 'by-location', locationId ?? buildingName],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (locationId) searchParams.set('locationId', locationId);
      else if (buildingName) searchParams.set('buildingName', buildingName);

      const res = await fetch(
        `/api/prisma/memory/get-by-location?${searchParams.toString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch memories');
      return res.json() as Promise<MemoriesByLocationResponse>;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
