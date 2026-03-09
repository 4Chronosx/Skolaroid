import { prisma } from '@/lib/prisma';

/**
 * Toggles a vote on a memory for the given user inside a single transaction:
 *   - If the vote record exists → delete it (un-vote)
 *   - If it doesn't exist     → create it (vote)
 *
 * Returns the definitive state after the toggle plus the new total vote count.
 */
export async function toggleVoteService(
  memoryId: string,
  userId: string
): Promise<{ voted: boolean; voteCount: number }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.memoryVote.findUnique({
      where: { memoryId_userId: { memoryId, userId } },
      select: { id: true },
    });

    if (existing) {
      await tx.memoryVote.delete({
        where: { memoryId_userId: { memoryId, userId } },
      });
    } else {
      await tx.memoryVote.create({
        data: { memoryId, userId },
      });
    }

    const voteCount = await tx.memoryVote.count({ where: { memoryId } });

    return { voted: !existing, voteCount };
  });
}
