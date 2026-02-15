import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Users array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate required fields for each user
    for (const user of users) {
      if (
        !user.email ||
        !user.studentId ||
        !user.firstName ||
        !user.lastName ||
        !user.programBatchId
      ) {
        return NextResponse.json(
          {
            error:
              'Each user must have email, studentId, firstName, lastName, and programBatchId',
          },
          { status: 400 }
        );
      }
    }

    const result = await prisma.user.createMany({
      data: users.map(
        (user: {
          email: string;
          studentId: string;
          firstName: string;
          lastName: string;
          programBatchId: string;
        }) => ({
          email: user.email,
          studentId: user.studentId,
          firstName: user.firstName,
          lastName: user.lastName,
          programBatchId: user.programBatchId,
        })
      ),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Users created successfully',
      count: result.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
