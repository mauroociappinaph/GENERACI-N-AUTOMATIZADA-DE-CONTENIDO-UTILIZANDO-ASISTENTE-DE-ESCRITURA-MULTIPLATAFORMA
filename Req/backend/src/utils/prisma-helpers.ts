import { PaginationParams, PaginatedResponse } from '../types/prisma';

/**
 * Calculate pagination offset based on page and limit
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 10
): { skip: number; take: number } {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Create paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
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
export function parsePaginationParams(
  params: Record<string, unknown>
): PaginationParams {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(params.limit)) || 10)
  );
  const sortBy = String(params.sortBy) || 'createdAt';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, sortBy, sortOrder };
}

/**
 * Exclude sensitive fields from user object
 */
export function excludeUserPassword<T extends { passwordHash?: string }>(
  user: T
): Omit<T, 'passwordHash'> {
  const { passwordHash, ...userWithoutPassword } = user;
  void passwordHash; // Mark as intentionally unused
  return userWithoutPassword;
}

/**
 * Create Prisma orderBy object from sort parameters
 */
export function createOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Record<string, 'asc' | 'desc'> {
  if (!sortBy) return { createdAt: 'desc' };

  return {
    [sortBy]: sortOrder || 'asc',
  };
}
