import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { LanguageProvider } from '@/lib/i18n';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manoj Vaishnav Hotel & Mishthan Bhandar',
  description:
    'A modern point-of-sale system for restaurant billing, order management, and payment tracking. Built for speed and simplicity.',
  keywords: ['restaurant', 'POS', 'billing', 'order management', 'payments'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
