export type { User, DataRecord, AuditLog, Report, UserRole, Prisma, } from '@prisma/client';
import type { User, UserRole, Prisma } from '@prisma/client';
export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {
}
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
    data: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
}
export interface UpdateDataRecordData {
    type?: string;
    data?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
}
export interface CreateAuditLogData {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
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
