'use client';

import { Loader2Icon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { type FC, type FormEventHandler, useCallback, useState } from 'react';
import { toast, Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { getWhitelistStatus } from './actions';

const LoginPage: FC<{}> = () => {
  const searchParams = useSearchParams();

  const [isLoading, setLoading] = useState(false);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      setLoading(true);

      const formData = new FormData(event.currentTarget);

      const email = formData.get('email');
      if (!email || typeof email !== 'string') {
        toast('Please enter a valid email address');
        return;
      }

      const isWhitelisted = await getWhitelistStatus(email);
      if (!isWhitelisted) {
        setLoading(false);
        toast(
          'You are currently not whitelisted. Please join the waitlist and we will reach out to you shortly!'
        );
        return;
      }

      try {
        await signIn('email', {
          email,
          callbackUrl: searchParams.get('returnUrl') ?? undefined,
        });
      } catch (error) {
        setLoading(false);
      }
    },
    [searchParams]
  );

  return (
    <div className="my-16 flex flex-col items-center text-center">
      <h1 className="my-4 text-xl">Login</h1>

      <Card className="max-w-sm p-4">
        <form onSubmit={handleSubmit}>
          <Input
            name="email"
            placeholder="you@example.com"
            type="email"
            required
          />
          <Button type="submit" size="sm" className="mt-4" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Card>

      {/* TODO Move toaster */}
      <Toaster />
    </div>
  );
};

export default LoginPage;
