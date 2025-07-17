import { Request, Response } from 'express';
import { DataRecordService } from '@/services/data-record.service';
import { prisma } from '@/config/prisma';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
} from '@/types/data-record';

export class DataRecordController {
  private static dataRecordService = new DataRecordService(prisma);

  /**
   * Crea un nuevo registro de datos
   */
  static async createDataRecord(req: Request, res: Response): Promise<void> {
    try {
      const dataRecordData: CreateDataRecordInput = req.body;
      const userId = req.user?.id; // Asume que el ID del usuario está en req.user

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      const dataRecord = await DataRecordController.dataRecordService.createDataRecord(
        dataRecordData,
        userId
      );

      res.status(201).json({
        success: true,
        data: { dataRecord },
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear registro de datos',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }

  /**
   * Obtener todos los registros de datos con paginación y filtros
   */
  static async getDataRecords(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string | undefined;
      const createdBy = req.query.createdBy as string | undefined;

      const result = await DataRecordController.dataRecordService.getDataRecords(
        page,
        limit,
        type,
        createdBy
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener registros de datos',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
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
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { dataRecord },
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener registro de datos',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
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
      const userId = req.user?.id; // Asume que el ID del usuario está en req.user

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
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
        success: true,
        data: { dataRecord },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Registro de datos no encontrado')
      ) {
        res.status(404).json({
          error: {
            code: 'DATA_RECORD_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar registro de datos',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
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
      await DataRecordController.dataRecordService.deleteDataRecord(id);

      res.json({
        success: true,
        data: { message: 'Registro de datos eliminado exitosamente' },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Registro de datos no encontrado')
      ) {
        res.status(404).json({
          error: {
            code: 'DATA_RECORD_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al eliminar registro de datos',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }
}
