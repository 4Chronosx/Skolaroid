'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteCommentPayload {
  commentId: string;
  memoryId: string; // needed for cache invalidation
}

interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: DeleteCommentPayload) => {
      const res = await fetch(
        `/api/prisma/memory/comment/${commentId}/delete`,
        { method: 'DELETE' }
      );

      const json = (await res.json()) as DeleteCommentResponse;

      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to delete comment');
      }

      return json;
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.memoryId],
      });
    },
  });
}
