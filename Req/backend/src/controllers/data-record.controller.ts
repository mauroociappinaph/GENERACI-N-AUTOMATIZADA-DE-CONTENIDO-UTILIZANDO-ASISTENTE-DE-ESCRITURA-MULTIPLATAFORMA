import { Request, Response } from 'express';
import { DataRecordService } from '@/services/data-record.service';
import { DataValidationService } from '@/services/data-validation.service';
import { prisma } from '@/config/prisma';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
  DataRecordFilters,
  dataRecordFiltersSchema,
  advancedSearchSchema,
  dynamicFilterSchema,
  DataRecord,
} from '@/types/data-record';
import { logError, logBusinessEvent } from '@/utils/logger';

export class DataRecordController {
  private static dataRecordService = new DataRecordService(prisma);

  /**
   * Crea un nuevo registro de datos
   */
  static async createDataRecord(req: Request, res: Response): Promise<void> {
    try {
      const dataRecordData: CreateDataRecordInput = req.body;
      const userId = req.user?.id;

      if (!userId) {
        logBusinessEvent('DATA_RECORD_CREATE_UNAUTHORIZED', {
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

      const dataRecord = await DataRecordController.dataRecordService.createDataRecord(
        dataRecordData,
        userId
      );

      res.status(201).json({
        data: dataRecord,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.createDataRecord', {
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
  static async getDataRecords(req: Request, res: Response): Promise<void> {
    try {
      // Procesar filtros de datos dinámicos si existen
      const query = { ...req.query };
      let dataFilters: Record<string, unknown> | undefined;

      // Extraer filtros de datos dinámicos del query string
      if (query.df && typeof query.df === 'string') {
        try {
          dataFilters = JSON.parse(query.df);
          delete query.df; // Eliminar del query para evitar conflictos con el schema
        } catch (e) {
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
      const filtersResult = dataRecordFiltersSchema.safeParse(query);

      if (!filtersResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parámetros de filtrado inválidos',
            details: filtersResult.error.issues.map(issue =>
              `${issue.path.join('.')}: ${issue.message}`
            ),
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
    } catch (error) {
      logError(error as Error, 'DataRecordController.getDataRecords', {
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
  static async getDataRecordById(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      logError(error as Error, 'DataRecordController.getDataRecordById', {
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
  static async updateDataRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateDataRecordInput = req.body;
      const userId = req.user?.id;
      const expectedVersion = req.headers['if-match'] ?
        parseInt(req.headers['if-match'] as string, 10) : undefined;

      if (!userId) {
        logBusinessEvent('DATA_RECORD_UPDATE_UNAUTHORIZED', {
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

      const dataRecord = await DataRecordController.dataRecordService.updateDataRecord(
        id,
        updateData,
        userId,
        expectedVersion
      ) as DataRecord;

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
    } catch (error) {
      logError(error as Error, 'DataRecordController.updateDataRecord', {
        userId: req.user?.id,
        recordId: req.params.id,
        body: req.body,
      });

      if (
        error instanceof Error &&
        error.message.includes('Registro de datos no encontrado')
      ) {
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
  static async deleteDataRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        logBusinessEvent('DATA_RECORD_DELETE_UNAUTHORIZED', {
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
    } catch (error) {
      logError(error as Error, 'DataRecordController.deleteDataRecord', {
        userId: req.user?.id,
        recordId: req.params.id,
      });

      if (
        error instanceof Error &&
        error.message.includes('Registro de datos no encontrado')
      ) {
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
  static async getDataTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = DataValidationService.getRegisteredTypes();

      res.json({
        data: types,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.getDataTypes', {
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
  static async getDataRecordStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await DataRecordController.dataRecordService.getDataRecordStats();

      res.json({
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.getDataRecordStats', {
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
  static async searchDataRecords(req: Request, res: Response): Promise<void> {
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
      const filters: Partial<DataRecordFilters> = {};

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
    } catch (error) {
      logError(error as Error, 'DataRecordController.searchDataRecords', {
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
  static async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      // Validar y parsear los parámetros de búsqueda avanzada
      const searchParams = advancedSearchSchema.safeParse(req.body);

      if (!searchParams.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parámetros de búsqueda inválidos',
            details: searchParams.error.issues.map(issue =>
              `${issue.path.join('.')}: ${issue.message}`
            ),
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const { criteria, pagination, sorting } = searchParams.data;

      const result = await DataRecordController.dataRecordService.advancedSearch(
        criteria,
        pagination,
        sorting
      );

      res.json({
        data: result.data,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          criteria,
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.advancedSearch', {
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
  static async applyDynamicFilters(req: Request, res: Response): Promise<void> {
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
      const validationErrors: string[] = [];

      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        const filterResult = dynamicFilterSchema.safeParse(filter);

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
        order: (req.body.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
      };

      const result = await DataRecordController.dataRecordService.applyDynamicFilters(
        filters,
        pagination,
        sorting
      );

      res.json({
        data: result.data,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          filters: filters.length,
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.applyDynamicFilters', {
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
  static async getRecordVersionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await DataRecordController.dataRecordService.getRecordVersionHistory(
        id,
        page,
        limit
      );

      res.json({
        data: result.data,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.getRecordVersionHistory', {
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
  static async restoreRecordVersion(req: Request, res: Response): Promise<void> {
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

      const restoredRecord = await DataRecordController.dataRecordService.restoreRecordVersion(
        id,
        version,
        userId
      ) as DataRecord;

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
    } catch (error) {
      logError(error as Error, 'DataRecordController.restoreRecordVersion', {
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
  static async recoverDeletedRecord(req: Request, res: Response): Promise<void> {
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

      const recoveredRecord = await DataRecordController.dataRecordService.recoverDeletedRecord(
        id,
        userId
      );

      res.json({
        data: recoveredRecord,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.recoverDeletedRecord', {
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
  static async detectEditConflicts(req: Request, res: Response): Promise<void> {
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

      const conflictInfo = await DataRecordController.dataRecordService.checkVersionConflict(
        id,
        lastKnownVersion
      );

      res.json({
        data: conflictInfo,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      logError(error as Error, 'DataRecordController.detectEditConflicts', {
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
