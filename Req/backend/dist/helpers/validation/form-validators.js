"use strict";
/**
 * Helper functions for form and data validation
 * SRP: Validation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = validatePagination;
exports.validateSorting = validateSorting;
exports.validateDataRecordFilters = validateDataRecordFilters;
exports.validateAdvancedSearchParams = validateAdvancedSearchParams;
exports.validateDynamicFilter = validateDynamicFilter;
exports.validateDynamicFilters = validateDynamicFilters;
exports.validateSearchTerm = validateSearchTerm;
exports.sanitizeSearchTerm = sanitizeSearchTerm;
exports.validateUUID = validateUUID;
exports.validateDateString = validateDateString;
exports.validateDataRecordType = validateDataRecordType;
exports.validateMetadata = validateMetadata;
/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
    const validatedPage = Math.max(1, Math.floor(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
    return { page: validatedPage, limit: validatedLimit };
}
/**
 * Validate sort parameters
 */
function validateSorting(sortBy, sortOrder) {
    const validSortFields = ['createdAt', 'updatedAt', 'type', 'id'];
    const validSortOrders = ['asc', 'desc'];
    const validatedSortBy = validSortFields.includes(sortBy || '') ? sortBy : 'createdAt';
    const validatedSortOrder = validSortOrders.includes(sortOrder || '') ? sortOrder : 'desc';
    return { sortBy: validatedSortBy, sortOrder: validatedSortOrder };
}
/**
 * Validate data record filters
 */
function validateDataRecordFilters(filters) {
    const validated = {
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
function validateAdvancedSearchParams(params) {
    const validated = {
        criteria: {
            ...params.criteria
        },
        pagination: validatePagination(params.pagination?.page || 1, params.pagination?.limit || 10),
        sorting: validateSorting(params.sorting?.field, params.sorting?.order)
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
function validateDynamicFilter(filter) {
    const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in'];
    return !!(filter.field &&
        filter.field.length > 0 &&
        filter.field.length <= 100 &&
        validOperators.includes(filter.operator) &&
        filter.value !== undefined &&
        filter.value !== null);
}
/**
 * Validate array of dynamic filters
 */
function validateDynamicFilters(filters) {
    return filters
        .filter(validateDynamicFilter)
        .slice(0, 50); // Limit to 50 filters
}
/**
 * Validate search term
 */
function validateSearchTerm(term) {
    return !!(term &&
        typeof term === 'string' &&
        term.trim().length >= 2 &&
        term.length <= 200);
}
/**
 * Sanitize search term
 */
function sanitizeSearchTerm(term) {
    return term
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML
        .substring(0, 200); // Limit length
}
/**
 * Validate UUID format
 */
function validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Validate date string
 */
function validateDateString(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}
/**
 * Validate data record type
 */
function validateDataRecordType(type) {
    const validTypes = ['document', 'image', 'video', 'audio', 'data', 'config'];
    return validTypes.includes(type);
}
/**
 * Validate metadata object
 */
function validateMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object')
        return false;
    try {
        JSON.stringify(metadata);
        return true;
    }
    catch {
        return false;
    }
}
