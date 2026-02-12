import Link from 'next/link';
import { AuthButton } from './auth-button';
import { ClientNav } from './client-nav';
import { Suspense } from 'react';

export function PublicHeader() {
  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-8 font-semibold">
          <Link href="/" className="hover:text-foreground/80">
            Skolaroid
          </Link>
          <ClientNav />
        </div>
        <Suspense
          fallback={
            <div className="h-9 w-32 animate-pulse rounded bg-foreground/10" />
          }
        >
          <AuthButton />
        </Suspense>
      </div>
    </nav>
  );
}
