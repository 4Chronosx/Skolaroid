import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        isArchived: false,
        deletedAt: null,
        mediaURL: { not: null },
      },
      include: {
        tags: { select: { id: true, name: true } },
        location: {
          select: {
            buildingName: true,
            latitude: true,
            longitude: true,
          },
        },
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
