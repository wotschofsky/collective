'use client';

import { LogOutIcon, UserIcon } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

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
  const session = useSession();

  return (
    <header className="w-full p-4 md:px-8">
      <div className="flex flex-col items-center justify-between pb-4 sm:flex-row">
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
          <Button onClick={() => signIn('twitter')} variant="outline">
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
