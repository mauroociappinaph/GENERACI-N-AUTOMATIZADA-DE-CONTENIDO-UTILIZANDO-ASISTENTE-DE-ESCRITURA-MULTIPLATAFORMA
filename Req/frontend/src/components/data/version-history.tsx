'use client';

import { useState } from 'react';
import { DataRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VersionHistoryProps {
  currentRecord: DataRecord;
  history: DataRecord[];
  onRestore?: (version: DataRecord) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
}

export function VersionHistory({
  currentRecord,
  history,
  onRestore,
  onClose,
  isLoading = false,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<DataRecord | null>(
    null
  );
  const [showDiff, setShowDiff] = useState(false);

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

  const formatFullDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
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

  const calculateDiff = (
    oldRecord: DataRecord,
    newRecord: DataRecord
  ): FieldDiff[] => {
    const diffs: FieldDiff[] = [];

    // Compare data fields
    const allDataFields = new Set([
      ...Object.keys(oldRecord.data || {}),
      ...Object.keys(newRecord.data || {}),
    ]);

    allDataFields.forEach(field => {
      const oldValue = oldRecord.data?.[field];
      const newValue = newRecord.data?.[field];

      if (oldValue === undefined && newValue !== undefined) {
        diffs.push({
          field: `data.${field}`,
          oldValue,
          newValue,
          type: 'added',
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        diffs.push({
          field: `data.${field}`,
          oldValue,
          newValue,
          type: 'removed',
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diffs.push({
          field: `data.${field}`,
          oldValue,
          newValue,
          type: 'modified',
        });
      }
    });

    // Compare metadata
    const oldMetadata = oldRecord.metadata || {};
    const newMetadata = newRecord.metadata || {};

    if (oldMetadata.category !== newMetadata.category) {
      diffs.push({
        field: 'metadata.category',
        oldValue: oldMetadata.category,
        newValue: newMetadata.category,
        type: oldMetadata.category ? 'modified' : 'added',
      });
    }

    if (oldMetadata.priority !== newMetadata.priority) {
      diffs.push({
        field: 'metadata.priority',
        oldValue: oldMetadata.priority,
        newValue: newMetadata.priority,
        type: 'modified',
      });
    }

    const oldTags = oldMetadata.tags?.sort().join(',') || '';
    const newTags = newMetadata.tags?.sort().join(',') || '';
    if (oldTags !== newTags) {
      diffs.push({
        field: 'metadata.tags',
        oldValue: oldMetadata.tags,
        newValue: newMetadata.tags,
        type: oldMetadata.tags?.length ? 'modified' : 'added',
      });
    }

    return diffs;
  };

  const handleVersionSelect = (version: DataRecord) => {
    setSelectedVersion(version);
    setShowDiff(true);
  };

  const handleRestore = (version: DataRecord) => {
    if (
      onRestore &&
      confirm(
        '¿Está seguro de que desea restaurar esta versión? Los cambios actuales se perderán.'
      )
    ) {
      onRestore(version);
    }
  };

  const getDiffTypeColor = (type: FieldDiff['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'removed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'modified':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDiffTypeIcon = (type: FieldDiff['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return '';
    }
  };

  const allVersions = [currentRecord, ...history].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Historial de Versiones</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allVersions.map((version, index) => {
              const isCurrentVersion = index === 0;
              const previousVersion = allVersions[index + 1];
              const diffs = previousVersion
                ? calculateDiff(previousVersion, version)
                : [];

              return (
                <div
                  key={version.id + version.updatedAt}
                  className={`border rounded-lg p-4 ${
                    isCurrentVersion
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          Versión {version.metadata?.version || index + 1}
                          {isCurrentVersion && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Actual
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatFullDate(version.updatedAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Por: {version.updatedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(version.updatedAt)}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {!isCurrentVersion && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVersionSelect(version)}
                          >
                            Ver Cambios
                          </Button>
                          {onRestore && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(version)}
                              disabled={isLoading}
                            >
                              Restaurar
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {diffs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Cambios ({diffs.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {diffs.slice(0, 5).map((diff, diffIndex) => (
                          <span
                            key={diffIndex}
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getDiffTypeColor(
                              diff.type
                            )}`}
                          >
                            {getDiffTypeIcon(diff.type)} {diff.field}
                          </span>
                        ))}
                        {diffs.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{diffs.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showDiff && selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Cambios en Versión {selectedVersion.metadata?.version}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiff(false)}
              >
                Ocultar Cambios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const currentIndex = allVersions.findIndex(
                v =>
                  v.id === selectedVersion.id &&
                  v.updatedAt === selectedVersion.updatedAt
              );
              const previousVersion = allVersions[currentIndex + 1];

              if (!previousVersion) {
                return (
                  <p className="text-gray-500">
                    Esta es la primera versión del registro.
                  </p>
                );
              }

              const diffs = calculateDiff(previousVersion, selectedVersion);

              if (diffs.length === 0) {
                return (
                  <p className="text-gray-500">
                    No se detectaron cambios en esta versión.
                  </p>
                );
              }

              return (
                <div className="space-y-4">
                  {diffs.map((diff, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getDiffTypeColor(diff.type)}`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-mono text-sm font-bold">
                          {getDiffTypeIcon(diff.type)}
                        </span>
                        <h4 className="font-semibold">{diff.field}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {diff.type === 'added'
                            ? 'Agregado'
                            : diff.type === 'removed'
                              ? 'Eliminado'
                              : 'Modificado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {diff.type !== 'added' && (
                          <div>
                            <p className="text-xs font-medium mb-1">
                              Valor Anterior:
                            </p>
                            <div className="bg-white bg-opacity-50 rounded p-2">
                              <pre className="text-sm whitespace-pre-wrap">
                                {renderValue(diff.oldValue)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {diff.type !== 'removed' && (
                          <div>
                            <p className="text-xs font-medium mb-1">
                              Valor Nuevo:
                            </p>
                            <div className="bg-white bg-opacity-50 rounded p-2">
                              <pre className="text-sm whitespace-pre-wrap">
                                {renderValue(diff.newValue)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
