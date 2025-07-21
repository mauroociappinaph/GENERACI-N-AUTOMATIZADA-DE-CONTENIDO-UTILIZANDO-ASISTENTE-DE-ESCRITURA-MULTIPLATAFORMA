"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
exports.createPaginatedResponse = createPaginatedResponse;
exports.parsePaginationParams = parsePaginationParams;
exports.excludeUserPassword = excludeUserPassword;
exports.createOrderBy = createOrderBy;
/**
 * Calculate pagination offset based on page and limit
 */
function calculatePagination(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
}
/**
 * Create paginated response object
 */
function createPaginatedResponse(data, total, page = 1, limit = 10) {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}
/**
 * Parse and validate pagination parameters
 */
function parsePaginationParams(params) {
    const page = Math.max(1, parseInt(String(params.page)) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(params.limit)) || 10));
    const sortBy = String(params.sortBy) || 'createdAt';
    const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';
    return { page, limit, sortBy, sortOrder };
}
/**
 * Exclude sensitive fields from user object
 */
function excludeUserPassword(user) {
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash; // Mark as intentionally unused
    return userWithoutPassword;
}
/**
 * Create Prisma orderBy object from sort parameters
 */
function createOrderBy(sortBy, sortOrder) {
    if (!sortBy)
        return { createdAt: 'desc' };
    return {
        [sortBy]: sortOrder || 'asc',
    };
}
