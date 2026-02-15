import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, studentId, firstName, lastName, programBatchId } =
      await request.json();

    if (!email || !studentId || !firstName || !lastName || !programBatchId) {
      return NextResponse.json(
        {
          error:
            'Email, studentId, firstName, lastName, and programBatchId are required',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        studentId,
        firstName,
        lastName,
        programBatchId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
