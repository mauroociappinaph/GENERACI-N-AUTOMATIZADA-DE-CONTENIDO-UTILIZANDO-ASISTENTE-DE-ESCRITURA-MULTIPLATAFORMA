import { ESLintExecutor } from '../eslint-executor';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock child_process
jest.mock('child_process');
const mockExec = promisify(exec as jest.MockedFunction<typeof exec>);

describe('ESLintExecutor', () => {
  let executor: ESLintExecutor;
  const mockProjectRoot = '/test/project';

  beforeEach(() => {
    executor = new ESLintExecutor(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe('executeESLint', () => {
    it('should execute ESLint successfully with valid output', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [],
          errorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ]);

      (mockExec as jest.Mock).mockResolvedValue({
        stdout: mockOutput,
        stderr: '',
      });

      const result = await executor.executeESLint('test.ts');

      expect(result.success).toBe(true);
      expect(result.report.results).toHaveLength(1);
      expect(result.report.errorCount).toBe(0);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('eslint --format json test.ts'),
        expect.any(Object)
      );
    });

    it('should handle ESLint errors (exit code 1)', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: 'no-unused-vars',
              severity: 2,
              message: 'Variable is not used',
              line: 1,
              column: 1,
            },
          ],
          errorCount: 1,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ]);

      const error = new Error('ESLint found errors') as any;
      error.code = 1;
      error.stdout = mockOutput;
      error.stderr = '';

      (mockExec as jest.Mock).mockRejectedValue(error);

      const result = await executor.executeESLint('test.ts');

      expect(result.success).toBe(false);
      expect(result.report.results).toHaveLength(1);
      expect(result.report.errorCount).toBe(1);
      expect(result.error).toBe('ESLint found errors');
    });

    it('should handle execution failures', async () => {
      (mockExec as jest.Mock).mockRejectedValue(new Error('Command not found'));

      const result = await executor.executeESLint('test.ts');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Command not found');
      expect(result.report.results).toHaveLength(0);
    });

    it('should build correct arguments for fix option', async () => {
      (mockExec as jest.Mock).mockResolvedValue({
        stdout: JSON.stringify([]),
        stderr: '',
      });

      await executor.executeESLint('test.ts', { fix: true });

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--fix'),
        expect.any(Object)
      );
    });

    it('should handle multiple files', async () => {
      (mockExec as jest.Mock).mockResolvedValue({
        stdout: JSON.stringify([]),
        stderr: '',
      });

      await executor.executeESLint(['file1.ts', 'file2.ts']);

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('file1.ts file2.ts'),
        expect.any(Object)
      );
    });
  });

  describe('fixFiles', () => {
    it('should call executeESLint with fix option', async () => {
      const spy = jest.spyOn(executor, 'executeESLint').mockResolvedValue({
        success: true,
        report: { results: [], errorCount: 0, warningCount: 0, fixableErrorCount: 0, fixableWarningCount: 0 },
        output: '',
        fixedFiles: [],
      });

      await executor.fixFiles('test.ts');

      expect(spy).toHaveBeenCalledWith('test.ts', { fix: true });
    });
  });

  describe('checkFiles', () => {
    it('should call executeESLint without fix option', async () => {
      const spy = jest.spyOn(executor, 'executeESLint').mockResolvedValue({
        success: true,
        report: { results: [], errorCount: 0, warningCount: 0, fixableErrorCount: 0, fixableWarningCount: 0 },
        output: '',
        fixedFiles: [],
      });

      await executor.checkFiles('test.ts');

      expect(spy).toHaveBeenCalledWith('test.ts', { fix: false });
    });
  });

  describe('parseESLintOutput', () => {
    it('should handle empty output', async () => {
      (mockExec as jest.Mock).mockResolvedValue({
        stdout: '',
        stderr: '',
      });

      const result = await executor.executeESLint('test.ts');

      expect(result.report.results).toHaveLength(0);
      expect(result.report.errorCount).toBe(0);
    });

    it('should handle invalid JSON output', async () => {
      (mockExec as jest.Mock).mockResolvedValue({
        stdout: 'invalid json',
        stderr: '',
      });

      const result = await executor.executeESLint('test.ts');

      expect(result.report.results).toHaveLength(0);
    });
  });

  describe('extractFixedFiles', () => {
    it('should extract files with output property', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/file1.ts',
          messages: [],
          errorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
          output: 'fixed content',
        },
        {
          filePath: '/test/file2.ts',
          messages: [],
          errorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ]);

      (mockExec as jest.Mock).mockResolvedValue({
        stdout: mockOutput,
        stderr: '',
      });

      const result = await executor.executeESLint('test.ts', { fix: true });

      expect(result.fixedFiles).toEqual(['/test/file1.ts']);
    });
  });
});
