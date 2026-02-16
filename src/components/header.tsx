'use client';

import Link from 'next/link';
import { ClientNav } from './client-nav';
import { useUserAuth } from '@/hooks/useUserAuth';
import { AccountMenu } from './account-menu';
import { Button } from '@/components/ui/button';

export function Header() {
  const { isAuthenticated, loading } = useUserAuth();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 w-full justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="relative flex w-full items-center p-3 px-5 text-sm">
        {/* Logo - Left */}
        <div className="font-semibold">
          <Link href="/" className="text-lg hover:text-foreground/80">
            skolaroid
          </Link>
        </div>

        {/* Nav - Centered */}
        <div className="absolute left-1/2 -translate-x-1/2 font-semibold">
          <ClientNav />
        </div>

        {/* Auth - Right */}
        <div className="ml-auto flex items-center gap-3">
          {!loading && isAuthenticated ? (
            <AccountMenu />
          ) : (
            <>
              <Button variant="ghost" asChild className="text-xs">
                <Link href="/">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-skolaroid-blue text-xs hover:bg-skolaroid-blue/90"
              >
                <Link href="/">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
