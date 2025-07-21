import { ReportTemplate, ReportRequest, GeneratedReport } from '@/types/report';
/**
 * Interface for ReportService
 * Prevents "property does not exist" errors
 */
export interface IReportService {
    createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate>;
    getTemplates(userId?: string): Promise<ReportTemplate[]>;
    getTemplateById(id: string): Promise<ReportTemplate | null>;
    updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate>;
    deleteTemplate(id: string): Promise<void>;
    generateReport(request: ReportRequest): Promise<GeneratedReport>;
    getGeneratedReports(userId?: string): Promise<GeneratedReport[]>;
    getGeneratedReportById(id: string): Promise<GeneratedReport | null>;
    deleteGeneratedReport(id: string): Promise<void>;
}
