'use client';

import { useMutation } from '@tanstack/react-query';
import type { OnboardUserInput } from '@/lib/schemas';

interface CreateUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    studentId: string | null;
    firstName: string | null;
    lastName: string | null;
    programBatchId: string | null;
  };
}

export function useOnboardUser() {
  return useMutation({
    mutationFn: async (data: OnboardUserInput) => {
      const res = await fetch('/api/prisma/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(
          (body as { error?: string }).error ?? 'Failed to create user'
        );
      }

      return body as CreateUserResponse;
    },
  });
}
