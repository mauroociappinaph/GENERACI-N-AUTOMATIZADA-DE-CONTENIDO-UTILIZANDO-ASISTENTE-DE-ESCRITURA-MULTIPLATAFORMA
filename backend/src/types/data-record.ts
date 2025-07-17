import { z } from 'zod';
import { Prisma } from '@prisma/client';

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

export type CreateDataRecordInput = z.infer<typeof createDataRecordSchema> & {
  data: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue
};

export type UpdateDataRecordInput = z.infer<typeof updateDataRecordSchema> & {
  data?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue
};

export type DataRecordFilters = z.infer<typeof dataRecordFiltersSchema>;

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
