import { Inter } from 'next/font/google';

import Header from '@/components/Header';
import Providers from '@/components/Providers';

import './globals.css';

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
          <main className="p-4 md:px-8">{children}</main>
        </body>
      </html>
    </Providers>
  );
}
