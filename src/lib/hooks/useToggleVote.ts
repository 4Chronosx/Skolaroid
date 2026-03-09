'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface VoteStatusData {
  success: boolean;
  data: { hasVoted: boolean; voteCount: number };
}

interface ToggleVotePayload {
  memoryId: string;
}

interface ToggleVoteResponse {
  success: boolean;
  message: string;
  data: { voted: boolean; voteCount: number };
}

const DEBOUNCE_MS = 2_000;

export function useToggleVote() {
  const queryClient = useQueryClient();

  // Per-memoryId last-toggle timestamp — mirrors the server-side rate limit so
  // we avoid sending a request we know will return 429.
  const lastToggleRef = useRef<Map<string, number>>(new Map());

  const mutation = useMutation({
    mutationFn: async ({ memoryId }: ToggleVotePayload) => {
      const now = Date.now();
      const last = lastToggleRef.current.get(memoryId);

      // Client-side debounce guard — silently swallow the click.
      if (last !== undefined && now - last < DEBOUNCE_MS) return null;

      lastToggleRef.current.set(memoryId, now);

      const res = await fetch('/api/prisma/memory/vote/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId }),
      });

      const json = (await res.json()) as ToggleVoteResponse & {
        success: false;
        message: string;
      };

      if (!res.ok) {
        throw Object.assign(new Error(json.message ?? 'Vote failed'), {
          status: res.status,
        });
      }

      return json;
    },

    // ── Optimistic update ──────────────────────────────────────────────────
    onMutate: async ({ memoryId }) => {
      await queryClient.cancelQueries({ queryKey: ['vote-status', memoryId] });

      const snapshot = queryClient.getQueryData<VoteStatusData>([
        'vote-status',
        memoryId,
      ]);

      if (snapshot) {
        const current = snapshot.data;
        queryClient.setQueryData<VoteStatusData>(['vote-status', memoryId], {
          ...snapshot,
          data: {
            hasVoted: !current.hasVoted,
            voteCount: current.hasVoted
              ? current.voteCount - 1
              : current.voteCount + 1,
          },
        });
      }

      return { snapshot, memoryId };
    },

    // ── Roll back on error ─────────────────────────────────────────────────
    onError: (_err, _variables, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(
          ['vote-status', context.memoryId],
          context.snapshot
        );
      }
    },

    // ── Reconcile with server on settle ───────────────────────────────────
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vote-status', variables.memoryId],
      });
    },
  });

  return mutation;
}
