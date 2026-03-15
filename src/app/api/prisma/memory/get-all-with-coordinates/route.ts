import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        location: {
          select: {
            id: true,
            buildingName: true,
            latitude: true,
            longitude: true,
          },
        },
        creator: { select: { firstName: true, lastName: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

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
