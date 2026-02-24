import { NextRequest, NextResponse } from 'next/server';
import { createMemoryServerSchema } from '@/lib/schemas';
import { createMemoryService } from '@/services/create-memory-service';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

    // DEV ONLY: use service-role key to bypass RLS and grab the first seeded user
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: seedUser, error: userError } = await supabase
      .from('User')
      .select('id')
      .order('createdAt', { ascending: true })
      .limit(1)
      .single();

    if (userError || !seedUser) {
      console.error('Failed to retrieve seed user:', userError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to retrieve seed user',
          detail: userError?.message ?? 'no data returned',
          code: userError?.code,
        },
        { status: 500 }
      );
    }

    const authId = seedUser.id;
    if (!authId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    const memory = await createMemoryService(result.data, authId);
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
