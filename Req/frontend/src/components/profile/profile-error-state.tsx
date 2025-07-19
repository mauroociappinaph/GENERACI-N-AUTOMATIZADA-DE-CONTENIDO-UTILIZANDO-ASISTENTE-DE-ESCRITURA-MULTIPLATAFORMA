'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileErrorStateProps {
  message?: string;
}

export function ProfileErrorState({
  message = "No se pudo cargar el perfil del usuario."
}: ProfileErrorStateProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600">{message}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}
