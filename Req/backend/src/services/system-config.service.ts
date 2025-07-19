import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Schema de validación para configuración del sistema
const SystemConfigSchema = z.object({
  siteName: z.string().min(1, 'El nombre del sitio es requerido'),
  siteDescription: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(true),
  maxFileUploadSize: z.number().min(1).max(100), // MB
  sessionTimeout: z.number().min(5).max(1440), // minutos
  emailNotifications: z.boolean().default(true),
  backupRetentionDays: z.number().min(1).max(365).default(30),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  maxLoginAttempts: z.number().min(1).max(10).default(5),
  passwordMinLength: z.number().min(6).max(50).default(8),
  requirePasswordComplexity: z.boolean().default(true),
});

interface SystemConfig {
  siteName: string;
  siteDescription?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  emailNotifications: boolean;
  backupRetentionDays: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLoginAttempts: number;
  passwordMinLength: number;
  requirePasswordComplexity: boolean;
}

interface DatabaseBackup {
  id: string;
  filename: string;
  description?: string;
  size: number;
  createdBy: string;
  createdAt: Date;
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  databaseStats: {
    totalTables: number;
    totalRecords: number;
    databaseSize: number;
  };
  activeUsers: number;
  requestsPerMinute: number;
}

export class SystemConfigService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtener configuración del sistema
   */
  async getSystemConfig(): Promise<SystemConfig> {
    try {
      // En una implementación real, esto vendría de la base de datos
      // Por ahora, devolvemos valores por defecto
      const defaultConfig: SystemConfig = {
        siteName: 'Sistema de Gestión #040',
        siteDescription: 'Sistema integral de gestión de datos y procesos',
        maintenanceMode: false,
        allowRegistration: true,
        maxFileUploadSize: 10,
        sessionTimeout: 60,
        emailNotifications: true,
        backupRetentionDays: 30,
        logLevel: 'info',
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requirePasswordComplexity: true,
      };

      return defaultConfig;
    } catch (error) {
      throw new Error(`Error al obtener configuración del sistema: ${error}`);
    }
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateSystemConfig(configData: Partial<SystemConfig>, updatedBy: string): Promise<SystemConfig> {
    try {
      // Validar datos de entrada
      const validatedConfig = SystemConfigSchema.partial().parse(configData);

      // En una implementación real, esto se guardaría en la base de datos
      // Por ahora, simulamos la actualización
      const currentConfig = await this.getSystemConfig();
      const updatedConfig = { ...currentConfig, ...validatedConfig };

      // Registrar cambio en auditoría
      await this.prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'UPDATE_SYSTEM_CONFIG',
          resourceType: 'SYSTEM_CONFIG',
          resourceId: 'system',
          newValues: validatedConfig,
          ipAddress: '127.0.0.1', // En una implementación real, obtener IP real
          userAgent: 'System',
        },
      });

      return updatedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Configuración no válida: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Error al actualizar configuración del sistema: ${error}`);
    }
  }

  /**
   * Crear respaldo de base de datos
   */
  async createDatabaseBackup(description?: string, createdBy: string = 'system'): Promise<DatabaseBackup> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const backupPath = path.join(process.cwd(), 'backups', filename);

      // Crear directorio de respaldos si no existe
      await fs.mkdir(path.dirname(backupPath), { recursive: true });

      // En una implementación real con PostgreSQL, usarías pg_dump
      // Por ahora, creamos un archivo simulado
      const backupContent = `-- Database backup created at ${new Date().toISOString()}\n-- Description: ${description || 'Automated backup'}\n`;
      await fs.writeFile(backupPath, backupContent);

      const stats = await fs.stat(backupPath);

      const backup: DatabaseBackup = {
        id: `backup-${Date.now()}`,
        filename,
        description,
        size: stats.size,
        createdBy,
        createdAt: new Date(),
      };

      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'CREATE_DATABASE_BACKUP',
          resourceType: 'DATABASE_BACKUP',
          resourceId: backup.id,
          newValues: { filename, description, size: backup.size },
          ipAddress: '127.0.0.1',
          userAgent: 'System',
        },
      });

      return backup;
    } catch (error) {
      throw new Error(`Error al crear respaldo de base de datos: ${error}`);
    }
  }

  /**
   * Obtener lista de respaldos
   */
  async getDatabaseBackups(page: number = 1, limit: number = 10): Promise<{
    backups: DatabaseBackup[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const backupsDir = path.join(process.cwd(), 'backups');

      try {
        await fs.access(backupsDir);
      } catch {
        // Si no existe el directorio, devolver lista vacía
        return {
          backups: [],
          total: 0,
          page,
          totalPages: 0,
        };
      }

      const files = await fs.readdir(backupsDir);
      const backupFiles = files.filter(file => file.endsWith('.sql'));

      const backups: DatabaseBackup[] = [];
      for (const file of backupFiles) {
        const filePath = path.join(backupsDir, file);
        const stats = await fs.stat(filePath);

        backups.push({
          id: file.replace('.sql', ''),
          filename: file,
          size: stats.size,
          createdBy: 'system', // En una implementación real, obtener del registro
          createdAt: stats.birthtime,
        });
      }

      // Ordenar por fecha de creación (más reciente primero)
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = backups.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedBackups = backups.slice(startIndex, startIndex + limit);

      return {
        backups: paginatedBackups,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Error al obtener respaldos: ${error}`);
    }
  }

  /**
   * Restaurar respaldo de base de datos
   */
  async restoreDatabaseBackup(backupId: string, restoredBy: string): Promise<void> {
    try {
      const backupPath = path.join(process.cwd(), 'backups', `${backupId}.sql`);

      try {
        await fs.access(backupPath);
      } catch {
        throw new Error('Respaldo no encontrado');
      }

      // En una implementación real, ejecutarías el script SQL
      // Por ahora, solo simulamos la restauración
      console.log(`Simulando restauración de respaldo: ${backupPath}`);

      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          userId: restoredBy,
          action: 'RESTORE_DATABASE_BACKUP',
          resourceType: 'DATABASE_BACKUP',
          resourceId: backupId,
          newValues: { backupId },
          ipAddress: '127.0.0.1',
          userAgent: 'System',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener logs del sistema
   */
  async getSystemLogs(options: {
    page: number;
    limit: number;
    level?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    logs: SystemLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page, limit, level, startDate, endDate } = options;

      // En una implementación real, esto vendría de un sistema de logging como Winston
      // Por ahora, generamos logs simulados
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          level: 'info',
          message: 'Sistema iniciado correctamente',
          metadata: { component: 'server' },
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          level: 'warn',
          message: 'Intento de login fallido',
          metadata: { ip: '192.168.1.100', email: 'test@example.com' },
          timestamp: new Date(Date.now() - 1800000),
        },
        {
          id: '3',
          level: 'error',
          message: 'Error de conexión a base de datos',
          metadata: { error: 'Connection timeout' },
          timestamp: new Date(Date.now() - 900000),
        },
        {
          id: '4',
          level: 'info',
          message: 'Usuario creado exitosamente',
          metadata: { userId: 'user-123', email: 'nuevo@example.com' },
          timestamp: new Date(Date.now() - 300000),
        },
      ];

      let filteredLogs = mockLogs;

      // Filtrar por nivel si se especifica
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }

      // Filtrar por rango de fechas
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
      }
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
      }

      const total = filteredLogs.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);

      return {
        logs: paginatedLogs,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Error al obtener logs del sistema: ${error}`);
    }
  }

  /**
   * Obtener métricas del sistema
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // En una implementación real, obtendrías métricas reales del sistema
      const metrics: SystemMetrics = {
        uptime: process.uptime(),
        memoryUsage: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        },
        diskUsage: {
          used: 5000, // MB simulado
          total: 10000, // MB simulado
          percentage: 50,
        },
        databaseStats: {
          totalTables: 10,
          totalRecords: await this.getTotalRecordsCount(),
          databaseSize: 250, // MB simulado
        },
        activeUsers: await this.getActiveUsersCount(),
        requestsPerMinute: Math.floor(Math.random() * 100) + 50, // Simulado
      };

      return metrics;
    } catch (error) {
      throw new Error(`Error al obtener métricas del sistema: ${error}`);
    }
  }

  /**
   * Limpiar logs antiguos
   */
  async cleanupOldLogs(days: number = 30): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // En una implementación real, eliminarías logs de la base de datos o archivos
      // Por ahora, simulamos la limpieza
      const deletedCount = Math.floor(Math.random() * 100) + 10;

      return { deletedCount };
    } catch (error) {
      throw new Error(`Error al limpiar logs antiguos: ${error}`);
    }
  }

  /**
   * Obtener conteo total de registros
   */
  private async getTotalRecordsCount(): Promise<number> {
    try {
      const userCount = await this.prisma.user.count();
      const dataRecordCount = await this.prisma.dataRecord.count();
      const auditLogCount = await this.prisma.auditLog.count();

      return userCount + dataRecordCount + auditLogCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtener conteo de usuarios activos
   */
  private async getActiveUsersCount(): Promise<number> {
    try {
      const activeUsers = await this.prisma.user.count({
        where: {
          isActive: true,
        },
      });

      return activeUsers;
    } catch (error) {
      return 0;
    }
  }
}
