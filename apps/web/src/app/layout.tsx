import type { Metadata } from 'next';
import { Sora, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AppNav } from '@/components/AppNav';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const mono = IBM_Plex_Mono({ weight: ['400', '600'], subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SQL Tutor 2.0',
  description: 'Learn SQL by doing — AI optional',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${mono.variable}`}>
      <body className="font-sans min-h-screen console-ambient-bg flex flex-col">
        <AppNav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
