'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClientNav } from './client-nav';

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className="flex h-16 w-full justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="flex w-full items-center justify-between p-3 px-5 text-sm">
        {!isHomePage && (
          <div className="flex items-center gap-8 font-semibold">
            <Link href="/" className="text-lg hover:text-foreground/80">
              Skolaroid
            </Link>
            <ClientNav />
          </div>
        )}

        {isHomePage && <div />}

        {/* Auth Buttons - Navigate to home for auth */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-xs">
            <Link href="/">Log In</Link>
          </Button>
          <Button
            asChild
            className="bg-skolaroid-blue text-xs hover:bg-skolaroid-blue/90"
          >
            <Link href="/">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
