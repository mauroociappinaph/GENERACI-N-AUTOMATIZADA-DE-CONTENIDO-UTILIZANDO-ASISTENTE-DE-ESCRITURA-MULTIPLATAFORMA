import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ReportTemplate,
  ReportRequest,
  ReportResult,
  ReportFormat,
} from '../types/report';
import logger from '../utils/logger';

export class ReportService {
  private prisma: PrismaClient;
  private reportsDir: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.reportsDir = path.join(process.cwd(), 'generated-reports');
    this.ensureReportsDirectory();
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.access(this.reportsDir);
    } catch {
      await fs.mkdir(this.reportsDir, { recursive: true });
    }
  }

  async generateReport(request: ReportRequest): Promise<ReportResult> {
    try {
      logger.info('Generating report', { templateId: request.templateId });

      // Get report template
      const template = await this.getReportTemplate(request.templateId);
      if (!template) {
        throw new Error(`Report template not found: ${request.templateId}`);
      }

      // Execute query with parameters
      const data = await this.executeReportQuery(template.query, request.parameters);

      // Generate report based on format
      const result: ReportResult = {
        id: uuidv4(),
        templateId: request.templateId,
        format: request.format,
        data,
        generatedAt: new Date(),
      };

      switch (request.format) {
        case 'pdf':
          result.filePath = await this.generatePDFReport(template, data, result.id);
          break;
        case 'excel':
          result.filePath = await this.generateExcelReport(template, data, result.id);
          break;
        case 'csv':
          result.filePath = await this.generateCSVReport(template, data, result.id);
          break;
        default:
          throw new Error(`Unsupported report format: ${request.format}`);
      }

      result.downloadUrl = `/api/reports/download/${result.id}`;

      logger.info('Report generated successfully', {
        reportId: result.id,
        format: request.format
      });

      return result;
    } catch (error) {
      logger.error('Error generating report', { error, request });
      throw error;
    }
  }

  private async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    const report = await this.prisma.report.findUnique({
      where: { id: templateId, isActive: true },
    });

    if (!report) {
      return null;
    }

    return {
      id: report.id,
      name: report.name,
      description: report.description || undefined,
      query: (report.template as any).query,
      parameters: (report.template as any).parameters || [],
      format: (report.template as any).format || 'pdf',
      template: (report.template as any).htmlTemplate || '',
    };
  }

  private async executeReportQuery(
    query: string,
    parameters: Record<string, any>
  ): Promise<any[]> {
    try {
      // Replace parameters in query
      let processedQuery = query;
      Object.entries(parameters).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedQuery = processedQuery.replace(
          new RegExp(placeholder, 'g'),
          this.formatQueryValue(value)
        );
      });

      logger.info('Executing report query', { query: processedQuery });

      // Execute raw SQL query
      const result = await this.prisma.$queryRawUnsafe(processedQuery);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      logger.error('Error executing report query', { error, query });
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatQueryValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return String(value);
  }

  private async generatePDFReport(
    template: ReportTemplate,
    data: any[],
    reportId: string
  ): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Compile Handlebars template
      const compiledTemplate = Handlebars.compile(template.template || this.getDefaultHTMLTemplate());
      const html = compiledTemplate({
        title: template.name,
        description: template.description,
        data,
        generatedAt: new Date().toLocaleString(),
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const fileName = `${reportId}.pdf`;
      const filePath = path.join(this.reportsDir, fileName);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      return filePath;
    } finally {
      await browser.close();
    }
  }

  private async generateExcelReport(
    template: ReportTemplate,
    data: any[],
    reportId: string
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(template.name);

    if (data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Add data rows
      data.forEach((row) => {
        const values = headers.map((header) => row[header]);
        worksheet.addRow(values);
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        if (column.header) {
          column.width = Math.max(column.header.toString().length, 15);
        }
      });
    }

    const fileName = `${reportId}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  private async generateCSVReport(
    template: ReportTemplate,
    data: any[],
    reportId: string
  ): Promise<string> {
    if (data.length === 0) {
      throw new Error('No data available for CSV export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      ),
    ].join('\n');

    const fileName = `${reportId}.csv`;
    const filePath = path.join(this.reportsDir, fileName);

    await fs.writeFile(filePath, csvContent, 'utf-8');
    return filePath;
  }

  private getDefaultHTMLTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .description { color: #666; margin-bottom: 10px; }
        .generated-at { font-size: 12px; color: #999; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{title}}</div>
        {{#if description}}
        <div class="description">{{description}}</div>
        {{/if}}
        <div class="generated-at">Generated on: {{generatedAt}}</div>
    </div>

    {{#if data}}
    <table>
        <thead>
            <tr>
                {{#each (lookup data 0)}}
                <th>{{@key}}</th>
                {{/each}}
            </tr>
        </thead>
        <tbody>
            {{#each data}}
            <tr>
                {{#each this}}
                <td>{{this}}</td>
                {{/each}}
            </tr>
            {{/each}}
        </tbody>
    </table>
    {{else}}
    <p>No data available for this report.</p>
    {{/if}}
</body>
</html>`;
  }

  async getReportFile(reportId: string): Promise<string | null> {
    const possibleExtensions = ['pdf', 'xlsx', 'csv'];

    for (const ext of possibleExtensions) {
      const filePath = path.join(this.reportsDir, `${reportId}.${ext}`);
      try {
        await fs.access(filePath);
        return filePath;
      } catch {
        continue;
      }
    }

    return null;
  }

  async cleanupOldReports(olderThanDays: number = 7): Promise<void> {
    try {
      const files = await fs.readdir(this.reportsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          logger.info('Cleaned up old report file', { file });
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old reports', { error });
    }
  }
}
