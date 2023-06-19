'use client';

import { LogOutIcon, UserIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Header = () => {
  const pathname = usePathname();
  const session = useSession();

  return (
    <header className="mb-4">
      <div className="container flex items-center justify-between py-4">
        <Link href="/">Collective</Link>

        {session.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={session.data.user?.image ?? ''} />
                <AvatarFallback>{session.data.user?.name}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{session.data.user?.name}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
