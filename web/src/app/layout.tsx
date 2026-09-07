import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'CRM',
  description: 'Painel do CRM — leads e operação',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
