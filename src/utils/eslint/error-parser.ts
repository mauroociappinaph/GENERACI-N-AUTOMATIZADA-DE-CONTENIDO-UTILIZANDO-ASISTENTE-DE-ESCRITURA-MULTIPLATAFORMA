import { ESLintError, ESLintResult, ESLintReport } from './types';

export interface ParsedError {
  file: string;
  rule: string;
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  fixable: boolean;
  category: 'style' | 'error' | 'suggestion' | 'layout' | 'problem';
}

export interface ErrorSummary {
  totalErrors: number;
  totalWarnings: number;
  fixableErrors: number;
  fixableWarnings: number;
  fileCount: number;
  errorsByRule: Record<string, number>;
  errorsByFile: Record<string, number>;
  categories: Record<string, number>;
}

export class ESLintErrorParser {
  /**
   * Parse ESLint report into structured error information
   */
  parseReport(report: ESLintReport): ParsedError[] {
    const errors: ParsedError[] = [];

    report.results.forEach(result => {
      result.messages.forEach(message => {
        errors.push(this.parseError(result.filePath, message));
      });
    });

    return errors;
  }

  /**
   * Generate error summary from report
   */
  generateSummary(report: ESLintReport): ErrorSummary {
    const summary: ErrorSummary = {
      totalErrors: report.errorCount,
      totalWarnings: report.warningCount,
      fixableErrors: report.fixableErrorCount,
      fixableWarnings: report.fixableWarningCount,
      fileCount: report.results.length,
      errorsByRule: {},
      errorsByFile: {},
      categories: {
        style: 0,
        error: 0,
        suggestion: 0,
        layout: 0,
        problem: 0,
      },
    };

    report.results.forEach(result => {
      if (result.messages.length > 0) {
        summary.errorsByFile[result.filePath] = result.messages.length;
      }

      result.messages.forEach(message => {
        const ruleId = message.ruleId || 'unknown';
        summary.errorsByRule[ruleId] = (summary.errorsByRule[ruleId] || 0) + 1;

        const category = this.categorizeRule(ruleId);
        summary.categories[category]++;
      });
    });

    return summary;
  }

  /**
   * Filter errors by severity
   */
  filterBySeverity(errors: ParsedError[], severity: 'error' | 'warning'): ParsedError[] {
    return errors.filter(error => error.severity === severity);
  }

  /**
   * Filter fixable errors
   */
  filterFixable(errors: ParsedError[]): ParsedError[] {
    return errors.filter(error => error.fixable);
  }

  /**
   * Group errors by file
   */
  groupByFile(errors: ParsedError[]): Record<string, ParsedError[]> {
    return errors.reduce((groups, error) => {
      if (!groups[error.file]) {
        groups[error.file] = [];
      }
      groups[error.file].push(error);
      return groups;
    }, {} as Record<string, ParsedError[]>);
  }

  /**
   * Group errors by rule
   */
  groupByRule(errors: ParsedError[]): Record<string, ParsedError[]> {
    return errors.reduce((groups, error) => {
      if (!groups[error.rule]) {
        groups[error.rule] = [];
      }
      groups[error.rule].push(error);
      return groups;
    }, {} as Record<string, ParsedError[]>);
  }

  /**
   * Generate human-readable error report
   */
  generateReport(errors: ParsedError[], summary: ErrorSummary): string {
    const lines: string[] = [];

    lines.push('ESLint Error Report');
    lines.push('==================');
    lines.push('');

    // Summary
    lines.push(`Total Issues: ${summary.totalErrors + summary.totalWarnings}`);
    lines.push(`  Errors: ${summary.totalErrors}`);
    lines.push(`  Warnings: ${summary.totalWarnings}`);
    lines.push(`  Fixable: ${summary.fixableErrors + summary.fixableWarnings}`);
    lines.push(`Files with issues: ${summary.fileCount}`);
    lines.push('');

    // Top rules
    const topRules = Object.entries(summary.errorsByRule)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    if (topRules.length > 0) {
      lines.push('Most Common Rules:');
      topRules.forEach(([rule, count]) => {
        lines.push(`  ${rule}: ${count} issues`);
      });
      lines.push('');
    }

    // Errors by file
    const errorsByFile = this.groupByFile(errors);
    Object.entries(errorsByFile).forEach(([file, fileErrors]) => {
      lines.push(`${file} (${fileErrors.length} issues):`);
      fileErrors.forEach(error => {
        const severity = error.severity === 'error' ? 'ERROR' : 'WARN';
        const fixable = error.fixable ? ' [fixable]' : '';
        lines.push(`  ${error.line}:${error.column} ${severity} ${error.message} (${error.rule})${fixable}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Parse individual ESLint error message
   */
  private parseError(filePath: string, message: ESLintError): ParsedError {
    return {
      file: filePath,
      rule: message.ruleId || 'unknown',
      message: message.message,
      line: message.line,
      column: message.column,
      severity: message.severity === 2 ? 'error' : 'warning',
      fixable: !!message.fix,
      category: this.categorizeRule(message.ruleId || 'unknown'),
    };
  }

  /**
   * Categorize ESLint rule by type
   */
  private categorizeRule(ruleId: string): 'style' | 'error' | 'suggestion' | 'layout' | 'problem' {
    // TypeScript rules
    if (ruleId.startsWith('@typescript-eslint/')) {
      const rule = ruleId.replace('@typescript-eslint/', '');
      if (['no-explicit-any', 'explicit-function-return-type', 'no-unsafe-assignment'].includes(rule)) {
        return 'problem';
      }
      if (['prefer-const', 'no-unused-vars'].includes(rule)) {
        return 'suggestion';
      }
      return 'error';
    }

    // Style rules
    const styleRules = [
      'indent', 'quotes', 'semi', 'comma-dangle', 'trailing-comma',
      'space-before-function-paren', 'object-curly-spacing'
    ];
    if (styleRules.includes(ruleId)) {
      return 'style';
    }

    // Layout rules
    const layoutRules = [
      'max-len', 'linebreak-style', 'eol-last', 'no-multiple-empty-lines'
    ];
    if (layoutRules.includes(ruleId)) {
      return 'layout';
    }

    // Problem rules
    const problemRules = [
      'no-undef', 'no-unused-vars', 'no-redeclare', 'no-unreachable'
    ];
    if (problemRules.includes(ruleId)) {
      return 'problem';
    }

    // Suggestion rules
    const suggestionRules = [
      'prefer-const', 'no-var', 'prefer-arrow-callback'
    ];
    if (suggestionRules.includes(ruleId)) {
      return 'suggestion';
    }

    return 'error';
  }
}
