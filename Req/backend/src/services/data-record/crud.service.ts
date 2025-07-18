import { Prisma } from '@prisma/client';
import { BaseDataRecordService } from './base.service';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
  DataRecord
} from '@/types/data-record';

/**
 * Servicio para operaciones CRUD de registros de datos
 */
export class DataRecordCrudService extends BaseDataRecordService {
  /**
   * Crea un nuevo registro de datos
   */
  async createDataRecord(
    dataRecordData: CreateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    const startTime = Date.now();
    try {
      // Validar datos según el tipo
      const validationResult = await this.validateData(
        dataRecordData.type,
        dataRecordData.data
      );

      if (!validationResult.isValid) {
        const errorMessage = `Validación fallida: ${validationResult.errors?.join(', ')}`;
        this.logBusinessEvent('DATA_RECORD_VALIDATION_FAILED', {
          type: dataRecordData.type,
          errors: validationResult.errors
        }, userId);
        throw new Error(errorMessage);
      }

      // Validar metadatos si existen
      if (dataRecordData.metadata) {
        const metadataValidation = this.validateMetadata(dataRecordData.metadata);
        if (!metadataValidation.isValid) {
          const errorMessage = `Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`;
          throw new Error(errorMessage);
        }
      }

      // Crear registro en la base de datos
      const dataRecord = await this.prisma.dataRecord.create({
        data: {
          type: dataRecordData.type,
          data: dataRecordData.data as Prisma.InputJsonValue,
          metadata: dataRecordData.metadata as Prisma.InputJsonValue,
          createdBy: userId,
          updatedBy: userId,
          version: 1, // Versión inicial
        },
      }) as DataRecord;

      // Registrar evento de negocio
      this.logBusinessEvent('DATA_RECORD_CREATED', {
        recordId: dataRecord.id,
        type: dataRecord.type
      }, userId);

      // Registrar rendimiento
      this.logPerformance('dataRecord.create', Date.now() - startTime, {
        type: dataRecord.type,
        userId
      });

      return dataRecord;
    } catch (error) {
      this.logError(error as Error, 'DataRecordCrudService.createDataRecord', {
        userId,
        type: dataRecordData.type
      });
      throw error;
    }
  }

  /**
   * Obtiene un registro de datos por ID
   */
  async getDataRecordById(id: string): Promise<DataRecord | null> {
    const startTime = Date.now();
    try {
      const record = await this.prisma.dataRecord.findFirst({
        where: {
          id,
          deletedAt: null // Solo registros no eliminados
        }
      }) as DataRecord | null;

      // Registrar rendimiento
      this.logPerformance('dataRecord.getById', Date.now() - startTime, { id });

      return record;
    } catch (error) {
      this.logError(error as Error, 'DataRecordCrudService.getDataRecordById', { id });
      throw error;
    }
  }

  /**
   * Actualiza un registro de datos
   */
  async updateDataRecord(
    id: string,
    updateData: UpdateDataRecordInput,
    userId: string,
    expectedVersion?: number
  ): Promise<DataRecord> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findFirst({
        where: {
          id,
          deletedAt: null
        }
      });

      if (!existingRecord) {
        throw new Error('Registro de datos no encontrado');
      }

      // Verificar conflictos de concurrencia si se proporciona una versión esperada
      if (expectedVersion !== undefined && existingRecord.version !== expectedVersion) {
        this.logBusinessEvent('DATA_RECORD_CONCURRENCY_CONFLICT', {
          recordId: id,
          expectedVersion,
          actualVersion: existingRecord.version
        }, userId);

        throw new Error(`Conflicto de concurrencia: El registro ha sido modificado. Versión actual: ${existingRecord.version}, versión esperada: ${expectedVersion}`);
      }

      // Preparar datos para actualización
      const updatePayload: Prisma.DataRecordUpdateInput = {
        updatedBy: userId,
        version: {
          increment: 1
        }
      } as Prisma.DataRecordUpdateArgs["data"];

      // Actualizar tipo si se proporciona
      if (updateData.type) {
        updatePayload.type = updateData.type;
      }

