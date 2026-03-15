import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

const BUCKET = 'memory-media';

/**
 * DELETE /api/prisma/memory/[memoryId]/delete
 *
 * Soft-deletes a memory. Only the creator can delete it.
 * Also attempts best-effort cleanup of the file in Supabase Storage.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    const { memoryId } = await params;

    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── 2. Fetch memory ──────────────────────────────────────────────
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId, deletedAt: null },
      select: { id: true, creatorId: true, mediaURL: true },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // ── 3. Authorise — only the creator can delete ───────────────────
    if (memory.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the memory creator can delete this memory' },
        { status: 403 }
      );
    }

    // ── 4. Soft delete ───────────────────────────────────────────────
    await prisma.memory.update({
      where: { id: memoryId },
      data: { deletedAt: new Date() },
    });

    // ── 5. Best-effort storage cleanup ───────────────────────────────
    if (memory.mediaURL) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && serviceRoleKey) {
          const serviceClient = createServiceClient(
            supabaseUrl,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
          );

          // Extract filename from the public URL (last segment after bucket name)
          const url = new URL(memory.mediaURL);
          const segments = url.pathname.split('/');
          const filename = segments[segments.length - 1];

          if (filename) {
            const { error: removeError } = await serviceClient.storage
              .from(BUCKET)
              .remove([filename]);

            if (removeError) {
              console.error(
                '[memory/delete] storage cleanup failed:',
                removeError
              );
            }
          }
        }
      } catch (storageErr) {
        console.error('[memory/delete] storage cleanup error:', storageErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[memory/delete] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
