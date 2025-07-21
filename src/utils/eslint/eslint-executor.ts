import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { ESLintExecutionOptions, ESLintExecutionResult, ESLintReport } from './types';

const execAsync = promisify(exec);

export class ESLintExecutor {
  private readonly eslintPath: string;
  private readonly projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.eslintPath = path.join(projectRoot, 'node_modules', '.bin', 'eslint');
  }

  /**
   * Execute ESLint on specified files with optional auto-fix
   */
  async executeESLint(
    files: string | string[],
    options: ESLintExecutionOptions = {}
  ): Promise<ESLintExecutionResult> {
    try {
      const fileList = Array.isArray(files) ? files : [files];
      const args = this.buildESLintArgs(fileList, options);
      const command = `${this.eslintPath} ${args.join(' ')}`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      const report = this.parseESLintOutput(stdout);
      const fixedFiles = this.extractFixedFiles(stdout, options.fix);

      return {
        success: true,
        report,
        output: stdout,
        fixedFiles,
      };
    } catch (error: any) {
      // ESLint exits with code 1 when there are linting errors, but still provides output
      if (error.code === 1 && error.stdout) {
        const report = this.parseESLintOutput(error.stdout);
        const fixedFiles = this.extractFixedFiles(error.stdout, options.fix);

        return {
          success: false,
          report,
          output: error.stdout,
          error: error.stderr || 'ESLint found errors',
          fixedFiles,
        };
      }

      return {
        success: false,
        report: this.createEmptyReport(),
        output: '',
        error: error.message || 'Failed to execute ESLint',
        fixedFiles: [],
      };
    }
  }

  /**
   * Execute ESLint with auto-fix on specified files
   */
  async fixFiles(files: string | string[]): Promise<ESLintExecutionResult> {
    return this.executeESLint(files, { fix: true });
  }

  /**
   * Check files without fixing
   */
  async checkFiles(files: string | string[]): Promise<ESLintExecutionResult> {
    return this.executeESLint(files, { fix: false });
  }

  /**
   * Build ESLint command arguments
   */
  private buildESLintArgs(files: string[], options: ESLintExecutionOptions): string[] {
    const args: string[] = [];

    // Add format option for JSON output
    args.push('--format', 'json');

    // Add fix option if specified
    if (options.fix) {
      args.push('--fix');
    }

    // Add cache option if specified
    if (options.cache) {
      args.push('--cache');
      if (options.cacheLocation) {
        args.push('--cache-location', options.cacheLocation);
      }
    }

    // Add config file if specified
    if (options.configFile) {
      args.push('--config', options.configFile);
    }

    // Add quiet option if specified
    if (options.quiet) {
      args.push('--quiet');
    }

    // Add max warnings if specified
    if (options.maxWarnings !== undefined) {
      args.push('--max-warnings', options.maxWarnings.toString());
    }

    // Add files
    args.push(...files);

    return args;
  }

  /**
   * Parse ESLint JSON output into structured report
   */
  private parseESLintOutput(output: string): ESLintReport {
    try {
      if (!output.trim()) {
        return this.createEmptyReport();
      }

      const results = JSON.parse(output);

      // Calculate totals
      let errorCount = 0;
      let warningCount = 0;
      let fixableErrorCount = 0;
      let fixableWarningCount = 0;

      results.forEach((result: any) => {
        errorCount += result.errorCount || 0;
        warningCount += result.warningCount || 0;
        fixableErrorCount += result.fixableErrorCount || 0;
        fixableWarningCount += result.fixableWarningCount || 0;
      });

      return {
        results,
        errorCount,
        warningCount,
        fixableErrorCount,
        fixableWarningCount,
      };
    } catch (error) {
      console.warn('Failed to parse ESLint output:', error);
      return this.createEmptyReport();
    }
  }

  /**
   * Extract list of files that were fixed from ESLint output
   */
  private extractFixedFiles(output: string, fixEnabled?: boolean): string[] {
    if (!fixEnabled) {
      return [];
    }

    try {
      const results = JSON.parse(output);
      return results
        .filter((result: any) => result.output !== undefined)
        .map((result: any) => result.filePath);
    } catch (error) {
      return [];
    }
  }

  /**
   * Create empty report structure
   */
  private createEmptyReport(): ESLintReport {
    return {
      results: [],
      errorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  }
}
