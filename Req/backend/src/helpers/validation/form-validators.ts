/**
 * Helper functions for form and data validation
 * SRP: Validation utilities
 */

import { DataRecordFilters, AdvancedSearchParams, DynamicFilter } from '@/types/data-record';

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number): { page: number; limit: number } {
  const validatedPage = Math.max(1, Math.floor(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));

  return { page: validatedPage, limit: validatedLimit };
}

/**
 * Validate sort parameters
 */
export function validateSorting(sortBy?: string, sortOrder?: string): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const validSortFields = ['createdAt', 'updatedAt', 'type', 'id'];
  const validSortOrders = ['asc', 'desc'];

  const validatedSortBy = validSortFields.includes(sortBy || '') ? sortBy! : 'createdAt';
  const validatedSortOrder = validSortOrders.includes(sortOrder || '') ? sortOrder as 'asc' | 'desc' : 'desc';

  return { sortBy: validatedSortBy, sortOrder: validatedSortOrder };
}

/**
 * Validate data record filters
 */
export function validateDataRecordFilters(filters: DataRecordFilters): DataRecordFilters {
  const validated: DataRecordFilters = {
    ...filters,
    ...validatePagination(filters.page || 1, filters.limit || 10),
    ...validateSorting(filters.sortBy, filters.sortOrder)
  };

  // Validate search term length
  if (validated.search && validated.search.length < 2) {
    delete validated.search;
  }

  return validated;
}

/**
 * Validate advanced search parameters
 */
export function validateAdvancedSearchParams(params: AdvancedSearchParams): AdvancedSearchParams {
  const validated: AdvancedSearchParams = {
    criteria: {
      ...params.criteria
    },
    pagination: validatePagination(
      params.pagination?.page || 1,
      params.pagination?.limit || 10
    ),
    sorting: validateSorting(
      params.sorting?.field,
      params.sorting?.order
    )
  };

  // Validate search terms
  if (validated.criteria.searchTerms) {
    validated.criteria.searchTerms = validated.criteria.searchTerms
      .filter(term => term && term.length >= 2)
      .slice(0, 10); // Limit to 10 search terms
  }

  // Validate types
  if (validated.criteria.types) {
    validated.criteria.types = validated.criteria.types
      .filter(type => type && type.length > 0)
      .slice(0, 20); // Limit to 20 types
  }

  return validated;
}

/**
 * Validate dynamic filter
 */
export function validateDynamicFilter(filter: DynamicFilter): boolean {
  const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in'];

  return !!(
    filter.field &&
    filter.field.length > 0 &&
    filter.field.length <= 100 &&
    validOperators.includes(filter.operator) &&
    filter.value !== undefined &&
    filter.value !== null
  );
}

/**
 * Validate array of dynamic filters
 */
export function validateDynamicFilters(filters: DynamicFilter[]): DynamicFilter[] {
  return filters
    .filter(validateDynamicFilter)
    .slice(0, 50); // Limit to 50 filters
}

/**
 * Validate search term
 */
export function validateSearchTerm(term: string): boolean {
  return !!(
    term &&
    typeof term === 'string' &&
    term.trim().length >= 2 &&
    term.length <= 200
  );
}

/**
 * Sanitize search term
 */
export function sanitizeSearchTerm(term: string): string {
  return term
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 200); // Limit length
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string
 */
export function validateDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate data record type
 */
export function validateDataRecordType(type: string): boolean {
  const validTypes = ['document', 'image', 'video', 'audio', 'data', 'config'];
  return validTypes.includes(type);
}

/**
 * Validate metadata object
 */
export function validateMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object') return false;

  try {
    JSON.stringify(metadata);
    return true;
  } catch {
    return false;
  }
}
