'use client';

import { SessionProvider } from 'next-auth/react';
import type { FC, ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

const Providers: FC<ProvidersProps> = ({ children }) => (
  <SessionProvider>{children}</SessionProvider>
);

export default Providers;
