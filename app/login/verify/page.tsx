import { type FC } from 'react';

import { Card } from '@/components/ui/card';

const VerifyInfoPage: FC<{}> = () => (
  <div className="my-16 flex flex-col items-center text-center">
    <h1 className="my-4 text-xl">Login</h1>

    <Card className="max-w-sm p-4">
      <p className="font-semibold">Please check your email!</p>
      <p className="mt-4">
        A sign in link has been sent to your email address.
      </p>
    </Card>
  </div>
);

export default VerifyInfoPage;
