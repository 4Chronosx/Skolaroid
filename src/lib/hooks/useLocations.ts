'use client';

import { useQuery } from '@tanstack/react-query';

interface LocationWithCount {
  id: string;
  buildingName: string;
  description: string | null;
  latitude: number;
  longitude: number;
  _count: { memories: number };
}

interface LocationsResponse {
  success: boolean;
  message: string;
  data: LocationWithCount[];
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await fetch('/api/prisma/location/get-all');
      if (!res.ok) throw new Error('Failed to fetch locations');
      return res.json() as Promise<LocationsResponse>;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
