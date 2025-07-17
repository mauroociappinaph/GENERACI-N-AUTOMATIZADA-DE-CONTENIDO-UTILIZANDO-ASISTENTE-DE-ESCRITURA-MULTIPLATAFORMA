import { Request, Response } from 'express';
import { DataRecordService } from '@/services/data-record.service';
import { DataValidationService } from '@/services/data-validation.service';
import { prisma } from '@/config/prisma';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
  DataRecordFilters,
  dataRecordFiltersSchema,
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
        userId
      );

      res.json({
        data: dataRecord,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
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
   * Búsqueda avanzada de registros
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
}
