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
          <aside className="mb-8 flex justify-center bg-gray-200 px-4 py-12">
            <Button asChild>
              <a
                href="https://whfbt68b5e1.typeform.com/to/jpHpDMjC"
                target="_blank"
              >
                Join Waitlist
              </a>
            </Button>
          </aside>
          <main className="container">{children}</main>
        </body>
      </html>
    </Providers>
  );
}
