import { NextRequest, NextResponse } from 'next/server';
import { memoriesByLocationQuerySchema } from '@/lib/schemas';
import { MOCK_MEMORIES } from '@/lib/mock-data';

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

    // TODO: Replace mock filter with real Prisma query once SCRUM-54 is complete:
    // const memories = await prisma.memory.findMany({
    //   where: {
    //     locationId: result.data.locationId,
    //     isArchived: false,
    //     deletedAt: null,
    //   },
    //   include: {
    //     tags: true,
    //     location: { select: { id: true, buildingName: true } },
    //     _count: { select: { votes: true } },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });
    const memories = MOCK_MEMORIES.filter(
      (m) => m.locationId === result.data.locationId
    );

    return NextResponse.json({
      success: true,
      message: 'Memories fetched successfully',
      data: memories,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch memories. Please try again.',
      },
      { status: 500 }
    );
  }
}
