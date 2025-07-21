import { PrismaClient } from '@prisma/client';
import { CreateDataRecordInput, UpdateDataRecordInput, DataRecordFilters, PaginatedResponse, AdvancedSearchParams, DynamicFilter, DataRecord } from '@/types/data-record';
/**
 * Servicio principal para la gestión de registros de datos
 * Integra los diferentes servicios especializados
 */
export declare class DataRecordService {
    private prisma;
    private crudService;
    private versioningService;
    constructor(prisma: PrismaClient);
    /**
     * Crea un nuevo registro de datos
     */
    createDataRecord(dataRecordData: CreateDataRecordInput, userId: string): Promise<DataRecord>;
    /**
     * Obtiene todos los registros de datos con paginación y filtros
     */
    getDataRecords(filters: DataRecordFilters): Promise<PaginatedResponse<DataRecord>>;
    /**
     * Obtiene un registro de datos por ID
     */
    getDataRecordById(id: string): Promise<DataRecord | null>;
    /**
     * Actualiza un registro de datos
     */
    updateDataRecord(id: string, updateData: UpdateDataRecordInput, userId: string, expectedVersion?: number): Promise<DataRecord>;
    /**
     * Elimina un registro de datos (soft delete)
     */
    deleteDataRecord(id: string, userId: string): Promise<void>;
    /**
     * Busca registros de datos por término de búsqueda
     */
    searchDataRecords(searchTerm: string, filters?: Partial<DataRecordFilters>): Promise<PaginatedResponse<DataRecord>>;
    /**
     * Realiza una búsqueda avanzada con múltiples criterios
     */
    advancedSearch(criteria: AdvancedSearchParams['criteria'], pagination: AdvancedSearchParams['pagination'], sorting: AdvancedSearchParams['sorting']): Promise<PaginatedResponse<DataRecord>>;
    /**
     * Aplica filtros dinámicos a los registros
     */
    applyDynamicFilters(filters: DynamicFilter[], pagination: {
        page: number;
        limit: number;
    }, sorting: {
        field: string;
        order: 'asc' | 'desc';
    }): Promise<PaginatedResponse<DataRecord>>;
    /**
     * Obtiene estadísticas de registros de datos
     */
    getDataRecordStats(): Promise<any>;
    /**
     * Obtiene el historial de versiones de un registro
     */
    getRecordVersionHistory(id: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    /**
     * Restaura una versión anterior de un registro
     */
    restoreRecordVersion(id: string, version: number, userId: string): Promise<DataRecord>;
    /**
     * Recupera un registro eliminado
     */
    recoverDeletedRecord(id: string, userId: string): Promise<DataRecord>;
    /**
     * Verifica si hay conflictos de versión para un registro
     */
    checkVersionConflict(id: string, lastKnownVersion: number): Promise<{
        hasConflict: boolean;
        currentVersion: number;
        lastModifiedBy?: string;
        lastModifiedAt?: Date;
    }>;
}
