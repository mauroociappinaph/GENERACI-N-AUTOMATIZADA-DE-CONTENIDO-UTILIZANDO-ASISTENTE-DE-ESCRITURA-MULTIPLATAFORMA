export interface ReportTemplate {
    id: string;
    name: string;
    description?: string;
    query: string;
    parameters: ReportParameter[];
    format: ReportFormat;
    template: string;
}
export interface ReportParameter {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: {
        value: any;
        label: string;
    }[];
}
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export interface ReportRequest {
    templateId: string;
    parameters: Record<string, any>;
    format: ReportFormat;
    deliveryMethod: 'download' | 'email';
    email?: string;
}
export interface ReportResult {
    id: string;
    templateId: string;
    format: ReportFormat;
    data: any[];
    generatedAt: Date;
    filePath?: string;
    downloadUrl?: string;
}
export interface ScheduledReport {
    id: string;
    templateId: string;
    parameters: Record<string, any>;
    format: ReportFormat;
    schedule: string;
    recipients: string[];
    isActive: boolean;
    lastRun?: Date;
    nextRun?: Date;
}
export interface ReportScheduleRequest {
    templateId: string;
    parameters: Record<string, any>;
    format: ReportFormat;
    schedule: string;
    recipients: string[];
}
export interface GeneratedReport {
    id: string;
    templateId: string;
    userId: string;
    format: ReportFormat;
    parameters: Record<string, any>;
    filePath: string;
    downloadUrl: string;
    generatedAt: Date;
    expiresAt?: Date;
}
