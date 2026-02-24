import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Tags fetched successfully',
      data: tags,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch tags. Please try again.',
      },
      { status: 500 }
    );
  }
}
