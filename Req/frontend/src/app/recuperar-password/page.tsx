'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

// Mock password recovery function - in a real app, this would call an API
const mockRecoverPassword = async (email: string) => {
  // Simulate API call delay
  return new Promise<{ success: boolean }>((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, accept any email
      if (!email.includes('@')) {
        reject(new Error('Correo electrónico inválido'));
      } else {
        resolve({ success: true });
      }
    }, 1000);
  });
};

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!email) {
        throw new Error('Por favor, ingrese su correo electrónico');
      }

      // Call recovery function (mock for now)
      await mockRecoverPassword(email);

      // Show success message
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al procesar la solicitud'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Recuperar contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Ingrese su correo electrónico para recibir instrucciones
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Se han enviado las instrucciones para recuperar su contraseña a{' '}
              {email}. Por favor, revise su bandeja de entrada.
            </div>

            <div className="text-center mt-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Volver a inicio de sesión
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Enviar instrucciones
              </Button>

              <p className="text-center text-sm text-gray-600">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Volver a inicio de sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
