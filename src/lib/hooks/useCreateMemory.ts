'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateMemoryInput } from '@/lib/schemas';

interface CreateMemoryPayload extends CreateMemoryInput {
  programBatchId: string;
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemoryPayload) => {
      const res = await fetch('/api/prisma/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? 'Failed to create memory');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
