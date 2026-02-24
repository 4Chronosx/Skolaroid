'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateMemoryServerInput,
  MemoryWithRelations,
} from '@/lib/schemas';

interface CreateMemoryResponse {
  success: boolean;
  message: string;
  data: MemoryWithRelations;
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    mutationFn: async (data: CreateMemoryServerInput) => {
      console.log('[useCreateMemory] sending request', data);
      const res = await fetch('/api/prisma/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      console.log('[useCreateMemory] response status', res.status);
      const text = await res.text();
      console.log('[useCreateMemory] response body', text);
      if (!res.ok) {
        let errorMessage = 'Failed to create memory';
        try {
          const errorBody = JSON.parse(text);
          errorMessage = errorBody.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
      return JSON.parse(text) as CreateMemoryResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
