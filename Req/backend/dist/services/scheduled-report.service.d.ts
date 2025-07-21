import { ScheduledReport, ReportScheduleRequest } from '../types/report';
export declare class ScheduledReportService {
    private prisma;
    private reportService;
    private notificationService;
    private scheduledJobs;
    constructor();
    private initializeScheduledReports;
    createScheduledReport(request: ReportScheduleRequest, createdBy: string): Promise<ScheduledReport>;
    private scheduleReport;
    private executeScheduledReport;
    private sendReportByEmail;
    private notifyReportFailure;
    private getNextRunDate;
    getActiveScheduledReports(): Promise<ScheduledReport[]>;
    updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport>;
    deleteScheduledReport(id: string): Promise<void>;
    getScheduledReportStatus(id: string): Promise<ScheduledReport | null>;
    shutdown(): void;
}
