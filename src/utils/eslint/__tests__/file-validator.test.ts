import { FileValidator } from '../file-validator';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('FileValidator', () => {
  let validator: FileValidator;
  const mockBackupDir = '.test-backups';

  beforeEach(() => {
    validator = new FileValidator(mockBackupDir);
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate existing readable and writable file', async () => {
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
      } as any);
      mockFs.access.mockResolvedValue(undefined);

      const result = await validator.validateFile('/test/file.ts');

      expect(result).toEqual({
        isValid: true,
        exists: true,
        isReadable: true,
        isWritable: true,
      });
    });

    it('should handle non-existent file', async () => {
      const error = new Error('File not found') as any;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);

      const result = await validator.validateFile('/test/nonexistent.ts');

      expect(result).toEqual({
        isValid: false,
        exists: false,
        isReadable: false,
        isWritable: false,
        error: 'File does not exist',
      });
    });

    it('should handle directory instead of file', async () => {
      mockFs.stat.mockResolvedValue({
        isFile: () => false,
      } as any);

      const result = await validator.validateFile('/test/directory');

      expect(result).toEqual({
        isValid: false,
        exists: true,
        isReadable: false,
        isWritable: false,
        error: 'Path is not a file',
      });
    });

    it('should handle read-only file', async () => {
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
      } as any);
      mockFs.access
        .mockResolvedValueOnce(undefined) // R_OK succeeds
        .mockRejectedValueOnce(new Error('Permission denied')); // W_OK fails

      const result = await validator.validateFile('/test/readonly.ts');

      expect(result).toEqual({
        isValid: false,
        exists: true,
        isReadable: true,
        isWritable: false,
      });
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple files', async () => {
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
      } as any);
      mockFs.access.mockResolvedValue(undefined);

      const files = ['/test/file1.ts', '/test/file2.ts'];
      const results = await validator.validateFiles(files);

      expect(Object.keys(results)).toHaveLength(2);
      expect(results['/test/file1.ts'].isValid).toBe(true);
      expect(results['/test/file2.ts'].isValid).toBe(true);
    });
  });

  describe('createBackups', () => {
    it('should create backups for valid files', async () => {
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
      } as any);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      const files = ['/test/file1.ts', '/test/file2.ts'];
      const backups = await validator.createBackups(files);

      expect(Object.keys(backups)).toHaveLength(2);
      expect(backups['/test/file1.ts']).toMatch(/\.backup$/);
      expect(backups['/test/file2.ts']).toMatch(/\.backup$/);
      expect(mockFs.copyFile).toHaveBeenCalledTimes(2);
    });

    it('should skip invalid files', async () => {
      const error = new Error('File not found') as any;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);
      mockFs.mkdir.mockResolvedValue(undefined);

      const files = ['/test/nonexistent.ts'];
      const backups = await validator.createBackups(files);

      expect(Object.keys(backups)).toHaveLength(0);
      expect(mockFs.copyFile).not.toHaveBeenCalled();
    });
  });

  describe('createBackup', () => {
    it('should create backup with timestamp', async () => {
      mockFs.copyFile.mockResolvedValue(undefined);

      const backupPath = await validator.createBackup('/test/file.ts');

      expect(backupPath).toMatch(/\.test-backups\/file\.ts\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.*\.backup$/);
      expect(mockFs.copyFile).toHaveBeenCalledWith('/test/file.ts', backupPath);
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore files from backup', async () => {
      mockFs.copyFile.mockResolvedValue(undefined);

      const backups = {
        '/test/file1.ts': '/backups/file1.ts.backup',
        '/test/file2.ts': '/backups/file2.ts.backup',
      };

      await validator.restoreFromBackup(backups);

      expect(mockFs.copyFile).toHaveBeenCalledWith('/backups/file1.ts.backup', '/test/file1.ts');
      expect(mockFs.copyFile).toHaveBeenCalledWith('/backups/file2.ts.backup', '/test/file2.ts');
    });

    it('should handle restore failures gracefully', async () => {
      mockFs.copyFile.mockRejectedValue(new Error('Restore failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const backups = {
        '/test/file1.ts': '/backups/file1.ts.backup',
      };

      await validator.restoreFromBackup(backups);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to restore'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('cleanupBackups', () => {
    it('should remove old backup files', async () => {
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

      mockFs.readdir.mockResolvedValue([
        'old-file.ts.backup',
        'recent-file.ts.backup',
        'not-backup.txt',
      ] as any);

      mockFs.stat
        .mockResolvedValueOnce({ mtime: oldDate } as any)
        .mockResolvedValueOnce({ mtime: recentDate } as any);

      mockFs.unlink.mockResolvedValue(undefined);

      await validator.cleanupBackups();

      expect(mockFs.unlink).toHaveBeenCalledTimes(1);
      expect(mockFs.unlink).toHaveBeenCalledWith(
        path.join(mockBackupDir, 'old-file.ts.backup')
      );
    });

    it('should handle cleanup failures gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await validator.cleanupBackups();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to cleanup backups:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('filterByExtension', () => {
    it('should filter files by extension', () => {
      const files = [
        '/test/file1.ts',
        '/test/file2.js',
        '/test/file3.tsx',
        '/test/file4.txt',
        '/test/file5.jsx',
      ];

      const result = validator.filterByExtension(files, ['.ts', '.js']);

      expect(result).toEqual([
        '/test/file1.ts',
        '/test/file2.js',
      ]);
    });

    it('should handle case insensitive extensions', () => {
      const files = ['/test/file1.TS', '/test/file2.Js'];
      const result = validator.filterByExtension(files, ['.ts', '.js']);

      expect(result).toEqual([
        '/test/file1.TS',
        '/test/file2.Js',
      ]);
    });
  });

  describe('getCodeFiles', () => {
    it('should return TypeScript and JavaScript files', () => {
      const files = [
        '/test/file1.ts',
        '/test/file2.tsx',
        '/test/file3.js',
        '/test/file4.jsx',
        '/test/file5.txt',
        '/test/file6.css',
      ];

      const result = validator.getCodeFiles(files);

      expect(result).toEqual([
        '/test/file1.ts',
        '/test/file2.tsx',
        '/test/file3.js',
        '/test/file4.jsx',
      ]);
    });
  });

  describe('shouldProcessFile', () => {
    it('should process TypeScript and JavaScript files', () => {
      expect(validator.shouldProcessFile('/test/file.ts')).toBe(true);
      expect(validator.shouldProcessFile('/test/file.tsx')).toBe(true);
      expect(validator.shouldProcessFile('/test/file.js')).toBe(true);
      expect(validator.shouldProcessFile('/test/file.jsx')).toBe(true);
    });

    it('should skip non-code files', () => {
      expect(validator.shouldProcessFile('/test/file.txt')).toBe(false);
      expect(validator.shouldProcessFile('/test/file.css')).toBe(false);
      expect(validator.shouldProcessFile('/test/file.json')).toBe(false);
    });

    it('should skip node_modules', () => {
      expect(validator.shouldProcessFile('/test/node_modules/package/file.ts')).toBe(false);
    });

    it('should skip build directories', () => {
      expect(validator.shouldProcessFile('/test/build/file.ts')).toBe(false);
      expect(validator.shouldProcessFile('/test/dist/file.ts')).toBe(false);
      expect(validator.shouldProcessFile('/test/coverage/file.ts')).toBe(false);
      expect(validator.shouldProcessFile('/test/.next/file.ts')).toBe(false);
    });

    it('should handle Windows paths', () => {
      expect(validator.shouldProcessFile('C:\\test\\build\\file.ts')).toBe(false);
      expect(validator.shouldProcessFile('C:\\test\\src\\file.ts')).toBe(true);
    });
  });
});
