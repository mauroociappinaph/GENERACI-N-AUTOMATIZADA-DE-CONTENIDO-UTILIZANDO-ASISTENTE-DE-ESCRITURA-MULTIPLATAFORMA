import { PrismaClient } from '@prisma/client';
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
export declare class SystemConfigService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Obtener configuración del sistema
     */
    getSystemConfig(): Promise<SystemConfig>;
    /**
     * Actualizar configuración del sistema
     */
    updateSystemConfig(configData: Partial<SystemConfig>, updatedBy: string): Promise<SystemConfig>;
    /**
     * Crear respaldo de base de datos
     */
    createDatabaseBackup(description?: string, createdBy?: string): Promise<DatabaseBackup>;
    /**
     * Obtener lista de respaldos
     */
    getDatabaseBackups(page?: number, limit?: number): Promise<{
        backups: DatabaseBackup[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Restaurar respaldo de base de datos
     */
    restoreDatabaseBackup(backupId: string, restoredBy: string): Promise<void>;
    /**
     * Obtener logs del sistema
     */
    getSystemLogs(options: {
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
    }>;
    /**
     * Obtener métricas del sistema
     */
    getSystemMetrics(): Promise<SystemMetrics>;
    /**
     * Limpiar logs antiguos
     */
    cleanupOldLogs(days?: number): Promise<{
        deletedCount: number;
    }>;
    /**
     * Obtener conteo total de registros
     */
    private getTotalRecordsCount;
    /**
     * Obtener conteo de usuarios activos
     */
    private getActiveUsersCount;
}
export {};
