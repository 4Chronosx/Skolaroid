'use client';

import { useQuery } from '@tanstack/react-query';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await fetch('/api/prisma/location/get-all');
      if (!res.ok) throw new Error('Failed to fetch locations');
      return res.json();
    },
  });
}
