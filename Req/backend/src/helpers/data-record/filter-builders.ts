/**
 * Helper functions for building dynamic filters
 * SRP: Dynamic filter construction utilities
 */

import { DynamicFilter } from '@/types/data-record';

/**
 * JSON path operator mapping for reduced complexity
 */
const JSON_PATH_OPERATORS = {
  eq: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, equals: value } }),
  neq: (jsonPath: string[], value: unknown) => ({ NOT: { data: { path: jsonPath, equals: value } } }),
  gt: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, gt: value } }),
  gte: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, gte: value } }),
  lt: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, lt: value } }),
  lte: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, lte: value } }),
  contains: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, string_contains: value as string } }),
  startsWith: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, string_starts_with: value as string } }),
  endsWith: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, string_ends_with: value as string } }),
  in: (jsonPath: string[], value: unknown) => ({ data: { path: jsonPath, array_contains: value } }),
} as const;

/**
 * Build JSON path conditions for data fields
 */
export function buildJSONPathCondition(
  filterField: string,
  operator: string,
  value: unknown
): Record<string, unknown> {
  const [dataField, ...nestedPath] = filterField.split('.');
  const jsonPath = nestedPath.length > 0 ? [dataField, ...nestedPath] : [dataField];

  const operatorFunction = JSON_PATH_OPERATORS[operator as keyof typeof JSON_PATH_OPERATORS];
  return operatorFunction ? operatorFunction(jsonPath, value) : {};
}

/**
 * Direct field operator mapping for reduced complexity
 */
const DIRECT_FIELD_OPERATORS = {
  eq: (filterField: string, value: unknown) => ({ [filterField]: { equals: value } }),
  neq: (filterField: string, value: unknown) => ({ NOT: { [filterField]: { equals: value } } }),
  gt: (filterField: string, value: unknown) => ({ [filterField]: { gt: value } }),
  gte: (filterField: string, value: unknown) => ({ [filterField]: { gte: value } }),
  lt: (filterField: string, value: unknown) => ({ [filterField]: { lt: value } }),
  lte: (filterField: string, value: unknown) => ({ [filterField]: { lte: value } }),
  contains: (filterField: string, value: unknown) => ({ [filterField]: { contains: value as string, mode: 'insensitive' } }),
  startsWith: (filterField: string, value: unknown) => ({ [filterField]: { startsWith: value as string, mode: 'insensitive' } }),
  endsWith: (filterField: string, value: unknown) => ({ [filterField]: { endsWith: value as string, mode: 'insensitive' } }),
  in: (filterField: string, value: unknown) => ({ [filterField]: { in: value as string[] } }),
} as const;

/**
 * Build direct field conditions
 */
export function buildDirectFieldCondition(
  filterField: string,
  operator: string,
  value: unknown
): Record<string, unknown> {
  const operatorFunction = DIRECT_FIELD_OPERATORS[operator as keyof typeof DIRECT_FIELD_OPERATORS];
  return operatorFunction ? operatorFunction(filterField, value) : {};
}

/**
 * Build single dynamic filter condition
 */
export function buildDynamicFilterCondition(filter: DynamicFilter): Record<string, unknown> {
  const { field: filterField, operator, value } = filter;

  // Determinar si el campo es un campo de datos o un campo directo
  if (filterField.includes('.')) {
    return buildJSONPathCondition(filterField, operator, value);
  } else {
    return buildDirectFieldCondition(filterField, operator, value);
  }
}

/**
 * Build all dynamic filter conditions
 */
export function buildDynamicFilterConditions(filters: DynamicFilter[]): Array<Record<string, unknown>> {
  return filters.map(buildDynamicFilterCondition);
}

/**
 * Validate dynamic filter
 */
export function validateDynamicFilter(filter: DynamicFilter): boolean {
  const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in'];

  return (
    Boolean(filter.field) &&
    filter.field.length > 0 &&
    validOperators.includes(filter.operator) &&
    filter.value !== undefined
  );
}

/**
 * Sanitize dynamic filters
 */
export function sanitizeDynamicFilters(filters: DynamicFilter[]): DynamicFilter[] {
  return filters.filter(validateDynamicFilter);
}
