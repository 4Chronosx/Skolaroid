import { NextRequest, NextResponse } from 'next/server';
import { createMemoryServerSchema } from '@/lib/schemas';
import { createMemoryService } from '@/services/create-memory-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = createMemoryServerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    // DEV ONLY: look up seed user directly via Prisma so the id is guaranteed
    // to match the User FK in Memory.
    const seedUser = await prisma.user.findUnique({
      where: { email: 'seed@skolaroid.dev' },
      select: { id: true },
    });

    if (!seedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seed user not found – run `npx prisma db seed`',
        },
        { status: 500 }
      );
    }

    const memory = await createMemoryService(result.data, seedUser.id);
    return NextResponse.json({
      success: true,
      message: 'Memory created successfully',
      data: memory,
    });
  } catch (err) {
    console.error('[create memory] unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create memory. Please try again.',
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
