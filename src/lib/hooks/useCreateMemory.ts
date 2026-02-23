'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateMemoryServerInput } from '@/lib/schemas';

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    mutationFn: async (data: CreateMemoryServerInput) => {
      const res = await fetch('/api/prisma/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          (errorBody as { message?: string }).message ??
            'Failed to create memory'
        );
      }
      return res.json() as Promise<{
        success: boolean;
        message: string;
        data: Record<string, unknown>;
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
