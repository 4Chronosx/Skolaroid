import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-3xl font-bold">Protected Page</h1>
      <div className="flex flex-col items-start gap-2">
        <h2 className="text-xl font-semibold">Your user details</h2>
        <pre className="max-h-32 overflow-auto rounded border p-3 font-mono text-xs">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
    </div>
  );
}
