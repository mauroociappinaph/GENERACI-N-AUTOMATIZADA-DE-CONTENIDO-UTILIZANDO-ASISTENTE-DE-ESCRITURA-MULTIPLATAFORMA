'use client';

import { useState } from 'react';
import { DataRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConflictResolutionProps {
  currentRecord: DataRecord;
  conflictingRecord: DataRecord;
  onResolve: (
    resolution: 'current' | 'incoming' | 'merge',
    mergedData?: Partial<DataRecord>
  ) => void;
  onCancel: () => void;
}

interface FieldConflict {
  field: string;
  currentValue: any;
  incomingValue: any;
  resolution: 'current' | 'incoming' | 'custom';
  customValue?: any;
}

export function ConflictResolution({
  currentRecord,
  conflictingRecord,
  onResolve,
  onCancel,
}: ConflictResolutionProps) {
  const [conflicts, setConflicts] = useState<FieldConflict[]>(() => {
    const fieldConflicts: FieldConflict[] = [];

    // Compare data fields
    const allFields = new Set([
      ...Object.keys(currentRecord.data),
      ...Object.keys(conflictingRecord.data),
    ]);

    allFields.forEach(field => {
      const currentValue = currentRecord.data[field];
      const incomingValue = conflictingRecord.data[field];

      if (JSON.stringify(currentValue) !== JSON.stringify(incomingValue)) {
        fieldConflicts.push({
          field,
          currentValue,
          incomingValue,
          resolution: 'current',
        });
      }
    });

    // Compare metadata
    if (
      currentRecord.metadata?.category !== conflictingRecord.metadata?.category
    ) {
      fieldConflicts.push({
        field: 'metadata.category',
        currentValue: currentRecord.metadata?.category,
        incomingValue: conflictingRecord.metadata?.category,
        resolution: 'current',
      });
    }

    if (
      currentRecord.metadata?.priority !== conflictingRecord.metadata?.priority
    ) {
      fieldConflicts.push({
        field: 'metadata.priority',
        currentValue: currentRecord.metadata?.priority,
        incomingValue: conflictingRecord.metadata?.priority,
        resolution: 'current',
      });
    }

    const currentTags = currentRecord.metadata?.tags?.sort().join(',') || '';
    const incomingTags =
      conflictingRecord.metadata?.tags?.sort().join(',') || '';
    if (currentTags !== incomingTags) {
      fieldConflicts.push({
        field: 'metadata.tags',
        currentValue: currentRecord.metadata?.tags,
        incomingValue: conflictingRecord.metadata?.tags,
        resolution: 'current',
      });
    }

    return fieldConflicts;
  });

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'Sin valor';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const handleFieldResolution = (
    index: number,
    resolution: 'current' | 'incoming' | 'custom',
    customValue?: any
  ) => {
    setConflicts(prev => {
      const newConflicts = [...prev];
      newConflicts[index] = {
        ...newConflicts[index],
        resolution,
        customValue,
      };
      return newConflicts;
    });
  };

  const handleResolveAll = (type: 'current' | 'incoming') => {
    if (type === 'current') {
      onResolve('current');
    } else if (type === 'incoming') {
      onResolve('incoming');
    }
  };

  const handleMergeResolve = () => {
    const mergedData: Partial<DataRecord> = {
      data: { ...currentRecord.data },
      metadata: { ...currentRecord.metadata },
    };

    conflicts.forEach(conflict => {
      const { field, resolution, currentValue, incomingValue, customValue } =
        conflict;

      let resolvedValue;
      switch (resolution) {
        case 'current':
          resolvedValue = currentValue;
          break;
        case 'incoming':
          resolvedValue = incomingValue;
          break;
        case 'custom':
          resolvedValue = customValue;
          break;
      }

      if (field.startsWith('metadata.')) {
        const metadataField = field.replace('metadata.', '');
        if (!mergedData.metadata) mergedData.metadata = { version: 1 };
        (mergedData.metadata as any)[metadataField] = resolvedValue;
      } else {
        if (!mergedData.data) mergedData.data = {};
        mergedData.data[field] = resolvedValue;
      }
    });

    onResolve('merge', mergedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">
            Conflicto de Edición Detectado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">
              Este registro ha sido modificado por otro usuario mientras usted
              lo editaba. Por favor, revise los cambios y seleccione cómo
              resolver los conflictos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Su Versión</h3>
              <p className="text-sm text-blue-700">
                Última actualización: {formatDate(currentRecord.updatedAt)}
              </p>
              <p className="text-sm text-blue-700">
                Por: {currentRecord.updatedBy}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Versión del Servidor
              </h3>
              <p className="text-sm text-green-700">
                Última actualización: {formatDate(conflictingRecord.updatedAt)}
              </p>
              <p className="text-sm text-green-700">
                Por: {conflictingRecord.updatedBy}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              onClick={() => handleResolveAll('current')}
            >
              Mantener Mi Versión
            </Button>
            <Button
              variant="outline"
              onClick={() => handleResolveAll('incoming')}
            >
              Usar Versión del Servidor
            </Button>
            <Button onClick={handleMergeResolve}>Resolver Manualmente</Button>
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conflictos Detectados ({conflicts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Campo: {conflict.field}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`conflict-${index}`}
                          checked={conflict.resolution === 'current'}
                          onChange={() =>
                            handleFieldResolution(index, 'current')
                          }
                          className="text-blue-600"
                        />
                        <span className="font-medium text-blue-800">
                          Su Valor
                        </span>
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <pre className="text-sm text-blue-900 whitespace-pre-wrap">
                          {renderValue(conflict.currentValue)}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`conflict-${index}`}
                          checked={conflict.resolution === 'incoming'}
                          onChange={() =>
                            handleFieldResolution(index, 'incoming')
                          }
                          className="text-green-600"
                        />
                        <span className="font-medium text-green-800">
                          Valor del Servidor
                        </span>
                      </label>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <pre className="text-sm text-green-900 whitespace-pre-wrap">
                          {renderValue(conflict.incomingValue)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        checked={conflict.resolution === 'custom'}
                        onChange={() =>
                          handleFieldResolution(
                            index,
                            'custom',
                            conflict.customValue || ''
                          )
                        }
                        className="text-purple-600"
                      />
                      <span className="font-medium text-purple-800">
                        Valor Personalizado
                      </span>
                    </label>
                    {conflict.resolution === 'custom' && (
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <textarea
                          className="w-full h-20 p-2 border border-purple-300 rounded text-sm"
                          placeholder="Ingrese un valor personalizado..."
                          value={conflict.customValue || ''}
                          onChange={e =>
                            handleFieldResolution(
                              index,
                              'custom',
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
