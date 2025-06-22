'use client';

import { Dog, Home, User } from 'lucide-react';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: Home },
  { href: '/pet', icon: Dog },
  { href: '/user', icon: User },
];

export default function NavBar() {
  const pathName = usePathname();

  return (
    <nav className="fixed w-full flex justify-center bottom-0 bg-background z-50">
      <div className="px-1 py-4 w-full gap-4 flex justify-evenly border-t-1 border-t-border">
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
