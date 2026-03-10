import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Handles the Supabase OAuth PKCE callback.
 *
 * After Google OAuth, Supabase redirects here with a `code` query param.
 * This route exchanges the code for a session (server-side), sets the auth
 * cookies, then redirects to `/`. The proxy will then enforce onboarding.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to home — the proxy will handle onboarding enforcement
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Code missing or exchange failed
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
