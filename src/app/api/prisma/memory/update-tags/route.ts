import { NextRequest, NextResponse } from 'next/server';
import { updateMemoryTagsSchema } from '@/lib/schemas';
import { slugify } from '@/lib/slugify';
import { prisma } from '@/lib/prisma';

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

    const updated = await prisma.memory.update({
      where: { id: result.data.memoryId },
      data: {
        tags: {
          set: [],
          connectOrCreate: result.data.tags.map((name) => ({
            where: { slug: slugify(name) },
            create: { name, slug: slugify(name) },
          })),
        },
      },
      include: { tags: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Tags updated successfully',
      data: { memoryId: updated.id, tags: updated.tags },
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
