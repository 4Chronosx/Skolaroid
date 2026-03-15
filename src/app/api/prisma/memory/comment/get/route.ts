import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCommentsQuerySchema } from '@/lib/schemas';
import { getCommentsService } from '@/services/get-comments-service';

export async function GET(request: NextRequest) {
  try {
    // ── 1. Validate query params ───────────────────────────────────────────
    const { searchParams } = request.nextUrl;
    const parsed = getCommentsQuerySchema.safeParse({
      memoryId: searchParams.get('memoryId'),
      cursor: searchParams.get('cursor') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { memoryId, cursor, limit } = parsed.data;

    // ── 2. Fetch paginated comments ────────────────────────────────────────
    const { items, nextCursor, hasMore } = await getCommentsService(
      memoryId,
      limit,
      cursor
    );

    // ── 3. Fetch total comment count (excluding soft-deleted) ──────────────
    const commentCount = await prisma.memoryComment.count({
      where: { memoryId, deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: { items, nextCursor, hasMore, commentCount },
    });
  } catch (err) {
    console.error('[comment/get] unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch comments. Please try again.',
      },
      { status: 500 }
    );
  }
}
