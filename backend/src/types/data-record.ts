import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Esquema base para la creación de registros de datos
export const createDataRecordSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido'),
  data: z.any(), // Hacer que 'data' sea requerido
  metadata: z.any().optional(),
});

// Esquema para la actualización de registros de datos
export const updateDataRecordSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido').optional(),
  data: z.any().optional(),
  metadata: z.any().optional(),
});

export type CreateDataRecordInput = z.infer<typeof createDataRecordSchema> & { data: Prisma.InputJsonValue; metadata?: Prisma.InputJsonValue };
export type UpdateDataRecordInput = z.infer<typeof updateDataRecordSchema> & { data?: Prisma.InputJsonValue; metadata?: Prisma.InputJsonValue };
