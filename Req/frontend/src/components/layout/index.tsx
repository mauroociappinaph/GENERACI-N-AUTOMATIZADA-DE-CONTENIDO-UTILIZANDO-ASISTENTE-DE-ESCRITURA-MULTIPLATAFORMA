import { Header } from './header';
import { Sidebar } from './sidebar';
import { User } from '@/types';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

export function MainLayout({ children, user, onLogout }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={user?.role} className="hidden md:block" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
