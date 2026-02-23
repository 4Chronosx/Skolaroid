import { NextResponse } from 'next/server';
import { MOCK_LOCATIONS, MOCK_MEMORIES } from '@/lib/mock-data';

export async function GET() {
  try {
    // TODO: Replace with real Prisma query once SCRUM-54 is complete:
    // const locations = await prisma.location.findMany({
    //   include: { _count: { select: { memories: true } } },
    //   orderBy: { buildingName: 'asc' },
    // });
    const locations = MOCK_LOCATIONS.map((loc) => ({
      ...loc,
      _count: {
        memories: MOCK_MEMORIES.filter((m) => m.locationId === loc.id).length,
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Locations fetched successfully',
      data: locations,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch locations. Please try again.',
      },
      { status: 500 }
    );
  }
}
