import { Prisma } from '@prisma/client';
import { BaseDataRecordService } from './base.service';
import { DataRecord } from '@/types/data-record';

/**
 * Servicio para gestionar el versionado de registros de datos
 */
export class DataRecordVersioningService extends BaseDataRecordService {
  /**
   * Obtiene el historial de versiones de un registro
   */
  async getVersionHistory(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: unknown[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: { id }
      });

      if (!existingRecord) {
        throw new Error('Registro de datos no encontrado');
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Obtener versiones del registro
      const [versions, total] = await Promise.all([
        this.prisma.dataRecordVersion.findMany({
          where: { recordId: id },
          orderBy: { version: 'desc' },
          skip,
          take: limit,
          include: {
            archivedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        this.prisma.dataRecordVersion.count({
          where: { recordId: id }
        })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);

      // Agregar la versión actual al historial
      const currentVersion = {
        id: `current_${existingRecord.id}`,
        recordId: existingRecord.id,
        version: existingRecord.version,
        type: existingRecord.type,
        data: existingRecord.data,
        metadata: existingRecord.metadata,
        createdAt: existingRecord.updatedAt,
        createdBy: existingRecord.updatedBy,
        isDeleteBackup: false,
        isCurrent: true
      };

      // Solo agregar la versión actual si estamos en la primera página
      const versionHistory = page === 1
        ? [currentVersion, ...versions]
        : versions;

      // Registrar rendimiento
      this.logPerformance('dataRecord.getVersionHistory', Date.now() - startTime, {
        id,
        versionCount: versions.length
      });

      return {
        data: versionHistory,
        pagination: {
          page,
          limit,
          total: total + 1, // +1 para incluir la versión actual
          totalPages: Math.ceil((total + 1) / limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logError(error as Error, 'DataRecordVersioningService.getVersionHistory', {
        id,
        page,
        limit
      });
      throw error;
    }
  }

  /**
   * Restaura una versión anterior de un registro
   */
  async restoreVersion(
    id: string,
    version: number,
    userId: string
  ): Promise<DataRecord> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      if (!existingRecord) {
        throw new Error('Registro de datos no encontrado');
      }

      // Buscar la versión específica
      const versionRecord = await this.prisma.dataRecordVersion.findFirst({
        where: {
          recordId: id,
          version
        }
      });

      if (!versionRecord) {
        throw new Error(`Versión ${version} no encontrada para el registro ${id}`);
      }

      // Crear una entrada en el historial de versiones con la versión actual antes de restaurar
      await this.prisma.dataRecordVersion.create({
        data: {
          recordId: id,
          version: existingRecord.version,
          data: existingRecord.data as Prisma.InputJsonValue,
          metadata: existingRecord.metadata as Prisma.InputJsonValue,
          type: existingRecord.type,
          createdBy: userId,
          updatedBy: userId,
          archivedBy: userId,
          createdAt: existingRecord.createdAt,
          updatedAt: existingRecord.updatedAt
        }
      });

      // Restaurar la versión anterior
      const updatedRecord = await this.prisma.dataRecord.update({
        where: { id },
        data: {
          data: versionRecord.data as Prisma.InputJsonValue,
          metadata: versionRecord.metadata as Prisma.InputJsonValue,
          type: versionRecord.type,
          updatedBy: userId,
          version: {
            increment: 1
          }
        }
      }) as DataRecord;

      // Registrar evento de negocio
      this.logBusinessEvent('DATA_RECORD_VERSION_RESTORED', {
        recordId: id,
        fromVersion: version,
        toVersion: updatedRecord.version
      }, userId);

      // Registrar rendimiento
      this.logPerformance('dataRecord.restoreVersion', Date.now() - startTime, {
        id,
        fromVersion: version,
        toVersion: updatedRecord.version
      });

      return updatedRecord;
    } catch (error) {
      this.logError(error as Error, 'DataRecordVersioningService.restoreVersion', {
        id,
        version,
        userId
      });
      throw error;
    }
  }

  /**
   * Verifica si hay conflictos de versión para un registro
   */
  async checkVersionConflict(
    id: string,
    lastKnownVersion: number
  ): Promise<{
    hasConflict: boolean;
    currentVersion: number;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
  }> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: {
          id,
          deletedAt: null
        },
        include: {
          updater: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!existingRecord) {
        throw new Error('Registro de datos no encontrado');
      }

      const hasConflict = existingRecord.version !== lastKnownVersion;

      // Registrar rendimiento
      this.logPerformance('dataRecord.checkVersionConflict', Date.now() - startTime, {
        id,
        hasConflict
      });

      return {
        hasConflict,
        currentVersion: existingRecord.version,
        lastModifiedBy: existingRecord.updater ?
          `${existingRecord.updater.firstName} ${existingRecord.updater.lastName}` :
          existingRecord.updatedBy,
        lastModifiedAt: existingRecord.updatedAt
      };
    } catch (error) {
      this.logError(error as Error, 'DataRecordVersioningService.checkVersionConflict', {
        id,
        lastKnownVersion
      });
      throw error;
    }
  }

  /**
   * Crea una versión de respaldo antes de eliminar un registro
   */
  async createDeleteBackup(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      if (!existingRecord) {
        throw new Error('Registro de datos no encontrado');
      }

      // Crear una copia de respaldo antes de eliminar
      await this.prisma.dataRecordVersion.create({
        data: {
          recordId: id,
          version: existingRecord.version,
          data: existingRecord.data as Prisma.InputJsonValue,
          metadata: existingRecord.metadata as Prisma.InputJsonValue,
          type: existingRecord.type,
          createdBy: userId,
          updatedBy: userId,
          archivedBy: userId,
          createdAt: existingRecord.createdAt,
          updatedAt: existingRecord.updatedAt
        }
      });

      // Registrar rendimiento
      this.logPerformance('dataRecord.createDeleteBackup', Date.now() - startTime, {
        id,
        userId
      });
    } catch (error) {
      this.logError(error as Error, 'DataRecordVersioningService.createDeleteBackup', {
        id,
        userId
      });
      throw error;
    }
  }
}
