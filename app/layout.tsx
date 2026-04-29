import type { Metadata } from 'next';
import './globals.css'; // Global styles
import { ToastProvider } from '@/lib/contexts/ToastContext';

export const metadata: Metadata = {
  title: 'Epic Frontier',
  description: 'RPG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
