import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/prisma/group/[groupId]/delete
 *
 * Soft-deletes a private group. Only the creator can delete it.
 */
export async function DELETE(
  _request: NextRequest,
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

    // ── 2. Fetch group ───────────────────────────────────────────────
    const group = await prisma.privateGroup.findUnique({
      where: { id: groupId, deletedAt: null },
      select: { id: true, creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // ── 3. Authorise — only the creator can delete ───────────────────
    if (group.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the group creator can delete this group' },
        { status: 403 }
      );
    }

    // ── 4. Soft delete ───────────────────────────────────────────────
    await prisma.privateGroup.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[group/delete] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
