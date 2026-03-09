'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MemberAction {
  groupId: string;
  email: string;
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, email }: MemberAction) => {
      const res = await fetch(
        `/api/prisma/group/${encodeURIComponent(groupId)}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to add member');
      return body.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['groups', variables.groupId],
      });
      queryClient.invalidateQueries({ queryKey: ['groups', 'mine'] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, email }: MemberAction) => {
      const res = await fetch(
        `/api/prisma/group/${encodeURIComponent(groupId)}/members`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to remove member');
      return body.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['groups', variables.groupId],
      });
      queryClient.invalidateQueries({ queryKey: ['groups', 'mine'] });
    },
  });
}
