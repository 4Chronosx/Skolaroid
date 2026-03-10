import { prisma } from '@/lib/prisma';
import { onboardUserSchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/prisma/user/create
 *
 * Called after onboarding. The client sends firstName, lastName,
 * batchYear, programName, studentId, and status.
 * Auth provides email + uuid. role defaults to USER via Prisma schema.
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate ────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Validate request body ───────────────────────────────────────
    const body = await request.json();
    const parsed = onboardUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, batchYear, programName, studentId, status } =
      parsed.data;
    const email = authUser.email ?? '';

    // ── 3. Resolve Program & Batch ─────────────────────────────────────
    let program = await prisma.program.findFirst({
      where: { name: programName },
    });
    if (!program) {
      program = await prisma.program.create({
        data: { name: programName },
      });
    }

    let batch = await prisma.batch.findUnique({
      where: { year: batchYear },
    });
    if (!batch) {
      batch = await prisma.batch.create({
        data: { year: batchYear },
      });
    }

    let programBatch = await prisma.programBatch.findUnique({
      where: {
        programId_batchId: {
          programId: program.id,
          batchId: batch.id,
        },
      },
    });
    if (!programBatch) {
      programBatch = await prisma.programBatch.create({
        data: {
          programId: program.id,
          batchId: batch.id,
        },
      });
    }

    // ── 4. Check for existing user ─────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: true, message: 'User already exists', user: existingUser },
        { status: 200 }
      );
    }

    // ── 5. Create User ────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email,
        firstName,
        lastName,
        studentId,
        status,
        programBatch: { connect: { id: programBatch.id } },
      },
    });

    // ── 6. Mark user as onboarded in Supabase app_metadata ──────────
    const { createClient: createAdminClient } =
      await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      {
        app_metadata: { onboarded: true },
      }
    );

    if (metaError) {
      console.error(
        '[user/create] Failed to update app_metadata:',
        metaError.message
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[user/create] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
