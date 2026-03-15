'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memoryId: string): Promise<void> => {
      const res = await fetch(
        `/api/prisma/memory/${encodeURIComponent(memoryId)}/delete`,
        {
          method: 'DELETE',
        }
      );

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to delete memory');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
