"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const client_1 = require("@prisma/client");
const ExcelJS = __importStar(require("exceljs"));
const puppeteer = __importStar(require("puppeteer"));
const Handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
class ReportService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.reportsDir = path.join(process.cwd(), 'generated-reports');
        this.ensureReportsDirectory();
    }
    async ensureReportsDirectory() {
        try {
            await fs.access(this.reportsDir);
        }
        catch {
            await fs.mkdir(this.reportsDir, { recursive: true });
        }
    }
    async generateReport(request) {
        try {
            logger_1.default.info('Generating report', { templateId: request.templateId });
            // Get report template
            const template = await this.getReportTemplate(request.templateId);
            if (!template) {
                throw new Error(`Report template not found: ${request.templateId}`);
            }
            // Execute query with parameters
            const data = await this.executeReportQuery(template.query, request.parameters);
            // Generate report based on format
            const result = {
                id: (0, uuid_1.v4)(),
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
            logger_1.default.info('Report generated successfully', {
                reportId: result.id,
                format: request.format
            });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error generating report', { error, request });
            throw error;
        }
    }
    async getReportTemplate(templateId) {
        const report = await this.prisma.report.findUnique({
            where: { id: templateId, isActive: true },
        });
        if (!report) {
            return null;
        }
        return {
            id: report.id,
            name: report.name,
            description: report.description ?? undefined,
            query: report.template.query,
            parameters: report.template.parameters || [],
            format: report.template.format || 'pdf',
            template: report.template.htmlTemplate || '',
        };
    }
    async executeReportQuery(query, parameters) {
        try {
            // Replace parameters in query
            let processedQuery = query;
            Object.entries(parameters).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), this.formatQueryValue(value));
            });
            logger_1.default.info('Executing report query', { query: processedQuery });
            // Execute raw SQL query
            const result = await this.prisma.$queryRawUnsafe(processedQuery);
            return Array.isArray(result) ? result : [result];
        }
        catch (error) {
            logger_1.default.error('Error executing report query', { error, query });
            throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    formatQueryValue(value) {
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
    async generatePDFReport(template, data, reportId) {
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
        }
        finally {
            await browser.close();
        }
    }
    async generateExcelReport(template, data, reportId) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(template.name);
        if (data.length > 0) {
            // Add headers
            const headers = Object.keys(data[0] || {});
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
    async generateCSVReport(template, data, reportId) {
        if (data.length === 0) {
            throw new Error('No data available for CSV export');
        }
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map((row) => headers.map((header) => {
                const value = row[header];
                if (value === null || value === undefined)
                    return '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value);
            }).join(',')),
        ].join('\n');
        const fileName = `${reportId}.csv`;
        const filePath = path.join(this.reportsDir, fileName);
        await fs.writeFile(filePath, csvContent, 'utf-8');
        return filePath;
    }
    getDefaultHTMLTemplate() {
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
    async getReportFile(reportId) {
        const possibleExtensions = ['pdf', 'xlsx', 'csv'];
        for (const ext of possibleExtensions) {
            const filePath = path.join(this.reportsDir, `${reportId}.${ext}`);
            try {
                await fs.access(filePath);
                return filePath;
            }
            catch {
                continue;
            }
        }
        return null;
    }
    async cleanupOldReports(olderThanDays = 7) {
        try {
            const files = await fs.readdir(this.reportsDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            for (const file of files) {
                const filePath = path.join(this.reportsDir, file);
                const stats = await fs.stat(filePath);
                if (stats.mtime < cutoffDate) {
                    await fs.unlink(filePath);
                    logger_1.default.info('Cleaned up old report file', { file });
                }
            }
        }
        catch (error) {
            logger_1.default.error('Error cleaning up old reports', { error });
        }
    }
}
exports.ReportService = ReportService;
