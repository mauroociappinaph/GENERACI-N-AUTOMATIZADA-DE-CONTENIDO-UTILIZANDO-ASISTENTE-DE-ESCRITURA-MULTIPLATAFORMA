'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavigationItem, filterNavigationByRole, mainNavigation } from '@/lib/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';

interface MobileNavProps {
  userRole?: UserRole | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ userRole, isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const filteredNavigation = filterNavigationByRole(mainNavigation, userRole);

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (href: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-gray-900/80 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-gray-900 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Sistema de Gestión</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const isParentActive = pathname.startsWith(item.href + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections[item.href] || isActive || isParentActive;

            return (
              <div key={item.href} className="space-y-1">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex flex-1 items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                      (isActive || isParentActive)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                    onClick={() => {
                      if (!hasChildren) {
                        onClose();
                      }
                    }}
                  >
                    {item.icon && (
                      <span className="mr-3 h-5 w-5 text-gray-400">
                        <NavIcon name={item.icon} />
                      </span>
                    )}
                    <span className="flex-1">{item.name}</span>
                  </Link>

                  {hasChildren && (
                    <button
                      onClick={() => toggleSection(item.href)}
                      className="p-3 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn("h-4 w-4 transition-transform", isExpanded ? "transform rotate-180" : "")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 space-y-1 border-l border-gray-700 pl-2">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                          pathname === child.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        )}
                        title={child.description}
                        onClick={onClose}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">© 2025 Sistema de Gestión</p>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  // Simple icon mapping - in a real app, you might use a proper icon library
  const iconMap: Record<string, JSX.Element> = {
    dashboard: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    database: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    chart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };

  return iconMap[name] || null;
}
