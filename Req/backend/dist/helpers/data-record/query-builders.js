"use strict";
/**
 * Helper functions for building Prisma queries for data records
 * SRP: Query construction utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBasicWhereConditions = buildBasicWhereConditions;
exports.buildDateRangeConditions = buildDateRangeConditions;
exports.buildSearchConditions = buildSearchConditions;
exports.buildDataFilterConditions = buildDataFilterConditions;
exports.buildAdvancedSearchConditions = buildAdvancedSearchConditions;
exports.buildSearchTermsConditions = buildSearchTermsConditions;
exports.buildDataFieldConditions = buildDataFieldConditions;
exports.mergeORConditions = mergeORConditions;
exports.mergeANDConditions = mergeANDConditions;
/**
 * Build basic where conditions for data record queries
 */
function buildBasicWhereConditions(filters) {
    const where = {
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
function buildDateRangeConditions(dateFrom, dateTo) {
    if (!dateFrom && !dateTo)
        return null;
    const dateFilter = {};
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
function buildSearchConditions(search) {
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
function buildDataFilterConditions(dataFilters) {
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
function buildAdvancedSearchConditions(criteria) {
    const where = {
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
function buildSearchTermsConditions(searchTerms, exactMatch) {
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
function buildDataFieldConditions(dataFields) {
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
function mergeORConditions(where, conditions) {
    if (where.OR) {
        where.OR = [...where.OR, ...conditions];
    }
    else {
        where.OR = conditions;
    }
}
/**
 * Merge AND conditions into where clause
 */
function mergeANDConditions(where, conditions) {
    if (where.AND) {
        where.AND = [...where.AND, ...conditions];
    }
    else {
        where.AND = conditions;
    }
}
