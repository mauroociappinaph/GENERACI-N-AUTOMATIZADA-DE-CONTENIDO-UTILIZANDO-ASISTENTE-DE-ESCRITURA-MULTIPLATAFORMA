/**
 * Helper functions for building dynamic filters
 * SRP: Dynamic filter construction utilities
 */
import { DynamicFilter } from '@/types/data-record';
/**
 * Build JSON path conditions for data fields
 */
export declare function buildJSONPathCondition(filterField: string, operator: string, value: unknown): Record<string, unknown>;
/**
 * Build direct field conditions
 */
export declare function buildDirectFieldCondition(filterField: string, operator: string, value: unknown): Record<string, unknown>;
/**
 * Build single dynamic filter condition
 */
export declare function buildDynamicFilterCondition(filter: DynamicFilter): Record<string, unknown>;
/**
 * Build all dynamic filter conditions
 */
export declare function buildDynamicFilterConditions(filters: DynamicFilter[]): Array<Record<string, unknown>>;
/**
 * Validate dynamic filter
 */
export declare function validateDynamicFilter(filter: DynamicFilter): boolean;
/**
 * Sanitize dynamic filters
 */
export declare function sanitizeDynamicFilters(filters: DynamicFilter[]): DynamicFilter[];
