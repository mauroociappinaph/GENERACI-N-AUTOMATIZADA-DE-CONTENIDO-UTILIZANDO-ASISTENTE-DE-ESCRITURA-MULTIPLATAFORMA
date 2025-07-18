'use client';

import { ReactNode, useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { User } from '@/types';

interface MainLayoutProps {
  children: ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

export function MainLayout({ children, user, onLogout }: MainLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar userRole={user?.role} className="hidden md:flex" />

      {/* Mobile Navigation */}
      <MobileNav
        userRole={user?.role}
        isOpen={isMobileNavOpen}
        onClose={closeMobileNav}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} onLogout={onLogout} onMenuClick={toggleMobileNav} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
