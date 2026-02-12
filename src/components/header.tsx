'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './logout-button';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/protected', label: 'Home' },
    { href: '/map', label: 'Map' },
  ];

  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-8 font-semibold">
          <span>Skolaroid</span>
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
