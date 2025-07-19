// Common types for the Sistema de Gestión #040 backend

// Re-export Prisma types
export * from './prisma';

// Re-export user types
export * from './user';

// Re-export other types
export * from './data-record';
export * from './external-api';
export * from './notification';
export * from './report';
export * from './roles';

export interface AuthResponse {
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Import types from Prisma
import { UserWithoutPassword } from './prisma';

export interface RecordMetadata {
  version: number;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SearchCriteria {
  query?: string;
  filters: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
  };
}
