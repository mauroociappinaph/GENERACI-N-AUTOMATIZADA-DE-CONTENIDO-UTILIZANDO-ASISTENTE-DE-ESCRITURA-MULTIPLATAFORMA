import { PaginationParams, PaginatedResponse } from '../types/prisma';
/**
 * Calculate pagination offset based on page and limit
 */
export declare function calculatePagination(page?: number, limit?: number): {
    skip: number;
    take: number;
};
/**
 * Create paginated response object
 */
export declare function createPaginatedResponse<T>(data: T[], total: number, page?: number, limit?: number): PaginatedResponse<T>;
/**
 * Parse and validate pagination parameters
 */
export declare function parsePaginationParams(params: Record<string, unknown>): PaginationParams;
/**
 * Exclude sensitive fields from user object
 */
export declare function excludeUserPassword<T extends {
    passwordHash?: string;
}>(user: T): Omit<T, 'passwordHash'>;
/**
 * Create Prisma orderBy object from sort parameters
 */
export declare function createOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, 'asc' | 'desc'>;
