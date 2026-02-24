import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: { _count: { select: { memories: true } } },
      orderBy: { buildingName: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Locations fetched successfully',
      data: locations,
    });
  } catch (err) {
    console.error('[GET /api/prisma/location/get-all]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch locations. Please try again.',
      },
      { status: 500 }
    );
  }
}
