'use client';

import { Home, PawPrint, User } from 'lucide-react';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/pet', icon: PawPrint },
  { href: '/', icon: Home },
  // { href: '/shops', icon: Store },
  { href: '/user', icon: User },
  // { href: '/news', icon: Bell },
];

export default function NavBar({ className }: { className?: string }) {
  const pathName = usePathname();

  return (
    <nav className={`sm:hidden sticky w-full flex justify-around bottom-0 bg-background z-50${className ? ` ${className}` : ''}`}>
      <div className="px-1 py-4 w-full gap-4 flex justify-around border-t-1 border-t-border">
        {navItems.map(({ href, icon: Icon }) => (
          <Button
            key={href}
            className="rounded-full"
            variant={pathName === href ? 'default' : 'ghost'}
            size="icon"
            asChild
          >
            <Link className="px-6" href={href}>
              <Icon className="scale-150" />
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
