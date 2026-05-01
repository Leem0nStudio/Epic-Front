import type { Metadata } from 'next';
import './globals.css'; // Global styles
import { ToastProvider } from '@/lib/contexts/ToastContext';

export const metadata: Metadata = {
  title: 'Epic Frontier',
  description: 'RPG',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
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
