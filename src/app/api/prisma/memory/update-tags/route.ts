import { NextRequest, NextResponse } from 'next/server';
import { updateMemoryTagsSchema } from '@/lib/schemas';
import { slugify } from '@/lib/slugify';

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = updateMemoryTagsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with real Prisma query once SCRUM-54 is complete:
    // const updated = await prisma.memory.update({
    //   where: { id: result.data.memoryId },
    //   data: {
    //     tags: {
    //       set: [],
    //       connectOrCreate: result.data.tags.map((name) => ({
    //         where: { slug: slugify(name) },
    //         create: { name, slug: slugify(name) },
    //       })),
    //     },
    //   },
    //   include: { tags: true },
    // });
    const mockTags = result.data.tags.map((name) => ({
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
    }));

    return NextResponse.json({
      success: true,
      message: 'Tags updated successfully',
      data: { memoryId: result.data.memoryId, tags: mockTags },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to update tags. Please try again.',
      },
      { status: 500 }
    );
  }
}
