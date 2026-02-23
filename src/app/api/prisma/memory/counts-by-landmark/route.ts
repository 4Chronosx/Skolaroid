import { NextResponse } from 'next/server';
import { MOCK_MEMORIES } from '@/lib/mock-data';
import { LANDMARKS } from '@/lib/constants/landmarks';

export async function GET() {
  try {
    // TODO: Replace with real Prisma aggregation once SCRUM-54 is complete:
    // const counts = await prisma.memory.groupBy({
    //   by: ['locationId'],
    //   where: { isArchived: false, deletedAt: null },
    //   _count: { id: true },
    // });

    // Build a lookup from mock location buildingName → count
    const countByLocationId = new Map<string, number>();
    for (const m of MOCK_MEMORIES) {
      countByLocationId.set(
        m.locationId,
        (countByLocationId.get(m.locationId) ?? 0) + 1
      );
    }

    // Map landmark building names to mock location names for demo bridging.
    // Once real DB integration exists, landmarks will reference location UUIDs directly.
    const nameToMockCount = new Map<string, number>();
    for (const m of MOCK_MEMORIES) {
      const name = m.location.buildingName;
      nameToMockCount.set(name, (nameToMockCount.get(name) ?? 0) + 1);
    }

    const data: Record<string, number> = {};
    for (const landmark of LANDMARKS) {
      data[landmark.id] = nameToMockCount.get(landmark.name) ?? 0;
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
