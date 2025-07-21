import { ReportRequest, ReportResult } from '../types/report';
export declare class ReportService {
    private prisma;
    private reportsDir;
    constructor();
    private ensureReportsDirectory;
    generateReport(request: ReportRequest): Promise<ReportResult>;
    private getReportTemplate;
    private executeReportQuery;
    private formatQueryValue;
    private generatePDFReport;
    private generateExcelReport;
    private generateCSVReport;
    private getDefaultHTMLTemplate;
    getReportFile(reportId: string): Promise<string | null>;
    cleanupOldReports(olderThanDays?: number): Promise<void>;
}
