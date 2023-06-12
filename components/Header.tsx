'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Header = () => {
  const session = useSession();

  return (
    <header className="w-full p-4 md:px-8">
      <div className="flex flex-col items-center justify-between pb-4 sm:flex-row">
        <Link href="/">Collective</Link>

        {session.data ? (
          <Avatar>
            <AvatarImage src={session.data.user?.image ?? ''} />
            <AvatarFallback>{session.data.user?.name}</AvatarFallback>
          </Avatar>
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
