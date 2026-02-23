'use client';

import { useQuery } from '@tanstack/react-query';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagsResponse {
  success: boolean;
  message: string;
  data: Tag[];
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch('/api/prisma/tag/get-all');
      if (!res.ok) throw new Error('Failed to fetch tags');
      return res.json() as Promise<TagsResponse>;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
