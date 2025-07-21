import { BaseDataRecordService } from './base.service';
import { CreateDataRecordInput, UpdateDataRecordInput, DataRecord } from '@/types/data-record';
/**
 * Servicio para operaciones CRUD de registros de datos
 */
export declare class DataRecordCrudService extends BaseDataRecordService {
    /**
     * Crea un nuevo registro de datos
     */
    createDataRecord(dataRecordData: CreateDataRecordInput, userId: string): Promise<DataRecord>;
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
     * Recupera un registro eliminado
     */
    recoverDeletedRecord(id: string, userId: string): Promise<DataRecord>;
}
