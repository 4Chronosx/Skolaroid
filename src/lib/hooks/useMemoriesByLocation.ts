'use client';

import { useQuery } from '@tanstack/react-query';

export function useMemoriesByLocation(locationId: string | null) {
  return useQuery({
    queryKey: ['memories', 'by-location', locationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/prisma/memory/get-by-location?locationId=${locationId}`
      );
      if (!res.ok) throw new Error('Failed to fetch memories');
      return res.json();
    },
    enabled: !!locationId,
  });
}
