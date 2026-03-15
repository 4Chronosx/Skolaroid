import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/prisma/memory/[memoryId]/delete
 *
 * Soft-deletes a memory. Only the creator can delete it.
 * Media files are intentionally kept in storage for potential restoration.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    const { memoryId } = await params;

    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Fetch memory ──────────────────────────────────────────────
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId, deletedAt: null },
      select: { id: true, creatorId: true },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // ── 3. Authorise — only the creator can delete ───────────────────
    if (memory.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the memory creator can delete this memory' },
        { status: 403 }
      );
    }

    // ── 4. Soft delete ───────────────────────────────────────────────
    await prisma.memory.update({
      where: { id: memoryId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[memory/delete] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
