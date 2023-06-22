'use client';

import clsx from 'clsx';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { EB_Garamond } from 'next/font/google';
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

const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: '600' });

const Header = () => {
  const pathname = usePathname();
  const session = useSession();

  return (
    <header className="mb-4">
      <div className="container flex items-center justify-between py-4">
        <Link
          href="/"
          className={clsx(ebGaramond.className, 'text-xl font-semibold')}
        >
          Collective
        </Link>

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
          <div className="flex gap-2">
            <Button asChild>
              <a
                href="https://whfbt68b5e1.typeform.com/to/jpHpDMjC"
                target="_blank"
              >
                Join Waitlist
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>
                Login
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
