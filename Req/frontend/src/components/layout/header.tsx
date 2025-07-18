// Button import removed as it's not used
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { NotificationButton } from '@/components/notifications/notification-button';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  className?: string;
  user?: User | null;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export function Header({
  className,
  user,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header
      className={cn(
        'bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center md:hidden">
        {/* Mobile menu button */}
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex justify-end">
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationButton />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              type="button"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                {user
                  ? user.firstName.charAt(0) + user.lastName.charAt(0)
                  : 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
              </span>
              <svg
                className="hidden md:block h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rol: {user.role}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      Mi perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      Configuración
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout?.();
                      }}
                      role="menuitem"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
