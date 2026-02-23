import { NextResponse } from 'next/server';
import { MOCK_TAGS } from '@/lib/mock-data';

export async function GET() {
  try {
    // TODO: Replace with real Prisma query once SCRUM-54 is complete:
    // const tags = await prisma.tag.findMany({
    //   orderBy: { name: 'asc' },
    // });
    const tags = [...MOCK_TAGS].sort((a, b) => a.name.localeCompare(b.name));

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
