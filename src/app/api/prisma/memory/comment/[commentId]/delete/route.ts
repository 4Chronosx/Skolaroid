import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/prisma/memory/comment/[commentId]/delete
 *
 * Soft-deletes a comment by setting deletedAt.
 * Only the comment author or an ADMIN may delete.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    // ── 1. Authenticate ────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // ── 2. Fetch comment + requesting user's role ──────────────────────────
    const [comment, dbUser] = await Promise.all([
      // @ts-expect-error — MemoryComment not yet in generated types; resolves after prisma generate
      prisma.memoryComment.findUnique({
        where: { id: commentId, deletedAt: null },
        select: { id: true, authorId: true },
      }),
      prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, role: true },
      }),
    ]);

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Complete onboarding before performing this action',
        },
        { status: 403 }
      );
    }

    // ── 3. Authorise — author or admin only ────────────────────────────────
    const isAuthor = comment.authorId === dbUser.id;
    const isAdmin = dbUser.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Not authorised to delete this comment' },
        { status: 403 }
      );
    }

    // ── 4. Soft delete ─────────────────────────────────────────────────────
    // @ts-expect-error — MemoryComment not yet in generated types; resolves after prisma generate
    await prisma.memoryComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (err) {
    console.error('[comment/delete] unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to delete comment. Please try again.',
      },
      { status: 500 }
    );
  }
}
