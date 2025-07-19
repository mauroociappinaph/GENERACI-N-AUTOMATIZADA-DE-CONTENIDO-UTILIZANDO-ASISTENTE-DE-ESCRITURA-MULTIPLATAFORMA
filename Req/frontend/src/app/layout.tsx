import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { cookies } from 'next/headers';
import { AuthInitializer } from '@/components/auth/auth-initializer';

export const metadata: Metadata = {
  title: 'Sistema de Gestión #040',
  description: 'Sistema integral de gestión de procesos y datos',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  let initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-storage');
    // Debug logging removed for production

    if (authCookie && authCookie.value) {
      const parsedCookie = JSON.parse(authCookie.value);
      // Debug logging removed for production
      initialState = {
        user: parsedCookie.state?.user || null,
        token: parsedCookie.state?.token || null,
        isAuthenticated: parsedCookie.state?.isAuthenticated || false,
      };
    }
  } catch (error) {
    // Handle error silently or use proper logging service
    // console.error('Error parsing auth cookie in RootLayout:', error);
  }

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased">
        <AuthInitializer
          user={initialState.user}
          token={initialState.token}
          isAuthenticated={initialState.isAuthenticated}
        />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
