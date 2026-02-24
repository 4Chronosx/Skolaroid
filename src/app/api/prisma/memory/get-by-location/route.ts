import { NextRequest, NextResponse } from 'next/server';
import { memoriesByLocationQuerySchema } from '@/lib/schemas';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = memoriesByLocationQuerySchema.safeParse({
      locationId: searchParams.get('locationId') || undefined,
      buildingName: searchParams.get('buildingName') || undefined,
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

    const whereClause: {
      deletedAt: null;
      locationId?: string;
      location?: { buildingName: string };
    } = {
      deletedAt: null,
    };

    if (result.data.locationId) {
      whereClause.locationId = result.data.locationId;
    } else if (result.data.buildingName) {
      whereClause.location = { buildingName: result.data.buildingName };
    }

    const memories = await prisma.memory.findMany({
      where: whereClause,
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
