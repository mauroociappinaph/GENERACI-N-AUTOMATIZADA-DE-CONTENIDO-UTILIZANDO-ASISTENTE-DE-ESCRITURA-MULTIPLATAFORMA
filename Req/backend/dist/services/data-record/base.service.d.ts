import { PrismaClient } from '@prisma/client';
/**
 * Servicio base para operaciones de registros de datos
 * Contiene funcionalidades comunes y utilidades
 */
export declare class BaseDataRecordService {
    protected prisma: PrismaClient;
    constructor(prisma: PrismaClient);
    /**
     * Registra un error con contexto
     */
    protected logError(error: Error, context: string, metadata?: Record<string, unknown>): void;
    /**
     * Registra un evento de negocio
     */
    protected logBusinessEvent(event: string, data?: Record<string, unknown>, userId?: string): void;
    /**
     * Registra métricas de rendimiento
     */
    protected logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void;
    /**
     * Valida datos según su tipo
     */
    protected validateData(type: string, data: Record<string, unknown>): Promise<{
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    }>;
    /**
     * Valida metadatos
     */
    protected validateMetadata(metadata: Record<string, unknown>): {
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    };
}
