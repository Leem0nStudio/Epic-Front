import type {Metadata} from 'next';
import './globals.css';
import { NotificationProvider } from '@/components/ui/NotificationOverlay';

export const metadata: Metadata = {
  title: 'Project: Etherea',
  description: 'A High-Fidelity RPG Experience',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
