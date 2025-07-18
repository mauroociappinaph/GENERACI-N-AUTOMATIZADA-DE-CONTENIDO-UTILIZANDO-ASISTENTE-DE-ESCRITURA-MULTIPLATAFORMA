'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dataService } from '@/lib/data-service';

interface DataFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

export function DataFilters({
  onFilterChange,
  currentFilters,
}: DataFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recordTypes, setRecordTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: currentFilters.type || '',
    category: currentFilters.category || '',
    priority: currentFilters.priority || '',
    createdBy: currentFilters.createdBy || '',
    dateFrom: currentFilters.dateFrom || '',
    dateTo: currentFilters.dateTo || '',
    tags: currentFilters.tags || [],
  });

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
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Remove empty filters
    const cleanFilters = Object.entries(newFilters).reduce(
      (acc, [k, v]) => {
        if (
          v !== '' &&
          v !== null &&
          v !== undefined &&
          (!Array.isArray(v) || v.length > 0)
        ) {
          acc[k] = v;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    onFilterChange(cleanFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      type: '',
      category: '',
      priority: '',
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      tags: [],
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    value =>
      value !== '' &&
      value !== null &&
      value !== undefined &&
      (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Registro
            </label>
            <select
              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {recordTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <Input
              placeholder="Filtrar por categoría"
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.priority}
              onChange={e => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creado por (ID de usuario)
            </label>
            <Input
              placeholder="ID del usuario"
              value={filters.createdBy}
              onChange={e => handleFilterChange('createdBy', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {filters.type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tipo: {filters.type}
              <button
                onClick={() => handleFilterChange('type', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Categoría: {filters.category}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Prioridad: {filters.priority}
              <button
                onClick={() => handleFilterChange('priority', '')}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Desde: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Hasta: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
