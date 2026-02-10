'use client';

import { useQuery } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/prisma/user/get-all');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });
}
