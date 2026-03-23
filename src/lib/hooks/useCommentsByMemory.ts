'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { Comment } from '@/services/get-comments-service';

interface GetCommentsPage {
  success: boolean;
  data: {
    items: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
    commentCount: number;
  };
}

export function useCommentsByMemory(memoryId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['comments', memoryId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ memoryId: memoryId! });
      if (pageParam) params.set('cursor', pageParam);

      const res = await fetch(`/api/prisma/memory/comment/get?${params}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json() as Promise<GetCommentsPage>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!memoryId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
