import { Request, Response } from 'express';
export declare class DataRecordController {
    private static dataRecordService;
    /**
     * Crea un nuevo registro de datos
     */
    static createDataRecord(req: Request, res: Response): Promise<void>;
    /**
     * Obtener todos los registros de datos con paginación y filtros avanzados
     */
    static getDataRecords(req: Request, res: Response): Promise<void>;
    /**
     * Obtener un registro de datos por ID
     */
    static getDataRecordById(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar un registro de datos
     */
    static updateDataRecord(req: Request, res: Response): Promise<void>;
    /**
     * Eliminar un registro de datos
     */
    static deleteDataRecord(req: Request, res: Response): Promise<void>;
    /**
     * Obtener tipos de datos registrados
     */
    static getDataTypes(req: Request, res: Response): Promise<void>;
    /**
     * Obtener estadísticas de registros de datos
     */
    static getDataRecordStats(req: Request, res: Response): Promise<void>;
    /**
     * Búsqueda simple de registros
     */
    static searchDataRecords(req: Request, res: Response): Promise<void>;
    /**
     * Búsqueda avanzada con múltiples criterios
     */
    static advancedSearch(req: Request, res: Response): Promise<void>;
    /**
     * Aplicar filtros dinámicos a los registros
     */
    static applyDynamicFilters(req: Request, res: Response): Promise<void>;
    /**
     * Obtener historial de versiones de un registro
     */
    static getRecordVersionHistory(req: Request, res: Response): Promise<void>;
    /**
     * Restaurar una versión anterior de un registro
     */
    static restoreRecordVersion(req: Request, res: Response): Promise<void>;
    /**
     * Recuperar un registro eliminado
     */
    static recoverDeletedRecord(req: Request, res: Response): Promise<void>;
    /**
     * Detectar conflictos de edición
     */
    static detectEditConflicts(req: Request, res: Response): Promise<void>;
}
