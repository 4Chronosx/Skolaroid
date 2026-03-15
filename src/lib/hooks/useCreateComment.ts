'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateCommentPayload {
  memoryId: string;
  content: string;
}

interface CreateCommentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    content: string;
    memoryId: string;
    authorId: string;
    author: { id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
  };
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, content }: CreateCommentPayload) => {
      const res = await fetch('/api/prisma/memory/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId, content }),
      });

      const json = (await res.json()) as CreateCommentResponse;

      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to post comment');
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
