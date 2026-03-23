import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/prisma/user/get-current
 *
 * Returns the Prisma User record for the currently authenticated user,
 * including their program and batch via programBatch relation.
 * Returns { success: true, data: null } if the user has not yet onboarded.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        programBatch: {
          include: {
            program: true,
            batch: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: dbUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
