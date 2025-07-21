"use strict";
/**
 * Helper functions for building dynamic filters
 * SRP: Dynamic filter construction utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJSONPathCondition = buildJSONPathCondition;
exports.buildDirectFieldCondition = buildDirectFieldCondition;
exports.buildDynamicFilterCondition = buildDynamicFilterCondition;
exports.buildDynamicFilterConditions = buildDynamicFilterConditions;
exports.validateDynamicFilter = validateDynamicFilter;
exports.sanitizeDynamicFilters = sanitizeDynamicFilters;
/**
 * JSON path operator mapping for reduced complexity
 */
const JSON_PATH_OPERATORS = {
    eq: (jsonPath, value) => ({ data: { path: jsonPath, equals: value } }),
    neq: (jsonPath, value) => ({ NOT: { data: { path: jsonPath, equals: value } } }),
    gt: (jsonPath, value) => ({ data: { path: jsonPath, gt: value } }),
    gte: (jsonPath, value) => ({ data: { path: jsonPath, gte: value } }),
    lt: (jsonPath, value) => ({ data: { path: jsonPath, lt: value } }),
    lte: (jsonPath, value) => ({ data: { path: jsonPath, lte: value } }),
    contains: (jsonPath, value) => ({ data: { path: jsonPath, string_contains: value } }),
    startsWith: (jsonPath, value) => ({ data: { path: jsonPath, string_starts_with: value } }),
    endsWith: (jsonPath, value) => ({ data: { path: jsonPath, string_ends_with: value } }),
    in: (jsonPath, value) => ({ data: { path: jsonPath, array_contains: value } }),
};
/**
 * Build JSON path conditions for data fields
 */
function buildJSONPathCondition(filterField, operator, value) {
    const [dataField, ...nestedPath] = filterField.split('.');
    const jsonPath = nestedPath.length > 0 ? [dataField, ...nestedPath] : [dataField];
    const operatorFunction = JSON_PATH_OPERATORS[operator];
    return operatorFunction ? operatorFunction(jsonPath, value) : {};
}
/**
 * Direct field operator mapping for reduced complexity
 */
const DIRECT_FIELD_OPERATORS = {
    eq: (filterField, value) => ({ [filterField]: { equals: value } }),
    neq: (filterField, value) => ({ NOT: { [filterField]: { equals: value } } }),
    gt: (filterField, value) => ({ [filterField]: { gt: value } }),
    gte: (filterField, value) => ({ [filterField]: { gte: value } }),
    lt: (filterField, value) => ({ [filterField]: { lt: value } }),
    lte: (filterField, value) => ({ [filterField]: { lte: value } }),
    contains: (filterField, value) => ({ [filterField]: { contains: value, mode: 'insensitive' } }),
    startsWith: (filterField, value) => ({ [filterField]: { startsWith: value, mode: 'insensitive' } }),
    endsWith: (filterField, value) => ({ [filterField]: { endsWith: value, mode: 'insensitive' } }),
    in: (filterField, value) => ({ [filterField]: { in: value } }),
};
/**
 * Build direct field conditions
 */
function buildDirectFieldCondition(filterField, operator, value) {
    const operatorFunction = DIRECT_FIELD_OPERATORS[operator];
    return operatorFunction ? operatorFunction(filterField, value) : {};
}
/**
 * Build single dynamic filter condition
 */
function buildDynamicFilterCondition(filter) {
    const { field: filterField, operator, value } = filter;
    // Determinar si el campo es un campo de datos o un campo directo
    if (filterField.includes('.')) {
        return buildJSONPathCondition(filterField, operator, value);
    }
    else {
        return buildDirectFieldCondition(filterField, operator, value);
    }
}
/**
 * Build all dynamic filter conditions
 */
function buildDynamicFilterConditions(filters) {
    return filters.map(buildDynamicFilterCondition);
}
/**
 * Validate dynamic filter
 */
function validateDynamicFilter(filter) {
    const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in'];
    return (Boolean(filter.field) &&
        filter.field.length > 0 &&
        validOperators.includes(filter.operator) &&
        filter.value !== undefined);
}
/**
 * Sanitize dynamic filters
 */
function sanitizeDynamicFilters(filters) {
    return filters.filter(validateDynamicFilter);
}
