'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { DataRecordForm } from '@/components/data/data-record-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewDataRecordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: Partial<DataRecord>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.createRecord(data);

      if (response.success) {
        // Redirect to the data list page
        router.push('/data');
      } else {
        setError(response.error?.message || 'Error al crear el registro');
      }
    } catch (err) {
      setError('Error de conexión al crear el registro');
      console.error('Error creating record:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/data');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Crear Nuevo Registro
        </h1>
        <p className="text-gray-600 mt-1">
          Complete la información para crear un nuevo registro de datos
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <DataRecordForm
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
