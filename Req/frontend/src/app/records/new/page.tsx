'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { DataRecordForm } from '@/components/data/data-record-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function NewRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<DataRecord>) => {
    try {
      setLoading(true);
      const response = await dataService.createRecord(data);

      if (response.success) {
        toast({
          title: 'Registro creado',
          description: 'El registro fue creado exitosamente.',
        });
        router.push('/records');
      } else {
        toast({
          title: 'Error al crear registro',
          description: response.error?.message || 'Error desconocido.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error de conexión',
        description: err instanceof Error ? err.message : 'Error desconocido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/records');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Registro</h1>
          <p className="text-gray-600 mt-1">
            Complete el formulario para crear un nuevo registro
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <DataRecordForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="Crear Registro"
          />
        </CardContent>
      </Card>
    </div>
  );
}
