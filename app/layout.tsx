import { Inter } from 'next/font/google';

import Header from '@/components/Header';
import Providers from '@/components/Providers';
import { Button } from '@/components/ui/button';
import '@/styles/globals.css';
import '@/styles/prosemirror.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Collective',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="container">{children}</main>
        </body>
      </html>
    </Providers>
  );
}
