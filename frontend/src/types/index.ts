// Common types for the Sistema de Gestión #040 frontend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DataRecord<DataType = unknown> {
  id: string;
  type: string;
  data: Record<string, DataType>;
  metadata: RecordMetadata;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordMetadata {
  version: number;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
}

export enum WidgetType {
  METRICS = 'metrics',
  CHART = 'chart',
  TABLE = 'table',
  ACTIVITY = 'activity',
}

export interface WidgetConfig {
  dataSource?: string;
  refreshInterval?: number;
  filters?: Record<string, unknown>;
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
}

export interface ApiResponse<ResponseType = unknown> {
  success: boolean;
  data?: ResponseType;
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

export interface SearchCriteria {
  query?: string;
  filters: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}
