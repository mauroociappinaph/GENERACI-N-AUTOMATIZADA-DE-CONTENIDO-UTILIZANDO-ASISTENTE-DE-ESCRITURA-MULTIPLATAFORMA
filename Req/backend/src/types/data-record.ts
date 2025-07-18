import { z } from 'zod';
import { Prisma, DataRecord as PrismaDataRecord } from '@prisma/client';

// Extended DataRecord type to include version field
export interface DataRecord extends PrismaDataRecord {
  version: number;
}

// Esquema base para la creación de registros de datos
export const createDataRecordSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido'),
  data: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Esquema para la actualización de registros de datos
export const updateDataRecordSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido').optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Esquema para filtros de búsqueda
export const dataRecordFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z.string().optional(),
  createdBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  dataFilters: z.record(z.string(), z.unknown()).optional(),
});

// Esquema para búsqueda avanzada
export const advancedSearchSchema = z.object({
  criteria: z.object({
    searchTerms: z.array(z.string()).optional(),
    dataFields: z.record(z.string(), z.unknown()).optional(),
    dateRange: z.object({
      from: z.string().optional().transform(val => val ? new Date(val) : undefined),
      to: z.string().optional().transform(val => val ? new Date(val) : undefined),
    }).optional(),
    types: z.array(z.string()).optional(),
    exactMatch: z.boolean().default(false),
  }),
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
  sorting: z.object({
    field: z.string().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Esquema para filtros dinámicos
export const dynamicFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in']),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
  ]),
});

export type CreateDataRecordInput = z.infer<typeof createDataRecordSchema> & {
  data: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue
};

export type UpdateDataRecordInput = z.infer<typeof updateDataRecordSchema> & {
  data?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue
};

export type DataRecordFilters = z.infer<typeof dataRecordFiltersSchema>;

export type AdvancedSearchParams = z.infer<typeof advancedSearchSchema>;

export type DynamicFilter = z.infer<typeof dynamicFilterSchema>;

// Tipos para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
