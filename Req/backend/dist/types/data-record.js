"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicFilterSchema = exports.advancedSearchSchema = exports.dataRecordFiltersSchema = exports.updateDataRecordSchema = exports.createDataRecordSchema = void 0;
const zod_1 = require("zod");
// Esquema base para la creación de registros de datos
exports.createDataRecordSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, 'El tipo es requerido'),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// Esquema para la actualización de registros de datos
exports.updateDataRecordSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, 'El tipo es requerido').optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// Esquema para filtros de búsqueda
exports.dataRecordFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    type: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'type']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    search: zod_1.z.string().optional(),
    dataFilters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// Esquema para búsqueda avanzada
exports.advancedSearchSchema = zod_1.z.object({
    criteria: zod_1.z.object({
        searchTerms: zod_1.z.array(zod_1.z.string()).optional(),
        dataFields: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        dateRange: zod_1.z.object({
            from: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
            to: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
        }).optional(),
        types: zod_1.z.array(zod_1.z.string()).optional(),
        exactMatch: zod_1.z.boolean().default(false),
    }),
    pagination: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).default(1),
        limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    }),
    sorting: zod_1.z.object({
        field: zod_1.z.string().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).default('desc'),
    }),
});
// Esquema para filtros dinámicos
exports.dynamicFilterSchema = zod_1.z.object({
    field: zod_1.z.string(),
    operator: zod_1.z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in']),
    value: zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.number(),
        zod_1.z.boolean(),
        zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])),
    ]),
});
