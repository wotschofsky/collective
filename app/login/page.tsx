'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { type FC, type FormEventHandler, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const LoginPage: FC<{}> = () => {
  const searchParams = useSearchParams();

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const email = formData.get('email');
      if (!email || typeof email !== 'string') {
        return;
      }

      signIn('email', {
        email,
        callbackUrl: searchParams.get('returnUrl') ?? undefined,
      });
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
          <Button type="submit" size="sm" className="mt-4">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
