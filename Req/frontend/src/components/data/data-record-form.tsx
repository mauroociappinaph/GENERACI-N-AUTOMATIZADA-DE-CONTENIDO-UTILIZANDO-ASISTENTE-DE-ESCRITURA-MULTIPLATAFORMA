'use client';

import { useState, useEffect } from 'react';
import { DataRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService } from '@/lib/data-service';

interface DataRecordFormProps {
  record?: DataRecord;
  onSave: (data: Partial<DataRecord>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormField {
  key: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url';
}

export function DataRecordForm({
  record,
  onSave,
  onCancel,
  isLoading = false,
}: DataRecordFormProps) {
  const [recordTypes, setRecordTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    type: record?.type || '',
    category: record?.metadata?.category || '',
    priority: record?.metadata?.priority || 'medium',
    tags: record?.metadata?.tags?.join(', ') || '',
  });

  const [dataFields, setDataFields] = useState<FormField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load available record types
    const loadRecordTypes = async () => {
      try {
        const response = await dataService.getRecordTypes();
        if (response.success && response.data) {
          setRecordTypes(response.data);
        }
      } catch (error) {
        console.error('Error loading record types:', error);
      }
    };

    loadRecordTypes();

    // Initialize data fields from existing record
    if (record?.data) {
      const fields = Object.entries(record.data).map(([key, value]) => ({
        key,
        value,
        type: inferFieldType(value),
      }));
      setDataFields(fields);
    } else {
      // Start with one empty field
      setDataFields([{ key: '', value: '', type: 'text' }]);
    }
  }, [record]);

  const inferFieldType = (value: any): FormField['type'] => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (value.includes('@')) return 'email';
      if (value.startsWith('http')) return 'url';
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
    }
    return 'text';
  };

  const handleFormDataChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleDataFieldChange = (
    index: number,
    field: keyof FormField,
    value: any
  ) => {
    setDataFields(prev => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], [field]: value };
      return newFields;
    });
  };

  const addDataField = () => {
    setDataFields(prev => [...prev, { key: '', value: '', type: 'text' }]);
  };

  const removeDataField = (index: number) => {
    setDataFields(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de registro es obligatorio';
    }

    // Validate data fields
    dataFields.forEach((field, index) => {
      if (!field.key.trim()) {
        newErrors[`field_${index}_key`] = 'El nombre del campo es obligatorio';
      }
      if (
        field.value === '' ||
        field.value === null ||
        field.value === undefined
      ) {
        newErrors[`field_${index}_value`] = 'El valor del campo es obligatorio';
      }
    });

    // Check for duplicate field keys
    const fieldKeys = dataFields.map(f => f.key.trim()).filter(k => k);
    const duplicateKeys = fieldKeys.filter(
      (key, index) => fieldKeys.indexOf(key) !== index
    );
    if (duplicateKeys.length > 0) {
      duplicateKeys.forEach(key => {
        const index = dataFields.findIndex(f => f.key === key);
        newErrors[`field_${index}_key`] = 'El nombre del campo debe ser único';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert data fields to object
      const dataObject = dataFields.reduce(
        (acc, field) => {
          if (field.key.trim()) {
            let value = field.value;

            // Convert value based on type
            switch (field.type) {
              case 'number':
                value = Number(value);
                break;
              case 'boolean':
                value = Boolean(value);
                break;
              default:
                value = String(value);
            }

            acc[field.key.trim()] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      const recordData: Partial<DataRecord> = {
        type: formData.type,
        data: dataObject,
        metadata: {
          version: record?.metadata?.version || 1,
          category: formData.category || undefined,
          priority: formData.priority as 'low' | 'medium' | 'high',
          tags: formData.tags
            ? formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
            : undefined,
        },
      };

      await onSave(recordData);
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Registro *
            </label>
            {recordTypes.length > 0 ? (
              <select
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={e => handleFormDataChange('type', e.target.value)}
                required
              >
                <option value="">Seleccionar tipo</option>
                {recordTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="Ingrese el tipo de registro"
                value={formData.type}
                onChange={e => handleFormDataChange('type', e.target.value)}
                error={errors.type}
                required
              />
            )}
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <Input
                placeholder="Categoría del registro"
                value={formData.category}
                onChange={e => handleFormDataChange('category', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={e => handleFormDataChange('priority', e.target.value)}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <Input
              placeholder="Etiquetas separadas por comas"
              value={formData.tags}
              onChange={e => handleFormDataChange('tags', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separe múltiples etiquetas con comas
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Datos del Registro</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDataField}
            >
              Agregar Campo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataFields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Campo *
                </label>
                <Input
                  placeholder="nombre_campo"
                  value={field.key}
                  onChange={e =>
                    handleDataFieldChange(index, 'key', e.target.value)
                  }
                  error={errors[`field_${index}_key`]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field.type}
                  onChange={e =>
                    handleDataFieldChange(
                      index,
                      'type',
                      e.target.value as FormField['type']
                    )
                  }
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="boolean">Booleano</option>
                  <option value="date">Fecha</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                {field.type === 'boolean' ? (
                  <select
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value.toString()}
                    onChange={e =>
                      handleDataFieldChange(
                        index,
                        'value',
                        e.target.value === 'true'
                      )
                    }
                  >
                    <option value="true">Verdadero</option>
                    <option value="false">Falso</option>
                  </select>
                ) : (
                  <Input
                    type={
                      field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : field.type
                    }
                    placeholder="Valor del campo"
                    value={field.value}
                    onChange={e =>
                      handleDataFieldChange(index, 'value', e.target.value)
                    }
                    error={errors[`field_${index}_value`]}
                  />
                )}
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDataField(index)}
                  disabled={dataFields.length === 1}
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}

          {dataFields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No hay campos de datos definidos</p>
              <Button
                type="button"
                variant="outline"
                onClick={addDataField}
                className="mt-2"
              >
                Agregar Primer Campo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {record ? 'Actualizar' : 'Crear'} Registro
        </Button>
      </div>
    </form>
  );
}
