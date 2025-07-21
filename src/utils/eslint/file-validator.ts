import fs from 'fs/promises';
import path from 'path';
import { FileValidationResult } from './types';

export class FileValidator {
  private readonly backupDir: string;

  constructor(backupDir: string = '.eslint-backups') {
    this.backupDir = backupDir;
  }

  /**
   * Validate that files exist and are accessible
   */
  async validateFiles(files: string[]): Promise<Record<string, FileValidationResult>> {
    const results: Record<string, FileValidationResult> = {};

    for (const file of files) {
      results[file] = await this.validateFile(file);
    }

    return results;
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath: string): Promise<FileValidationResult> {
    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return {
          isValid: false,
          exists: true,
          isReadable: false,
          isWritable: false,
          error: 'Path is not a file',
        };
      }

      // Check if file is readable
      let isReadable = true;
      try {
        await fs.access(filePath, fs.constants.R_OK);
      } catch {
        isReadable = false;
      }

      // Check if file is writable
      let isWritable = true;
      try {
        await fs.access(filePath, fs.constants.W_OK);
      } catch {
        isWritable = false;
      }

      return {
        isValid: isReadable && isWritable,
        exists: true,
        isReadable,
        isWritable,
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          isValid: false,
          exists: false,
          isReadable: false,
          isWritable: false,
          error: 'File does not exist',
        };
      }

      return {
        isValid: false,
        exists: true,
        isReadable: false,
        isWritable: false,
        error: error.message,
      };
    }
  }

  /**
   * Create backup of files before modification
   */
  async createBackups(files: string[]): Promise<Record<string, string>> {
    const backups: Record<string, string> = {};

    // Ensure backup directory exists
    await this.ensureBackupDir();

    for (const file of files) {
      try {
        const validation = await this.validateFile(file);
        if (!validation.exists || !validation.isReadable) {
          continue;
        }

        const backupPath = await this.createBackup(file);
        backups[file] = backupPath;
      } catch (error) {
        console.warn(`Failed to create backup for ${file}:`, error);
      }
    }

    return backups;
  }

  /**
   * Create backup of a single file
   */
  async createBackup(filePath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupFileName = `${fileName}.${timestamp}.backup`;
    const backupPath = path.join(this.backupDir, backupFileName);

    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  /**
   * Restore files from backup
   */
  async restoreFromBackup(backups: Record<string, string>): Promise<void> {
    for (const [originalFile, backupPath] of Object.entries(backups)) {
      try {
        await fs.copyFile(backupPath, originalFile);
      } catch (error) {
        console.error(`Failed to restore ${originalFile} from backup:`, error);
      }
    }
  }

  /**
   * Clean up old backup files
   */
  async cleanupBackups(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith('.backup')) {
          continue;
        }

        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup backups:', error);
    }
  }

  /**
   * Filter files by extension
   */
  filterByExtension(files: string[], extensions: string[]): string[] {
    const extSet = new Set(extensions.map(ext => ext.toLowerCase()));

    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extSet.has(ext);
    });
  }

  /**
   * Get TypeScript and JavaScript files
   */
  getCodeFiles(files: string[]): string[] {
    return this.filterByExtension(files, ['.ts', '.tsx', '.js', '.jsx']);
  }

  /**
   * Check if file should be processed by ESLint
   */
  shouldProcessFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];

    if (!codeExtensions.includes(ext)) {
      return false;
    }

    // Skip node_modules
    if (filePath.includes('node_modules')) {
      return false;
    }

    // Skip build directories
    const skipDirs = ['build', 'dist', 'coverage', '.next'];
    for (const dir of skipDirs) {
      if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}
