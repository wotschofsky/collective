'use client';

import clsx from 'clsx';
import { GithubIcon, LogOutIcon, UserPlusIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { EB_Garamond } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FormEventHandler, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: '600' });

const Header = () => {
  const pathname = usePathname();
  const session = useSession();

  const [inviteOpen, setInviteOpen] = useState(false);
  const handleInvite = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      setInviteOpen(false);

      try {
        const response = await fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.get('email'),
          }),
        });

        if (!response.ok) {
          throw new Error('An error occurred!');
        }

        alert('User added to whitelist!');
      } catch (error) {
        alert('An error occurred!');
      }
    },
    []
  );

  return (
    <header className="mb-4">
      <div className="container flex items-center justify-between py-8">
        <Link
          href="/"
          className={clsx(ebGaramond.className, 'text-xl font-semibold')}
        >
          Collective
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <a
              href="https://github.com/feliskio/collective"
              target="_blank"
              rel="noopener"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
          </Button>

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
                  <span>{session.data.user?.name}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  <span>Invite User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Invite another user to allow them to join Collective!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="mb-4 grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="them@example.com"
                  className="col-span-3"
                  required
                  type="email"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
