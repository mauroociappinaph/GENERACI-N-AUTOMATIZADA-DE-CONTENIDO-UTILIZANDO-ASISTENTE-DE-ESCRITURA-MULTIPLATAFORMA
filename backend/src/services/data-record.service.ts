import { PrismaClient, DataRecord, Prisma } from '@prisma/client';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
  DataRecordFilters,
  PaginatedResponse,
} from '@/types/data-record';
import { DataValidationService } from './data-validation.service';
import { logError, logBusinessEvent, logPerformance } from '@/utils/logger';

export class DataRecordService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crea un nuevo registro de datos con validación
   */
  async createDataRecord(
    data: CreateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    const startTime = Date.now();

    try {
      // Validar los datos según su tipo
      const validation = await DataValidationService.validateDataByType(data.type, data.data);
      if (!validation.isValid) {
        logBusinessEvent('DATA_RECORD_VALIDATION_FAILED', {
          type: data.type,
          errors: validation.errors,
          userId
        }, userId);
        throw new Error(`Validación fallida: ${validation.errors?.join(', ')}`);
      }

      // Validar metadatos si existen
      if (data.metadata) {
        const metadataValidation = DataValidationService.validateMetadata(data.metadata);
        if (!metadataValidation.isValid) {
          logBusinessEvent('DATA_RECORD_METADATA_VALIDATION_FAILED', {
            errors: metadataValidation.errors,
            userId
          }, userId);
          throw new Error(`Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`);
        }
      }

      const record = await this.prisma.dataRecord.create({
        data: {
          ...data,
          data: validation.validatedData as Prisma.InputJsonValue,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      logBusinessEvent('DATA_RECORD_CREATED', {
        recordId: record.id,
        type: record.type,
        userId
      }, userId);

      logPerformance('DataRecordService.createDataRecord', Date.now() - startTime, {
        recordId: record.id,
        type: record.type
      });

      return record;
    } catch (error) {
      logError(error as Error, 'DataRecordService.createDataRecord', {
        type: data.type,
        userId
      });
      throw error;
    }
  }

  /**
   * Obtiene registros de datos con paginación y filtros avanzados
   */
  async getDataRecords(filters: DataRecordFilters): Promise<PaginatedResponse<DataRecord>> {
    const startTime = Date.now();

    try {
      const skip = (filters.page - 1) * filters.limit;

      // Construir condiciones de filtrado
      const where: Prisma.DataRecordWhereInput = {};

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo);
        }
      }

      // Búsqueda avanzada
      if (filters.search) {
        where.OR = [
          {
            type: {
              contains: filters.search,
            },
          }
        ];
      }

      // Filtros dinámicos por campos específicos en data
      if (filters.dataFilters && Object.keys(filters.dataFilters).length > 0) {
        const dataFilters: Prisma.JsonFilter[] = [];

        Object.entries(filters.dataFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'string') {
              // Para strings, hacer búsqueda insensible a mayúsculas/minúsculas
              dataFilters.push({
                path: key,
                string_contains: value,
              });
            } else {
              // Para otros tipos (números, booleanos), buscar coincidencia exacta
              dataFilters.push({
                path: key,
                equals: value,
              });
            }
          }
        });

        if (dataFilters.length > 0) {
          where.AND = dataFilters.map(filter => ({ data: filter }));
        }
      }

      // Configurar ordenamiento
      const orderBy: Prisma.DataRecordOrderByWithRelationInput = {};
      if (filters.sortBy === 'createdAt') {
        orderBy.createdAt = filters.sortOrder;
      } else if (filters.sortBy === 'updatedAt') {
        orderBy.updatedAt = filters.sortOrder;
      } else if (filters.sortBy === 'type') {
        orderBy.type = filters.sortOrder;
      } else {
        orderBy.createdAt = filters.sortOrder; // default fallback
      }

      // Incluir información de usuarios relacionados
      const include = {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      };

      const [dataRecords, total] = await Promise.all([
        this.prisma.dataRecord.findMany({
          where,
          skip,
          take: filters.limit,
          orderBy,
          include,
        }),
        this.prisma.dataRecord.count({ where }),
      ]);

      const totalPages = Math.ceil(total / filters.limit);

      logPerformance('DataRecordService.getDataRecords', Date.now() - startTime, {
        total,
        page: filters.page,
        limit: filters.limit,
        filters: Object.keys(where).length,
      });

      return {
        data: dataRecords,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages,
          hasNext: filters.page < totalPages,
          hasPrev: filters.page > 1,
        },
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.getDataRecords', { filters });
      throw error;
    }
  }

  /**
   * Obtiene registros de datos con paginación simple (método de compatibilidad)
   */
  async getDataRecordsSimple(
    page: number = 1,
    limit: number = 10,
    type?: string,
    createdBy?: string
  ): Promise<{
    dataRecords: DataRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filters: DataRecordFilters = {
      page,
      limit,
      type,
      createdBy,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const result = await this.getDataRecords(filters);

    return {
      dataRecords: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      totalPages: result.pagination.totalPages,
    };
  }

  /**
   * Obtiene un registro de datos por ID
   */
  async getDataRecordById(id: string): Promise<DataRecord | null> {
    const startTime = Date.now();

    try {
      const record = await this.prisma.dataRecord.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          updater: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logPerformance('DataRecordService.getDataRecordById', Date.now() - startTime, { id });

      return record;
    } catch (error) {
      logError(error as Error, 'DataRecordService.getDataRecordById', { id });
      throw error;
    }
  }

  /**
   * Actualiza un registro de datos con validación
   */
  async updateDataRecord(
    id: string,
    inputData: UpdateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    const startTime = Date.now();

    try {
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        logBusinessEvent('DATA_RECORD_NOT_FOUND', { recordId: id, userId }, userId);
        throw new Error('Registro de datos no encontrado');
      }

      // Validar datos si se están actualizando
      if (inputData.data !== undefined) {
        const type = inputData.type || existingRecord.type;
        const validation = await DataValidationService.validateDataByType(type, inputData.data);
        if (!validation.isValid) {
          logBusinessEvent('DATA_RECORD_UPDATE_VALIDATION_FAILED', {
            recordId: id,
            type,
            errors: validation.errors,
            userId
          }, userId);
          throw new Error(`Validación fallida: ${validation.errors?.join(', ')}`);
        }
        // Ensure the validated data is properly typed for Prisma
        inputData.data = validation.validatedData as Record<string, unknown> & Prisma.InputJsonValue;
      }

      // Validar metadatos si se están actualizando
      if (inputData.metadata !== undefined) {
        const metadataValidation = DataValidationService.validateMetadata(inputData.metadata);
        if (!metadataValidation.isValid) {
          logBusinessEvent('DATA_RECORD_METADATA_UPDATE_VALIDATION_FAILED', {
            recordId: id,
            errors: metadataValidation.errors,
            userId
          }, userId);
          throw new Error(`Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`);
        }
      }

      const dataToUpdate: Prisma.DataRecordUpdateInput = {
        ...inputData,
        updater: {
          connect: { id: userId }
        }
      };

      const updatedRecord = await this.prisma.dataRecord.update({
        where: { id },
        data: dataToUpdate,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          updater: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logBusinessEvent('DATA_RECORD_UPDATED', {
        recordId: id,
        type: updatedRecord.type,
        userId
      }, userId);

      logPerformance('DataRecordService.updateDataRecord', Date.now() - startTime, {
        recordId: id,
        type: updatedRecord.type
      });

      return updatedRecord;
    } catch (error) {
      logError(error as Error, 'DataRecordService.updateDataRecord', { id, userId });
      throw error;
    }
  }

  /**
   * Elimina un registro de datos con respaldo
   */
  async deleteDataRecord(id: string, userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const existingRecord = await this.prisma.dataRecord.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        logBusinessEvent('DATA_RECORD_DELETE_NOT_FOUND', { recordId: id, userId }, userId);
        throw new Error('Registro de datos no encontrado');
      }

      // Log del registro antes de eliminarlo (respaldo en logs)
      logBusinessEvent('DATA_RECORD_DELETED', {
        recordId: id,
        type: existingRecord.type,
        data: existingRecord.data,
        metadata: existingRecord.metadata,
        userId
      }, userId);

      await this.prisma.dataRecord.delete({
        where: { id },
      });

      logPerformance('DataRecordService.deleteDataRecord', Date.now() - startTime, {
        recordId: id,
        type: existingRecord.type
      });
    } catch (error) {
      logError(error as Error, 'DataRecordService.deleteDataRecord', { id, userId });
      throw error;
    }
  }

  /**
   * Busca registros por contenido JSON
   */
  async searchDataRecords(
    searchTerm: string,
    filters?: Partial<DataRecordFilters>
  ): Promise<PaginatedResponse<DataRecord>> {
    const searchFilters: DataRecordFilters = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: searchTerm,
      ...filters,
    };

    return this.getDataRecords(searchFilters);
  }

  /**
   * Obtiene estadísticas de registros de datos
   */
  async getDataRecordStats(): Promise<{
    totalRecords: number;
    recordsByType: Array<{ type: string; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
  }> {
    const startTime = Date.now();

    try {
      const [totalRecords, recordsByType, recentActivity] = await Promise.all([
        this.prisma.dataRecord.count(),
        this.prisma.dataRecord.groupBy({
          by: ['type'],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
        }),
        this.prisma.dataRecord.groupBy({
          by: ['createdAt'],
          _count: {
            id: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 30,
        }),
      ]);

      logPerformance('DataRecordService.getDataRecordStats', Date.now() - startTime);

      return {
        totalRecords,
        recordsByType: recordsByType.map(item => ({
          type: item.type,
          count: item._count.id,
        })),
        recentActivity: recentActivity.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id,
        })),
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.getDataRecordStats');
      throw error;
    }
  }
}
