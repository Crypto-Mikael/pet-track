'use client';

import { Home } from 'lucide-react';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: Home },
  { href: '/pet', icon: Home },
];

export default function NavBar() {
  const pathName = usePathname();

  return (
    <nav className="fixed w-full flex justify-center bottom-2">
      <div className="px-1 gap-4 py-1 flex justify-center bg-primary rounded-full">
        {navItems.map(({ href, icon: Icon }) => (
          <Button
            key={href}
            className="rounded-full"
            variant={pathName === href ? 'secondary' : 'default'}
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
