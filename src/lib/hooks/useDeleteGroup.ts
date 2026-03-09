'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string): Promise<void> => {
      const res = await fetch(
        `/api/prisma/group/${encodeURIComponent(groupId)}/delete`,
        {
          method: 'DELETE',
        }
      );

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to delete group');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
