/**
 * Helper functions for building Prisma queries for data records
 * SRP: Query construction utilities
 */
import { DataRecordFilters, AdvancedSearchParams } from '@/types/data-record';
/**
 * Build basic where conditions for data record queries
 */
export declare function buildBasicWhereConditions(filters: DataRecordFilters): Record<string, unknown>;
/**
 * Build date range filter conditions
 */
export declare function buildDateRangeConditions(dateFrom?: string, dateTo?: string): Record<string, unknown> | null;
/**
 * Build search conditions for text search
 */
export declare function buildSearchConditions(search: string): Array<Record<string, unknown>>;
/**
 * Build data filter conditions from dynamic filters
 */
export declare function buildDataFilterConditions(dataFilters: Record<string, unknown>): Array<Record<string, unknown>>;
/**
 * Build advanced search conditions
 */
export declare function buildAdvancedSearchConditions(criteria: AdvancedSearchParams['criteria']): Record<string, unknown>;
/**
 * Build search terms conditions for advanced search
 */
export declare function buildSearchTermsConditions(searchTerms: string[], exactMatch: boolean): Array<Record<string, unknown>>;
/**
 * Build data field conditions for advanced search
 */
export declare function buildDataFieldConditions(dataFields: Record<string, unknown>): Array<Record<string, unknown>>;
/**
 * Merge OR conditions into where clause
 */
export declare function mergeORConditions(where: Record<string, unknown>, conditions: Array<Record<string, unknown>>): void;
/**
 * Merge AND conditions into where clause
 */
export declare function mergeANDConditions(where: Record<string, unknown>, conditions: Array<Record<string, unknown>>): void;
