import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { toggleVoteSchema } from '@/lib/schemas';
import { toggleVoteService } from '@/services/toggle-vote-service';

/**
 * Resolves the userId for the request.
 * - Production:  real Supabase session → check Prisma User row exists.
 * - Development: same flow, but if there is no session the seed user is used
 *                as a convenience fallback (never runs in production).
 *
 * Returns:
 *   { userId: string }  — proceed with this user
 *   { error: NextResponse } — return this response immediately
 */
async function resolveUser(
  isDev: boolean
): Promise<{ userId: string } | { error: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    // Real session: verify the Prisma User row exists (FK requirement).
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });

    if (!dbUser) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: 'Complete onboarding before voting',
          },
          { status: 403 }
        ),
      };
    }

    return { userId: dbUser.id };
  }

  // No session — dev seed-user fallback only.
  if (isDev) {
    const seedUser = await prisma.user.findUnique({
      where: { email: 'seed@skolaroid.dev' },
      select: { id: true },
    });

    if (seedUser) return { userId: seedUser.id };
  }

  return {
    error: NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    ),
  };
}

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────
    const resolved = await resolveUser(isDev);
    if ('error' in resolved) return resolved.error;
    const { userId } = resolved;

    // ── 2. Validate body ───────────────────────────────────────────────────
    const body = await request.json();
    const parsed = toggleVoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { memoryId } = parsed.data;

    // ── 3. Toggle vote ─────────────────────────────────────────────────────
    const result = await toggleVoteService(memoryId, userId);

    return NextResponse.json({
      success: true,
      message: result.voted ? 'Vote added' : 'Vote removed',
      data: result,
    });
  } catch (err) {
    console.error('[vote/toggle] unexpected error:', err);
    return NextResponse.json(
      { success: false, message: 'Unable to process vote. Please try again.' },
      { status: 500 }
    );
  }
}
