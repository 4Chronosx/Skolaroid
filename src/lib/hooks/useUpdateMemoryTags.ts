'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateMemoryTagsInput } from '@/lib/schemas';

interface UpdateMemoryTagsResponse {
  success: boolean;
  message: string;
  data: {
    memoryId: string;
    tags: { id: string; name: string; slug: string }[];
  };
}

export function useUpdateMemoryTags() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    mutationFn: async (data: UpdateMemoryTagsInput) => {
      const res = await fetch('/api/prisma/memory/update-tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          (errorBody as { message?: string }).message ?? 'Failed to update tags'
        );
      }
      return res.json() as Promise<UpdateMemoryTagsResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
