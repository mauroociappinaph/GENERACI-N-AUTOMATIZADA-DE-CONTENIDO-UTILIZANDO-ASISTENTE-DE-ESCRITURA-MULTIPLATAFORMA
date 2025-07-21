/**
 * Helper functions for building Prisma queries for data records
 * SRP: Query construction utilities
 */

import { DataRecordFilters, AdvancedSearchParams, DynamicFilter } from '@/types/data-record';

/**
 * Build basic where conditions for data record queries
 */
export function buildBasicWhereConditions(filters: DataRecordFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {
    deletedAt: null, // Solo registros no eliminados
  };

  // Filtrar por tipo
  if (filters.type) {
    where.type = filters.type;
  }

  // Filtrar por creador
  if (filters.createdBy) {
    where.createdBy = filters.createdBy;
  }

  return where;
}

/**
 * Build date range filter conditions
 */
export function buildDateRangeConditions(dateFrom?: string, dateTo?: string): Record<string, unknown> | null {
  if (!dateFrom && !dateTo) return null;

  const dateFilter: { gte?: Date; lte?: Date } = {};

  if (dateFrom) {
    dateFilter.gte = new Date(dateFrom);
  }

  if (dateTo) {
    dateFilter.lte = new Date(dateTo);
  }

  return dateFilter;
}

/**
 * Build search conditions for text search
 */
export function buildSearchConditions(search: string): Array<Record<string, unknown>> {
  return [
    {
      type: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      data: {
        path: ['content'],
        string_contains: search
      }
    }
  ];
}

/**
 * Build data filter conditions from dynamic filters
 */
export function buildDataFilterConditions(dataFilters: Record<string, unknown>): Array<Record<string, unknown>> {
  return Object.entries(dataFilters).map(([key, value]) => ({
    data: {
      path: [key],
      equals: value
    }
  }));
}

/**
 * Build advanced search conditions
 */
export function buildAdvancedSearchConditions(criteria: AdvancedSearchParams['criteria']): Record<string, unknown> {
  const where: Record<string, unknown> = {
    deletedAt: null
  };

  // Filtrar por tipos
  if (criteria.types && criteria.types.length > 0) {
    where.type = {
      in: criteria.types
    };
  }

  return where;
}

/**
 * Build search terms conditions for advanced search
 */
export function buildSearchTermsConditions(
  searchTerms: string[],
  exactMatch: boolean
): Array<Record<string, unknown>> {
  const searchConditions = searchTerms.map(term => ({
    OR: [
      {
        type: {
          contains: term,
          mode: 'insensitive'
        }
      },
      {
        data: {
          path: ['content'],
          string_contains: term
        }
      }
    ]
  }));

  return exactMatch ? searchConditions : searchConditions.flatMap(condition => condition.OR);
}

/**
 * Build data field conditions for advanced search
 */
export function buildDataFieldConditions(dataFields: Record<string, unknown>): Array<Record<string, unknown>> {
  return Object.entries(dataFields).map(([key, value]) => ({
    data: {
      path: [key],
      equals: value
    }
  }));
}

/**
 * Merge OR conditions into where clause
 */
export function mergeORConditions(
  where: Record<string, unknown>,
  conditions: Array<Record<string, unknown>>
): void {
  if (where.OR) {
    where.OR = [...(where.OR as Array<Record<string, unknown>>), ...conditions];
  } else {
    where.OR = conditions;
  }
}

/**
 * Merge AND conditions into where clause
 */
export function mergeANDConditions(
  where: Record<string, unknown>,
  conditions: Array<Record<string, unknown>>
): void {
  if (where.AND) {
    where.AND = [...(where.AND as Array<Record<string, unknown>>), ...conditions];
  } else {
    where.AND = conditions;
  }
}
