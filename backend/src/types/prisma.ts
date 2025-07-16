// Export Prisma types for use throughout the application
export type {
  User,
  DataRecord,
  AuditLog,
  Report,
  UserRole,
} from '../generated/prisma';

// Import types for use in interfaces
import type { User, UserRole } from '../generated/prisma';

// Custom types for API responses
export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateDataRecordData {
  type: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateDataRecordData {
  type?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CreateAuditLogData {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateReportData {
  name: string;
  description?: string;
  template: Record<string, unknown>;
}

export interface UpdateReportData {
  name?: string;
  description?: string;
  template?: Record<string, unknown>;
  isActive?: boolean;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
