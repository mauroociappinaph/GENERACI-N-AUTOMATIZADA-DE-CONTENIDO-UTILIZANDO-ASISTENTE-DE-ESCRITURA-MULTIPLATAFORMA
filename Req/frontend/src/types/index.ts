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
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
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
  chartType?:
    | 'line'
    | 'bar'
    | 'pie'
    | 'doughnut'
    | 'area'
    | 'composed'
    | 'scatter';
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

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  USER_ACTION = 'user_action',
  DATA_UPDATE = 'data_update',
  REPORT_READY = 'report_ready',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface NotificationFilter {
  userId?: string;
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

// Report types
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  parameters: ReportParameter[];
  formats: ReportFormat[];
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { value: unknown; label: string }[];
}

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportRequest {
  templateId: string;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  deliveryMethod: 'download' | 'email';
  email?: string;
}

export interface ReportResult {
  reportId: string;
  templateId: string;
  format: ReportFormat;
  generatedAt: string;
  downloadUrl: string;
  recordCount: number;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  schedule: string;
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface ReportScheduleRequest {
  templateId: string;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  schedule: string;
  recipients: string[];
}

export interface ReportPreview {
  templateId: string;
  totalRecords: number;
  previewRecords: number;
  data: unknown[];
  generatedAt: string;
}
