import { apiClient as api } from './api';
import {
  ReportTemplate,
  ReportRequest,
  ReportResult,
  ReportScheduleRequest,
  ScheduledReport,
  ReportPreview,
  ApiResponse,
} from '../types';

export class ReportService {
  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response =
      await api.get<ApiResponse<ReportTemplate[]>>('/reports/templates');
    return response.data?.data || [];
  }

  /**
   * Generate a report
   */
  async generateReport(request: ReportRequest): Promise<ReportResult> {
    const response = await api.post<ApiResponse<ReportResult>>(
      '/reports/generate',
      request
    );
    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.error?.message || 'Failed to generate report'
      );
    }
    return response.data.data;
  }

  /**
   * Preview report data without generating file
   */
  async previewReport(
    templateId: string,
    parameters: Record<string, any> = {}
  ): Promise<ReportPreview> {
    const response = await api.post<ApiResponse<ReportPreview>>(
      '/reports/preview',
      {
        templateId,
        parameters,
      }
    );
    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.error?.message || 'Failed to preview report'
      );
    }
    return response.data.data;
  }

  /**
   * Download a generated report
   */
  async downloadReport(reportId: string): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/reports/download/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    // Create blob URL and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `report-${reportId}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Create a scheduled report
   */
  async createScheduledReport(
    request: ReportScheduleRequest
  ): Promise<ScheduledReport> {
    const response = await api.post<ApiResponse<ScheduledReport>>(
      '/reports/schedule',
      request
    );
    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.error?.message || 'Failed to create scheduled report'
      );
    }
    return response.data.data;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response =
      await api.get<ApiResponse<ScheduledReport[]>>('/reports/scheduled');
    return response.data?.data || [];
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    id: string,
    updates: Partial<ReportScheduleRequest>
  ): Promise<ScheduledReport> {
    const response = await api.put<ApiResponse<ScheduledReport>>(
      `/reports/scheduled/${id}`,
      updates
    );
    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.error?.message || 'Failed to update scheduled report'
      );
    }
    return response.data.data;
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `/reports/scheduled/${id}`
    );
    if (!response.data?.success) {
      throw new Error(
        response.data?.error?.message || 'Failed to delete scheduled report'
      );
    }
  }

  /**
   * Validate cron expression
   */
  validateCronExpression(expression: string): boolean {
    // Basic cron validation - 5 or 6 parts separated by spaces
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }

  /**
   * Get human-readable description of cron expression
   */
  describeCronExpression(expression: string): string {
    // Simple descriptions for common patterns
    const commonPatterns: Record<string, string> = {
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 9 * * 1': 'Every Monday at 9:00 AM',
      '0 9 1 * *': 'First day of every month at 9:00 AM',
      '0 9 * * 1-5': 'Weekdays at 9:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 * * 0': 'Every Sunday at midnight',
    };

    return commonPatterns[expression] || 'Custom schedule';
  }

  /**
   * Get suggested cron expressions
   */
  getSuggestedSchedules(): Array<{
    value: string;
    label: string;
    description: string;
  }> {
    return [
      {
        value: '0 9 * * *',
        label: 'Daily',
        description: 'Every day at 9:00 AM',
      },
      {
        value: '0 9 * * 1',
        label: 'Weekly',
        description: 'Every Monday at 9:00 AM',
      },
      {
        value: '0 9 1 * *',
        label: 'Monthly',
        description: 'First day of every month at 9:00 AM',
      },
      {
        value: '0 9 * * 1-5',
        label: 'Weekdays',
        description: 'Monday to Friday at 9:00 AM',
      },
      {
        value: '0 */6 * * *',
        label: 'Every 6 hours',
        description: 'Four times a day',
      },
      {
        value: '0 0 * * 0',
        label: 'Weekly (Sunday)',
        description: 'Every Sunday at midnight',
      },
    ];
  }
}

export const reportService = new ReportService();
