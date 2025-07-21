import { BaseDataRecordService } from './base.service';
import { DataRecord } from '@/types/data-record';
/**
 * Servicio para gestionar el versionado de registros de datos
 */
export declare class DataRecordVersioningService extends BaseDataRecordService {
    /**
     * Obtiene el historial de versiones de un registro
     */
    getVersionHistory(id: string, page?: number, limit?: number): Promise<{
        data: unknown[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Restaura una versión anterior de un registro
     */
    restoreVersion(id: string, version: number, userId: string): Promise<DataRecord>;
    /**
     * Verifica si hay conflictos de versión para un registro
     */
    checkVersionConflict(id: string, lastKnownVersion: number): Promise<{
        hasConflict: boolean;
        currentVersion: number;
        lastModifiedBy?: string;
        lastModifiedAt?: Date;
    }>;
    /**
     * Crea una versión de respaldo antes de eliminar un registro
     */
    createDeleteBackup(id: string, userId: string): Promise<void>;
}
