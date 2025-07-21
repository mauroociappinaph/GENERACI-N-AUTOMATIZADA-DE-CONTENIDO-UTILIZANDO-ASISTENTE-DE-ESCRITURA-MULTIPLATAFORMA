import { z } from 'zod';
import { Prisma, DataRecord as PrismaDataRecord } from '@prisma/client';
export interface DataRecord extends PrismaDataRecord {
    version: number;
}
export declare const createDataRecordSchema: z.ZodObject<{
    type: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const updateDataRecordSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const dataRecordFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    type: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        type: "type";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    dataFilters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const advancedSearchSchema: z.ZodObject<{
    criteria: z.ZodObject<{
        searchTerms: z.ZodOptional<z.ZodArray<z.ZodString>>;
        dataFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        dateRange: z.ZodOptional<z.ZodObject<{
            from: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
            to: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
        }, z.core.$strip>>;
        types: z.ZodOptional<z.ZodArray<z.ZodString>>;
        exactMatch: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    sorting: z.ZodObject<{
        field: z.ZodDefault<z.ZodString>;
        order: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const dynamicFilterSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<{
        endsWith: "endsWith";
        startsWith: "startsWith";
        gte: "gte";
        lte: "lte";
        in: "in";
        lt: "lt";
        eq: "eq";
        neq: "neq";
        gt: "gt";
        contains: "contains";
    }>;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]>>]>;
}, z.core.$strip>;
export type CreateDataRecordInput = z.infer<typeof createDataRecordSchema> & {
    data: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
};
export type UpdateDataRecordInput = z.infer<typeof updateDataRecordSchema> & {
    data?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
};
export type DataRecordFilters = z.infer<typeof dataRecordFiltersSchema>;
export type AdvancedSearchParams = z.infer<typeof advancedSearchSchema>;
export type DynamicFilter = z.infer<typeof dynamicFilterSchema>;
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
