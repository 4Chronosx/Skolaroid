'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateCustomLocationPayload {
  buildingName: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface LocationData {
  id: string;
  buildingName: string;
  latitude: number;
  longitude: number;
}

interface CreateLocationResponse {
  success: boolean;
  message: string;
  data: LocationData;
  reused: boolean;
}

export function useCreateCustomLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCustomLocationPayload) => {
      const res = await fetch('/api/prisma/location/create-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as CreateLocationResponse;
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Failed to create location');
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}