import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { groupMemberSchema } from '@/lib/schemas';

/**
 * POST /api/prisma/group/[groupId]/members
 *
 * Adds a member to the group by email. Only the creator can add members.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Validate body ─────────────────────────────────────────────
    const body = await request.json();
    const parsed = groupMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // ── 3. Fetch group ───────────────────────────────────────────────
    const group = await prisma.privateGroup.findUnique({
      where: { id: groupId, deletedAt: null },
      select: { id: true, creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // ── 4. Authorise — only creator can add members ──────────────────
    if (group.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the group creator can add members' },
        { status: 403 }
      );
    }

    // ── 5. Find user by email ────────────────────────────────────────
    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'No user found with that email' },
        { status: 404 }
      );
    }

    // ── 6. Add member ────────────────────────────────────────────────
    const updated = await prisma.privateGroup.update({
      where: { id: groupId },
      data: { members: { connect: { id: targetUser.id } } },
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { members: true, memories: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Member added successfully',
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[group/members/add] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/prisma/group/[groupId]/members
 *
 * Removes a member from the group. The creator can remove anyone;
 * a regular member can only remove themselves (leave).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Validate body ─────────────────────────────────────────────
    const body = await request.json();
    const parsed = groupMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // ── 3. Fetch group ───────────────────────────────────────────────
    const group = await prisma.privateGroup.findUnique({
      where: { id: groupId, deletedAt: null },
      select: { id: true, creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // ── 4. Find target user ──────────────────────────────────────────
    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'No user found with that email' },
        { status: 404 }
      );
    }

    // ── 5. Authorise ─────────────────────────────────────────────────
    const isSelf = targetUser.id === authUser.id;
    const isCreator = group.creatorId === authUser.id;

    if (!isSelf && !isCreator) {
      return NextResponse.json(
        {
          error:
            'You can only remove yourself or be the creator to remove others',
        },
        { status: 403 }
      );
    }

    // Prevent creator from removing themselves (they should delete the group)
    if (isSelf && isCreator) {
      return NextResponse.json(
        { error: 'The group creator cannot leave. Delete the group instead.' },
        { status: 400 }
      );
    }

    // ── 6. Remove member ─────────────────────────────────────────────
    const updated = await prisma.privateGroup.update({
      where: { id: groupId },
      data: { members: { disconnect: { id: targetUser.id } } },
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { members: true, memories: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: isSelf ? 'You left the group' : 'Member removed successfully',
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[group/members/remove] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
