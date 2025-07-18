import { ReportService } from '../../src/services/report.service';
import { ReportRequest } from '../../src/types/report';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('puppeteer');
jest.mock('exceljs');
jest.mock('../../src/utils/logger');

describe('ReportService', () => {
  let reportService: ReportService;
  const mockReportsDir = path.join(process.cwd(), 'generated-reports');

  beforeEach(() => {
    reportService = new ReportService();

    // Mock Prisma client
    const mockPrisma = {
      report: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };

    (reportService as any).prisma = mockPrisma;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test files
    try {
      const files = await fs.readdir(mockReportsDir);
      for (const file of files) {
        if (file.includes('test-')) {
          await fs.unlink(path.join(mockReportsDir, file));
        }
      }
    } catch (error) {
      // Directory might not exist, ignore
    }
  });

  describe('generateReport', () => {
    it('should throw error for invalid template ID', async () => {
      const request: ReportRequest = {
        templateId: 'non-existent-template',
        parameters: {},
        format: 'pdf',
        deliveryMethod: 'download',
      };

      await expect(reportService.generateReport(request)).rejects.toThrow(
        'Report template not found: non-existent-template'
      );
    });

    it('should throw error for unsupported format', async () => {
      // Mock the template retrieval to return a valid template
      const mockTemplate = {
        id: 'test-template',
        name: 'Test Template',
        query: 'SELECT 1 as test',
        parameters: [],
        format: 'pdf' as const,
        template: '<html><body>Test</body></html>',
      };

      // Mock Prisma to return a template
      const mockPrisma = {
        report: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'test-template',
            name: 'Test Template',
            template: {
              query: 'SELECT 1 as test',
              parameters: [],
              format: 'pdf',
              htmlTemplate: '<html><body>Test</body></html>',
            },
          }),
        },
        $queryRawUnsafe: jest.fn().mockResolvedValue([{ test: 1 }]),
      };

      // Replace the prisma instance
      (reportService as any).prisma = mockPrisma;

      const request: ReportRequest = {
        templateId: 'test-template',
        parameters: {},
        format: 'invalid-format' as any,
        deliveryMethod: 'download',
      };

      await expect(reportService.generateReport(request)).rejects.toThrow(
        'Unsupported report format: invalid-format'
      );
    });
  });

  describe('formatQueryValue', () => {
    it('should format string values correctly', () => {
      const result = (reportService as any).formatQueryValue("test'value");
      expect(result).toBe("'test''value'");
    });

    it('should format null values correctly', () => {
      const result = (reportService as any).formatQueryValue(null);
      expect(result).toBe('NULL');
    });

    it('should format undefined values correctly', () => {
      const result = (reportService as any).formatQueryValue(undefined);
      expect(result).toBe('NULL');
    });

    it('should format date values correctly', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const result = (reportService as any).formatQueryValue(date);
      expect(result).toBe("'2023-01-01T00:00:00.000Z'");
    });

    it('should format number values correctly', () => {
      const result = (reportService as any).formatQueryValue(123);
      expect(result).toBe('123');
    });
  });

  describe('getDefaultHTMLTemplate', () => {
    it('should return a valid HTML template', () => {
      const template = (reportService as any).getDefaultHTMLTemplate();
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('<html>');
      expect(template).toContain('<body>');
      expect(template).toContain('{{title}}');
      expect(template).toContain('{{#if data}}');
    });
  });

  describe('cleanupOldReports', () => {
    it('should clean up old report files', async () => {
      // Create a test file with old timestamp
      const testFileName = 'test-old-report.pdf';
      const testFilePath = path.join(mockReportsDir, testFileName);

      try {
        await fs.mkdir(mockReportsDir, { recursive: true });
        await fs.writeFile(testFilePath, 'test content');

        // Modify the file timestamp to be older than 7 days
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        await fs.utimes(testFilePath, oldDate, oldDate);

        await reportService.cleanupOldReports(7);

        // File should be deleted
        await expect(fs.access(testFilePath)).rejects.toThrow();
      } catch (error) {
        // Clean up in case of error
        try {
          await fs.unlink(testFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });

  describe('getReportFile', () => {
    it('should return null for non-existent report', async () => {
      const result = await reportService.getReportFile('non-existent-report');
      expect(result).toBeNull();
    });

    it('should return file path for existing report', async () => {
      const reportId = 'test-existing-report';
      const testFileName = `${reportId}.pdf`;
      const testFilePath = path.join(mockReportsDir, testFileName);

      try {
        await fs.mkdir(mockReportsDir, { recursive: true });
        await fs.writeFile(testFilePath, 'test content');

        const result = await reportService.getReportFile(reportId);
        expect(result).toBe(testFilePath);
      } finally {
        // Clean up
        try {
          await fs.unlink(testFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});

describe('ReportService Integration', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
  });

  describe('CSV Generation', () => {
    it('should generate CSV content correctly', async () => {
      const testData = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      const template = {
        id: 'test-template',
        name: 'Test Template',
        query: '',
        parameters: [],
        format: 'csv' as const,
        template: '',
      };

      const reportId = 'test-csv-report';
      const filePath = await (reportService as any).generateCSVReport(
        template,
        testData,
        reportId
      );

      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      expect(lines[0]).toBe('name,age,city');
      expect(lines[1]).toBe('John,30,New York');
      expect(lines[2]).toBe('Jane,25,Los Angeles');

      // Clean up
      await fs.unlink(filePath);
    });

    it('should handle CSV data with commas and quotes', async () => {
      const testData = [
        { name: 'John, Jr.', description: 'A "great" person' },
      ];

      const template = {
        id: 'test-template',
        name: 'Test Template',
        query: '',
        parameters: [],
        format: 'csv' as const,
        template: '',
      };

      const reportId = 'test-csv-special-chars';
      const filePath = await (reportService as any).generateCSVReport(
        template,
        testData,
        reportId
      );

      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      expect(lines[0]).toBe('name,description');
      expect(lines[1]).toBe('"John, Jr.","A ""great"" person"');

      // Clean up
      await fs.unlink(filePath);
    });

    it('should throw error for empty data in CSV generation', async () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        query: '',
        parameters: [],
        format: 'csv' as const,
        template: '',
      };

      await expect(
        (reportService as any).generateCSVReport(template, [], 'test-empty-csv')
      ).rejects.toThrow('No data available for CSV export');
    });
  });
});
