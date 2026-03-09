'use client';

import { useQuery } from '@tanstack/react-query';

interface VoteStatusResponse {
  success: boolean;
  data: {
    hasVoted: boolean;
    voteCount: number;
  };
}

export function useVoteStatus(memoryId: string | undefined) {
  return useQuery({
    queryKey: ['vote-status', memoryId],
    queryFn: async () => {
      const res = await fetch(
        `/api/prisma/memory/vote/status?memoryId=${memoryId}`
      );
      if (!res.ok) throw new Error('Failed to fetch vote status');
      return res.json() as Promise<VoteStatusResponse>;
    },
    enabled: !!memoryId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
