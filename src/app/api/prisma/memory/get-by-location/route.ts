import { NextRequest, NextResponse } from 'next/server';
import { memoriesByLocationQuerySchema } from '@/lib/schemas';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = memoriesByLocationQuerySchema.safeParse({
      locationId: searchParams.get('locationId'),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    const memories = await prisma.memory.findMany({
      where: {
        locationId: result.data.locationId,
        deletedAt: null,
      },
      include: {
        tags: true,
        location: { select: { id: true, buildingName: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Memories fetched successfully',
      data: memories,
    });
  } catch (err) {
    console.error('[GET /api/prisma/memory/get-by-location]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch memories. Please try again.',
      },
      { status: 500 }
    );
  }
}
