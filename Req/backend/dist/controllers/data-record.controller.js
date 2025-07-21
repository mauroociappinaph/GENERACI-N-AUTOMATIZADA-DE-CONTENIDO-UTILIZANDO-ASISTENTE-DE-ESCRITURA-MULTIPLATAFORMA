"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRecordController = void 0;
const data_record_service_1 = require("@/services/data-record.service");
const data_validation_service_1 = require("@/services/data-validation.service");
const prisma_1 = require("@/config/prisma");
const data_record_1 = require("@/types/data-record");
const logger_1 = require("@/utils/logger");
class DataRecordController {
    /**
     * Crea un nuevo registro de datos
     */
    static async createDataRecord(req, res) {
        try {
            const dataRecordData = req.body;
            const userId = req.user?.id;
            if (!userId) {
                (0, logger_1.logBusinessEvent)('DATA_RECORD_CREATE_UNAUTHORIZED', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }, 'anonymous');
                res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const dataRecord = await DataRecordController.dataRecordService.createDataRecord(dataRecordData, userId);
            res.status(201).json({
                data: dataRecord,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.createDataRecord', {
                userId: req.user?.id,
                body: req.body,
            });
            // Handle validation errors
            if (error instanceof Error && error.message.includes('Validación fallida')) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al crear registro de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Obtener todos los registros de datos con paginación y filtros avanzados
     */
    static async getDataRecords(req, res) {
        try {
            // Procesar filtros de datos dinámicos si existen
            const query = { ...req.query };
            let dataFilters;
            // Extraer filtros de datos dinámicos del query string
            if (query.df && typeof query.df === 'string') {
                try {
                    dataFilters = JSON.parse(query.df);
                    delete query.df; // Eliminar del query para evitar conflictos con el schema
                }
                catch (e) {
                    res.status(400).json({
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Formato de filtros de datos inválido',
                            details: 'El parámetro df debe ser un objeto JSON válido',
                            timestamp: new Date().toISOString(),
                            path: req.path,
                        },
                    });
                    return;
                }
            }
            // Validar y parsear filtros usando el schema
            const filtersResult = data_record_1.dataRecordFiltersSchema.safeParse(query);
            if (!filtersResult.success) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Parámetros de filtrado inválidos',
                        details: filtersResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Combinar filtros validados con los filtros de datos dinámicos
            const filters = {
                ...filtersResult.data,
                dataFilters,
            };
            const result = await DataRecordController.dataRecordService.getDataRecords(filters);
            res.json({
                data: result.data,
                pagination: result.pagination,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.getDataRecords', {
                userId: req.user?.id,
                query: req.query,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener registros de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Obtener un registro de datos por ID
     */
    static async getDataRecordById(req, res) {
        try {
            const { id } = req.params;
            const dataRecord = await DataRecordController.dataRecordService.getDataRecordById(id);
            if (!dataRecord) {
                res.status(404).json({
                    error: {
                        code: 'DATA_RECORD_NOT_FOUND',
                        message: 'Registro de datos no encontrado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.json({
                data: dataRecord,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.getDataRecordById', {
                userId: req.user?.id,
                recordId: req.params.id,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener registro de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Actualizar un registro de datos
     */
    static async updateDataRecord(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user?.id;
            const expectedVersion = req.headers['if-match'] ?
                parseInt(req.headers['if-match'], 10) : undefined;
            if (!userId) {
                (0, logger_1.logBusinessEvent)('DATA_RECORD_UPDATE_UNAUTHORIZED', {
                    recordId: id,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }, 'anonymous');
                res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const dataRecord = await DataRecordController.dataRecordService.updateDataRecord(id, updateData, userId, expectedVersion);
            // Now we can safely access the version property
            const recordVersion = dataRecord.version;
            res.json({
                data: dataRecord,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    recordVersion: recordVersion,
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.updateDataRecord', {
                userId: req.user?.id,
                recordId: req.params.id,
                body: req.body,
            });
            if (error instanceof Error &&
                error.message.includes('Registro de datos no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'DATA_RECORD_NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Handle validation errors
            if (error instanceof Error && error.message.includes('Validación fallida')) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Handle concurrency conflicts
            if (error instanceof Error && error.message.includes('Conflicto de concurrencia')) {
                res.status(409).json({
                    error: {
                        code: 'CONCURRENCY_CONFLICT',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al actualizar registro de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Eliminar un registro de datos
     */
    static async deleteDataRecord(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                (0, logger_1.logBusinessEvent)('DATA_RECORD_DELETE_UNAUTHORIZED', {
                    recordId: id,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }, 'anonymous');
                res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            await DataRecordController.dataRecordService.deleteDataRecord(id, userId);
            res.json({
                success: true,
                data: { message: 'Registro de datos eliminado exitosamente' },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.deleteDataRecord', {
                userId: req.user?.id,
                recordId: req.params.id,
            });
            if (error instanceof Error &&
                error.message.includes('Registro de datos no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'DATA_RECORD_NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al eliminar registro de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Obtener tipos de datos registrados
     */
    static async getDataTypes(req, res) {
        try {
            const types = data_validation_service_1.DataValidationService.getRegisteredTypes();
            res.json({
                data: types,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.getDataTypes', {
                userId: req.user?.id,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener tipos de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Obtener estadísticas de registros de datos
     */
    static async getDataRecordStats(req, res) {
        try {
            const stats = await DataRecordController.dataRecordService.getDataRecordStats();
            res.json({
                data: stats,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.getDataRecordStats', {
                userId: req.user?.id,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener estadísticas de registros',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Búsqueda simple de registros
     */
    static async searchDataRecords(req, res) {
        try {
            const { searchTerm } = req.query;
            if (!searchTerm || typeof searchTerm !== 'string') {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Término de búsqueda requerido',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Extraer filtros adicionales
            const filters = {};
            if (req.query.type && typeof req.query.type === 'string') {
                filters.type = req.query.type;
            }
            if (req.query.page) {
                filters.page = Number(req.query.page);
            }
            if (req.query.limit) {
                filters.limit = Number(req.query.limit);
            }
            const result = await DataRecordController.dataRecordService.searchDataRecords(searchTerm, filters);
            res.json({
                data: result.data,
                pagination: result.pagination,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    searchTerm,
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.searchDataRecords', {
                userId: req.user?.id,
                query: req.query,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al buscar registros de datos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Búsqueda avanzada con múltiples criterios
     */
    static async advancedSearch(req, res) {
        try {
            // Validar y parsear los parámetros de búsqueda avanzada
            const searchParams = data_record_1.advancedSearchSchema.safeParse(req.body);
            if (!searchParams.success) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Parámetros de búsqueda inválidos',
                        details: searchParams.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const { criteria, pagination, sorting } = searchParams.data;
            const result = await DataRecordController.dataRecordService.advancedSearch(criteria, pagination, sorting);
            res.json({
                data: result.data,
                pagination: result.pagination,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    criteria,
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.advancedSearch', {
                userId: req.user?.id,
                body: req.body,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al realizar búsqueda avanzada',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Aplicar filtros dinámicos a los registros
     */
    static async applyDynamicFilters(req, res) {
        try {
            // Validar que el cuerpo de la solicitud contenga un array de filtros
            if (!req.body.filters || !Array.isArray(req.body.filters)) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Se requiere un array de filtros',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Validar cada filtro
            const filters = req.body.filters;
            const validationErrors = [];
            for (let i = 0; i < filters.length; i++) {
                const filter = filters[i];
                const filterResult = data_record_1.dynamicFilterSchema.safeParse(filter);
                if (!filterResult.success) {
                    validationErrors.push(`Filtro ${i + 1}: ${filterResult.error.issues.map(issue => issue.message).join(', ')}`);
                }
            }
            if (validationErrors.length > 0) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Filtros inválidos',
                        details: validationErrors,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            // Extraer parámetros de paginación y ordenamiento
            const pagination = {
                page: req.body.page ? Number(req.body.page) : 1,
                limit: req.body.limit ? Number(req.body.limit) : 10,
            };
            const sorting = {
                field: req.body.sortBy || 'createdAt',
                order: (req.body.sortOrder === 'asc' ? 'asc' : 'desc'),
            };
            const result = await DataRecordController.dataRecordService.applyDynamicFilters(filters, pagination, sorting);
            res.json({
                data: result.data,
                pagination: result.pagination,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    filters: filters.length,
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.applyDynamicFilters', {
                userId: req.user?.id,
                body: req.body,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al aplicar filtros dinámicos',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Obtener historial de versiones de un registro
     */
    static async getRecordVersionHistory(req, res) {
        try {
            const { id } = req.params;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const result = await DataRecordController.dataRecordService.getRecordVersionHistory(id, page, limit);
            res.json({
                data: result.data,
                pagination: result.pagination,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.getRecordVersionHistory', {
                userId: req.user?.id,
                recordId: req.params.id,
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener historial de versiones',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Restaurar una versión anterior de un registro
     */
    static async restoreRecordVersion(req, res) {
        try {
            const { id } = req.params;
            const { version } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            if (!version || typeof version !== 'number') {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Se requiere un número de versión válido',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const restoredRecord = await DataRecordController.dataRecordService.restoreRecordVersion(id, version, userId);
            // Now we can safely access the version property
            const currentVersion = restoredRecord.version;
            res.json({
                data: restoredRecord,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    restoredFrom: version,
                    currentVersion: currentVersion,
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.restoreRecordVersion', {
                userId: req.user?.id,
                recordId: req.params.id,
                version: req.body.version,
            });
            if (error instanceof Error && error.message.includes('no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al restaurar versión',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Recuperar un registro eliminado
     */
    static async recoverDeletedRecord(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const recoveredRecord = await DataRecordController.dataRecordService.recoverDeletedRecord(id, userId);
            res.json({
                data: recoveredRecord,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.recoverDeletedRecord', {
                userId: req.user?.id,
                recordId: req.params.id,
            });
            if (error instanceof Error && error.message.includes('No se encontró registro eliminado')) {
                res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            if (error instanceof Error && error.message.includes('Ya existe un registro activo')) {
                res.status(409).json({
                    error: {
                        code: 'CONFLICT',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al recuperar registro eliminado',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
    /**
     * Detectar conflictos de edición
     */
    static async detectEditConflicts(req, res) {
        try {
            const { id } = req.params;
            const { version } = req.query;
            if (!version || typeof version !== 'string') {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Se requiere un número de versión válido',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const lastKnownVersion = parseInt(version, 10);
            if (isNaN(lastKnownVersion)) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'El número de versión debe ser un entero válido',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            const conflictInfo = await DataRecordController.dataRecordService.checkVersionConflict(id, lastKnownVersion);
            res.json({
                data: conflictInfo,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataRecordController.detectEditConflicts', {
                userId: req.user?.id,
                recordId: req.params.id,
                version: req.query.version,
            });
            if (error instanceof Error && error.message.includes('no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al detectar conflictos de edición',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            });
        }
    }
}
exports.DataRecordController = DataRecordController;
DataRecordController.dataRecordService = new data_record_service_1.DataRecordService(prisma_1.prisma);
