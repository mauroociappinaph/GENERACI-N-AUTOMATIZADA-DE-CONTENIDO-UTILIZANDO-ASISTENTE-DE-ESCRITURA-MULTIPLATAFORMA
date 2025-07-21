/**
 * Scheduled Audit Service
 * Responsabilidad: Tareas programadas para mantenimiento de auditoría y seguridad
 */
export declare class ScheduledAuditService {
    private static jobs;
    /**
     * Inicia todos los trabajos programados de auditoría
     */
    static startScheduledJobs(): void;
    /**
     * Detiene todos los trabajos programados
     */
    static stopScheduledJobs(): void;
    /**
     * Programa la limpieza de logs de auditoría antiguos
     */
    private static scheduleAuditLogCleanup;
    /**
     * Programa la limpieza de datos de seguridad
     */
    private static scheduleSecurityDataCleanup;
    /**
     * Programa la generación de reportes de seguridad semanales
     */
    private static scheduleSecurityReports;
    /**
     * Programa el monitoreo de actividad sospechosa
     */
    private static scheduleSuspiciousActivityMonitoring;
    /**
     * Obtiene el estado de todos los trabajos programados
     */
    static getJobsStatus(): Array<{
        name: string;
        running: boolean;
        nextRun?: Date;
    }>;
    /**
     * Ejecuta manualmente un trabajo específico
     */
    static runJobManually(jobName: string): Promise<void>;
}
export default ScheduledAuditService;
