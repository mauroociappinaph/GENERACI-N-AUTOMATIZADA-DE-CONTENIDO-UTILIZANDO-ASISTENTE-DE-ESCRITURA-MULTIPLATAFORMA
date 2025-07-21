import { ESLintErrorParser } from '../error-parser';
import { ESLintReport } from '../types';

describe('ESLintErrorParser', () => {
  let parser: ESLintErrorParser;

  beforeEach(() => {
    parser = new ESLintErrorParser();
  });

  const mockReport: ESLintReport = {
    results: [
      {
        filePath: '/test/file1.ts',
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any. Specify a different type.',
            line: 10,
            column: 5,
            fix: {
              range: [100, 103],
              text: 'string',
            },
          },
          {
            ruleId: 'prefer-const',
            severity: 1,
            message: "'x' is never reassigned. Use 'const' instead of 'let'.",
            line: 15,
            column: 1,
            fix: {
              range: [200, 203],
              text: 'const',
            },
          },
        ],
        errorCount: 1,
        warningCount: 1,
        fixableErrorCount: 1,
        fixableWarningCount: 1,
      },
      {
        filePath: '/test/file2.ts',
        messages: [
          {
            ruleId: 'no-unused-vars',
            severity: 2,
            message: "'unused' is defined but never used.",
            line: 5,
            column: 7,
          },
        ],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ],
    errorCount: 2,
    warningCount: 1,
    fixableErrorCount: 1,
    fixableWarningCount: 1,
  };

  describe('parseReport', () => {
    it('should parse ESLint report into structured errors', () => {
      const errors = parser.parseReport(mockReport);

      expect(errors).toHaveLength(3);

      expect(errors[0]).toEqual({
        file: '/test/file1.ts',
        rule: '@typescript-eslint/no-explicit-any',
        message: 'Unexpected any. Specify a different type.',
        line: 10,
        column: 5,
        severity: 'error',
        fixable: true,
        category: 'problem',
      });

      expect(errors[1]).toEqual({
        file: '/test/file1.ts',
        rule: 'prefer-const',
        message: "'x' is never reassigned. Use 'const' instead of 'let'.",
        line: 15,
        column: 1,
        severity: 'warning',
        fixable: true,
        category: 'suggestion',
      });

      expect(errors[2]).toEqual({
        file: '/test/file2.ts',
        rule: 'no-unused-vars',
        message: "'unused' is defined but never used.",
        line: 5,
        column: 7,
        severity: 'error',
        fixable: false,
        category: 'problem',
      });
    });
  });

  describe('generateSummary', () => {
    it('should generate comprehensive error summary', () => {
      const summary = parser.generateSummary(mockReport);

      expect(summary).toEqual({
        totalErrors: 2,
        totalWarnings: 1,
        fixableErrors: 1,
        fixableWarnings: 1,
        fileCount: 2,
        errorsByRule: {
          '@typescript-eslint/no-explicit-any': 1,
          'prefer-const': 1,
          'no-unused-vars': 1,
        },
        errorsByFile: {
          '/test/file1.ts': 2,
          '/test/file2.ts': 1,
        },
        categories: {
          style: 0,
          error: 0,
          suggestion: 1,
          layout: 0,
          problem: 2,
        },
      });
    });
  });

  describe('filterBySeverity', () => {
    it('should filter errors by severity', () => {
      const errors = parser.parseReport(mockReport);

      const errorSeverity = parser.filterBySeverity(errors, 'error');
      const warningSeverity = parser.filterBySeverity(errors, 'warning');

      expect(errorSeverity).toHaveLength(2);
      expect(warningSeverity).toHaveLength(1);
      expect(warningSeverity[0].rule).toBe('prefer-const');
    });
  });

  describe('filterFixable', () => {
    it('should filter fixable errors', () => {
      const errors = parser.parseReport(mockReport);
      const fixable = parser.filterFixable(errors);

      expect(fixable).toHaveLength(2);
      expect(fixable.every(error => error.fixable)).toBe(true);
    });
  });

  describe('groupByFile', () => {
    it('should group errors by file', () => {
      const errors = parser.parseReport(mockReport);
      const grouped = parser.groupByFile(errors);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['/test/file1.ts']).toHaveLength(2);
      expect(grouped['/test/file2.ts']).toHaveLength(1);
    });
  });

  describe('groupByRule', () => {
    it('should group errors by rule', () => {
      const errors = parser.parseReport(mockReport);
      const grouped = parser.groupByRule(errors);

      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped['@typescript-eslint/no-explicit-any']).toHaveLength(1);
      expect(grouped['prefer-const']).toHaveLength(1);
      expect(grouped['no-unused-vars']).toHaveLength(1);
    });
  });

  describe('generateReport', () => {
    it('should generate human-readable report', () => {
      const errors = parser.parseReport(mockReport);
      const summary = parser.generateSummary(mockReport);
      const report = parser.generateReport(errors, summary);

      expect(report).toContain('ESLint Error Report');
      expect(report).toContain('Total Issues: 3');
      expect(report).toContain('Errors: 2');
      expect(report).toContain('Warnings: 1');
      expect(report).toContain('Fixable: 2');
      expect(report).toContain('/test/file1.ts (2 issues)');
      expect(report).toContain('/test/file2.ts (1 issues)');
      expect(report).toContain('Most Common Rules:');
    });
  });

  describe('categorizeRule', () => {
    it('should categorize TypeScript rules correctly', () => {
      const errors = parser.parseReport(mockReport);

      const anyError = errors.find(e => e.rule === '@typescript-eslint/no-explicit-any');
      const constError = errors.find(e => e.rule === 'prefer-const');
      const unusedError = errors.find(e => e.rule === 'no-unused-vars');

      expect(anyError?.category).toBe('problem');
      expect(constError?.category).toBe('suggestion');
      expect(unusedError?.category).toBe('problem');
    });

    it('should categorize style rules correctly', () => {
      const styleReport: ESLintReport = {
        results: [{
          filePath: '/test/style.ts',
          messages: [{
            ruleId: 'indent',
            severity: 1,
            message: 'Expected indentation of 2 spaces',
            line: 1,
            column: 1,
          }],
          errorCount: 0,
          warningCount: 1,
          fixableErrorCount: 0,
          fixableWarningCount: 1,
        }],
        errorCount: 0,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 1,
      };

      const errors = parser.parseReport(styleReport);
      expect(errors[0].category).toBe('style');
    });
  });
});