      // Actualizar datos si se proporcionan
      if (updateData.data) {
        // Validar datos según el tipo (usar el tipo existente o el nuevo)
        const type = updateData.type || existingRecord.type;
        const validationResult = await this.validateData(
          type,
          updateData.data
        );

        if (!validationResult.isValid) {
          const errorMessage = `Validación fallida: ${validationResult.errors?.join(', ')}`;
          this.logBusinessEvent('DATA_RECORD_UPDATE_VALIDATION_FAILED', {
            recordId: id,
            errors: validationResult.errors
          }, userId);
          throw new Error(errorMessage);
        }

        updatePayload.data = updateData.data as Prisma.InputJsonValue;
      }

      // Actualizar metadatos si se proporcionan
      if (updateData.metadata) {
        const metadataValidation = this.validateMetadata(updateData.metadata);
        if (!metadataValidation.isValid) {
          const errorMessage = `Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`;
          throw new Error(errorMessage);
        }

        updatePayload.metadata = updateData.metadata as Prisma.InputJsonValue;
      }

      // Crear una entrada en el historial de versiones antes de actualizar
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

      // Actualizar el registro
      const updatedRecord = await this.prisma.dataRecord.update({
        where: { id },
        data: updatePayload
      }) as DataRecord;

      // Registrar evento de negocio
      this.logBusinessEvent('DATA_RECORD_UPDATED', {
        recordId: id,
        type: updatedRecord.type,
        version: updatedRecord.version
      }, userId);

      // Registrar rendimiento
      this.logPerformance('dataRecord.update', Date.now() - startTime, {
        id,
        userId
      });

      return updatedRecord;
    } catch (error) {
      this.logError(error as Error, 'DataRecordCrudService.updateDataRecord', {
        id,
        userId,
        updateData
      });
      throw error;
    }
  }

  /**
   * Elimina un registro de datos (soft delete)
   */
  async deleteDataRecord(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe
      const existingRecord = await this.prisma.dataRecord.findFirst({
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

      // Realizar soft delete
      await this.prisma.dataRecord.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId
        }
      });

      // Registrar evento de negocio
      this.logBusinessEvent('DATA_RECORD_DELETED', {
        recordId: id,
        type: existingRecord.type
      }, userId);

      // Registrar rendimiento
      this.logPerformance('dataRecord.delete', Date.now() - startTime, {
        id,
        userId
      });
    } catch (error) {
      this.logError(error as Error, 'DataRecordCrudService.deleteDataRecord', {
        id,
        userId
      });
      throw error;
    }
  }

  /**
   * Recupera un registro eliminado
   */
  async recoverDeletedRecord(id: string, userId: string): Promise<DataRecord> {
    const startTime = Date.now();
    try {
      // Verificar que el registro existe y está eliminado
      const deletedRecord = await this.prisma.dataRecord.findFirst({
        where: {
          id
        }
      });

      if (!deletedRecord) {
        throw new Error('Registro no encontrado');
      }

      if (deletedRecord.deletedAt === null) {
        throw new Error('El registro no está eliminado');
      }

      // Verificar si ya existe un registro activo con el mismo ID
      const activeRecord = await this.prisma.dataRecord.findFirst({
        where: {
          id,
          deletedAt: null
        }
      });

      if (activeRecord) {
        throw new Error('Ya existe un registro activo con este ID');
      }

      // Recuperar el registro eliminado
      const recoveredRecord = await this.prisma.dataRecord.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          updatedBy: userId,
          version: {
            increment: 1
          }
        }
      }) as DataRecord;

      // Registrar evento de negocio
      this.logBusinessEvent('DATA_RECORD_RECOVERED', {
        recordId: id,
        type: recoveredRecord.type
      }, userId);

      // Registrar rendimiento
      this.logPerformance('dataRecord.recover', Date.now() - startTime, {
        id,
        userId
      });

      return recoveredRecord;
    } catch (error) {
      this.logError(error as Error, 'DataRecordCrudService.recoverDeletedRecord', {
        id,
        userId
      });
      throw error;
    }
  }
}
