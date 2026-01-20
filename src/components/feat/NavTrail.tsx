'use client';
import Link from 'next/link';
import { Dog, Home, PawPrint, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: Home, name: 'Home' },
  { href: '/pet', icon: PawPrint, name: 'Animals' },
  { href: '/settings', icon: Settings, name: 'Settings' },
  // { href: '/shops', icon: Store },
  // { href: '/user', icon: User, name: 'User' },
  // { href: '/news', icon: Bell },
];

export default function NavTrail() {
  const pathName = usePathname();
    return <>
    <nav className="flex flex-col items-center gap-4 sticky top-0 max-sm:hidden flex-1 max-w-24 h-dvh bg-background/90 border-border border-r-2 z-50">
      <div className='flex flex-col justify-center size-14 bg-accent items-center rounded-2xl mt-4 mb-4'>
        <Dog className="scale-150 text-accent-foreground" />
      </div>
      {
        navItems.map(({ href, icon: Icon, name }) => (
          <div key={href} className='items-center gap-1 font-light'>          
            <Button
              key={href}
              className="rounded-full w-14"
              variant={pathName === href ? 'default' : 'ghost'}
              size="icon"
              asChild
            >
              <Link className="px-6" href={href}>
                <Icon className={`${pathName === href ? 'text-primary-foreground' : 'text-foreground'} scale-150`} />
              </Link>
            </Button>
            <p className='font-medium text-center text-foreground'>{name}</p>

          </div>
      ))}

    </nav>
  </>;
}