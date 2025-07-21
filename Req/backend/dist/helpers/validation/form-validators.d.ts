/**
 * Helper functions for form and data validation
 * SRP: Validation utilities
 */
import { DataRecordFilters, AdvancedSearchParams, DynamicFilter } from '@/types/data-record';
/**
 * Validate pagination parameters
 */
export declare function validatePagination(page: number, limit: number): {
    page: number;
    limit: number;
};
/**
 * Validate sort parameters
 */
export declare function validateSorting(sortBy?: string, sortOrder?: string): {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
};
/**
 * Validate data record filters
 */
export declare function validateDataRecordFilters(filters: DataRecordFilters): DataRecordFilters;
/**
 * Validate advanced search parameters
 */
export declare function validateAdvancedSearchParams(params: AdvancedSearchParams): AdvancedSearchParams;
/**
 * Validate dynamic filter
 */
export declare function validateDynamicFilter(filter: DynamicFilter): boolean;
/**
 * Validate array of dynamic filters
 */
export declare function validateDynamicFilters(filters: DynamicFilter[]): DynamicFilter[];
/**
 * Validate search term
 */
export declare function validateSearchTerm(term: string): boolean;
/**
 * Sanitize search term
 */
export declare function sanitizeSearchTerm(term: string): string;
/**
 * Validate UUID format
 */
export declare function validateUUID(uuid: string): boolean;
/**
 * Validate date string
 */
export declare function validateDateString(dateString: string): boolean;
/**
 * Validate data record type
 */
export declare function validateDataRecordType(type: string): boolean;
/**
 * Validate metadata object
 */
export declare function validateMetadata(metadata: unknown): boolean;
