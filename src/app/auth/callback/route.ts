import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If the user already exists in the DB, skip onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (existingUser) {
          return NextResponse.redirect(`${origin}/`);
        }
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
