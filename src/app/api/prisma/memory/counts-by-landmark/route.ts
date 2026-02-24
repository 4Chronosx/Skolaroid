import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LANDMARKS } from '@/lib/constants/landmarks';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        buildingName: true,
        _count: {
          select: {
            memories: {
              where: { isArchived: false, deletedAt: null },
            },
          },
        },
      },
    });

    const nameToCount = new Map<string, number>();
    for (const loc of locations) {
      nameToCount.set(loc.buildingName, loc._count.memories);
    }

    const data: Record<string, number> = {};
    for (const landmark of LANDMARKS) {
      data[landmark.id] = nameToCount.get(landmark.name) ?? 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Memory counts fetched successfully',
      data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch memory counts. Please try again.',
      },
      { status: 500 }
    );
  }
}
