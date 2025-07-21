import { Application } from 'express';
/**
 * Inicia el servidor con todas las configuraciones necesarias
 * Responsabilidad: Gestión del ciclo de vida del servidor
 */
export declare class Server {
    private app;
    private httpServer;
    private httpsServer?;
    private securityCleanupInterval?;
    constructor(app: Application);
    /**
     * Inicia el servidor después de verificar la conexión a la base de datos
     */
    start(): Promise<void>;
    /**
     * Configura el cierre graceful del servidor
     */
    private setupGracefulShutdown;
    /**
     * Determina si se debe usar HTTPS basado en la configuración
     */
    private shouldUseHttps;
    /**
     * Obtiene las opciones de configuración para HTTPS
     */
    private getHttpsOptions;
    /**
     * Configura la limpieza periódica de datos de seguridad
     */
    private setupSecurityCleanup;
}
