import { Request, Response } from 'express';
export declare class SystemConfigController {
    private static systemConfigService;
    /**
     * Obtener configuración del sistema
     */
    static getSystemConfig(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar configuración del sistema
     */
    static updateSystemConfig(req: Request, res: Response): Promise<void>;
    /**
     * Crear respaldo de base de datos
     */
    static createDatabaseBackup(req: Request, res: Response): Promise<void>;
    /**
     * Obtener lista de respaldos
     */
    static getDatabaseBackups(req: Request, res: Response): Promise<void>;
    /**
     * Restaurar respaldo de base de datos
     */
    static restoreDatabaseBackup(req: Request, res: Response): Promise<void>;
    /**
     * Obtener logs del sistema
     */
    static getSystemLogs(req: Request, res: Response): Promise<void>;
    /**
     * Obtener métricas del sistema
     */
    static getSystemMetrics(req: Request, res: Response): Promise<void>;
    /**
     * Limpiar logs antiguos
     */
    static cleanupOldLogs(req: Request, res: Response): Promise<void>;
}
