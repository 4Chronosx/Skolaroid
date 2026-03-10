import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { invitationActionSchema } from '@/lib/schemas';

/**
 * POST /api/prisma/invitation/decline
 *
 * Declines an invitation by deleting the invitation record.
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Validate ──────────────────────────────────────────────────
    const body = await request.json();
    const parsed = invitationActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // ── 3. Find and delete invitation ────────────────────────────────
    const invitation = await prisma.invitation.findUnique({
      where: { token: parsed.data.token },
      select: { id: true, group: { select: { name: true } } },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    await prisma.invitation.delete({ where: { id: invitation.id } });

    return NextResponse.json({
      success: true,
      message: `Declined invitation to "${invitation.group.name}"`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[invitation/decline] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
