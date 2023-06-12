import { Inter } from 'next/font/google';

import Header from '@/components/Header';
import Providers from '@/components/Providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
          <main className="p-24">{children}</main>
        </body>
      </html>
    </Providers>
  );
}
