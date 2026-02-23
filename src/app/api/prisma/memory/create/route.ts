import { NextRequest, NextResponse } from 'next/server';
import { createMemoryServerSchema } from '@/lib/schemas';

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

    // TODO: Replace mock with service layer call (e.g. createMemoryService(result.data))
    const mockMemory = {
      id: crypto.randomUUID(),
      ...result.data,
      mediaURL: null,
      uploadDate: new Date().toISOString(),
      isArchived: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Memory created successfully',
      data: mockMemory,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Unable to create memory. Please try again.' },
      { status: 500 }
    );
  }
}
