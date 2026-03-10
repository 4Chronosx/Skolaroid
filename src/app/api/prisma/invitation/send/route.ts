import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendInvitationsSchema } from '@/lib/schemas';
import { sendInvitationEmail } from '@/lib/email';

const INVITATION_EXPIRY_DAYS = 7;

/**
 * POST /api/prisma/invitation/send
 *
 * Sends invitations to one or more email addresses.
 * Only the group creator (owner) can send invitations.
 * Creates Invitation records and returns invite links.
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
    const parsed = sendInvitationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { groupId, emails } = parsed.data;

    // ── 3. Fetch group and verify ownership ──────────────────────────
    const group = await prisma.privateGroup.findUnique({
      where: { id: groupId, deletedAt: null },
      select: { id: true, name: true, creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the group owner can send invitations' },
        { status: 403 }
      );
    }

    // ── 4. Create invitations ────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitations = await Promise.all(
      emails.map(async (email) => {
        const token = crypto.randomBytes(32).toString('hex');
        return prisma.invitation.create({
          data: {
            groupId,
            invitedBy: authUser.id,
            email: email.toLowerCase(),
            token,
            expiresAt,
          },
          select: { id: true, email: true, token: true, expiresAt: true },
        });
      })
    );

    // ── 5. Build invite links ────────────────────────────────────────
    const origin = request.headers.get('origin') ?? request.nextUrl.origin;
    const results = invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      inviteLink: `${origin}/invite?token=${inv.token}`,
      expiresAt: inv.expiresAt.toISOString(),
    }));

    // ── 6. Send invitation emails ────────────────────────────────────
    const inviterName =
      authUser.user_metadata?.full_name ?? authUser.email ?? 'A Skolaroid user';

    const emailResults = await Promise.allSettled(
      results.map((inv) =>
        sendInvitationEmail({
          to: inv.email,
          inviterName,
          groupName: group.name,
          inviteLink: inv.inviteLink,
          expiresAt: inv.expiresAt,
        })
      )
    );

    const failedEmails = emailResults
      .map((r, i) => (r.status === 'rejected' ? results[i].email : null))
      .filter(Boolean);

    if (failedEmails.length > 0) {
      console.warn(
        `[invitation/send] Failed to email: ${failedEmails.join(', ')}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `${invitations.length} invitation(s) created, ${invitations.length - failedEmails.length} email(s) sent`,
      data: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[invitation/send] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
