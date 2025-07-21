import { PrismaClient } from '@prisma/client';
import { DataRecordCrudService } from './data-record/crud.service';
import { DataRecordVersioningService } from './data-record/versioning.service';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
  DataRecordFilters,
  PaginatedResponse,
  AdvancedSearchParams,
  DynamicFilter,
  DataRecord
} from '@/types/data-record';
import { logError, logPerformance } from '@/utils/logger';
import {
  buildBasicWhereConditions,
  buildDateRangeConditions,
  buildSearchConditions,
  buildDataFilterConditions,
  buildAdvancedSearchConditions,
  buildSearchTermsConditions,
  buildDataFieldConditions,
  mergeORConditions,
  mergeANDConditions
} from '@/helpers/data-record/query-builders';
import {
  buildDynamicFilterConditions,
  sanitizeDynamicFilters
} from '@/helpers/data-record/filter-builders';
import {
  validateDataRecordFilters,
  validateAdvancedSearchParams,
  validateSearchTerm,
  sanitizeSearchTerm
} from '@/helpers/validation/form-validators';
import { getDaysAgo } from '@/helpers/formatting/date-formatters';

/**
 * Servicio principal para la gestión de registros de datos
 * Integra los diferentes servicios especializados
 */
export class DataRecordService {
  private crudService: DataRecordCrudService;
  private versioningService: DataRecordVersioningService;

  constructor(private prisma: PrismaClient) {
    this.crudService = new DataRecordCrudService(prisma);
    this.versioningService = new DataRecordVersioningService(prisma);
  }

  /**
   * Crea un nuevo registro de datos
   */
  async createDataRecord(
    dataRecordData: CreateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    return this.crudService.createDataRecord(dataRecordData, userId);
  }

  /**
   * Obtiene todos los registros de datos con paginación y filtros
   */
  async getDataRecords(filters: DataRecordFilters): Promise<PaginatedResponse<DataRecord>> {
    const startTime = Date.now();
    try {
      const {
        page = 1,
        limit = 10,
        type,
        createdBy,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        dataFilters
      } = filters;

      // Construir condiciones de filtrado
      const where: Record<string, unknown> = {
        deletedAt: null, // Solo registros no eliminados
      };

      // Filtrar por tipo
      if (type) {
        where.type = type;
      }

      // Filtrar por creador
      if (createdBy) {
        where.createdBy = createdBy;
      }

      // Filtrar por rango de fechas
      if (dateFrom || dateTo) {
        const dateFilter: { gte?: Date; lte?: Date } = {};

        if (dateFrom) {
          dateFilter.gte = new Date(dateFrom);
        }

        if (dateTo) {
          dateFilter.lte = new Date(dateTo);
        }

        where.createdAt = dateFilter;
      }

      // Filtrar por término de búsqueda
      if (search) {
        where.OR = [
          {
            type: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            data: {
              path: ['$'],
              string_contains: search
            }
          }
        ];
      }

      // Aplicar filtros dinámicos de datos si existen
      if (dataFilters && Object.keys(dataFilters).length > 0) {
        // Convertir filtros de datos a condiciones de Prisma
        const dataFilterConditions = Object.entries(dataFilters).map(([key, value]) => ({
          data: {
            path: [key],
            equals: value
          }
        }));

        // Agregar a las condiciones OR existentes o crear nuevas
        if (where.OR) {
          where.OR = [...where.OR, ...dataFilterConditions];
        } else {
          where.OR = dataFilterConditions;
        }
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta para obtener registros
      const [records, total] = await Promise.all([
        this.prisma.dataRecord.findMany({
          where,
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit,
        }) as Promise<DataRecord[]>,
        this.prisma.dataRecord.count({ where })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);

      // Registrar rendimiento
      logPerformance('dataRecord.getAll', Date.now() - startTime, {
        filters: JSON.stringify(filters),
        recordCount: records.length
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.getDataRecords', { filters });
      throw error;
    }
  }

  /**
   * Obtiene un registro de datos por ID
   */
  async getDataRecordById(id: string): Promise<DataRecord | null> {
    return this.crudService.getDataRecordById(id);
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
    return this.crudService.updateDataRecord(id, updateData, userId, expectedVersion);
  }

  /**
   * Elimina un registro de datos (soft delete)
   */
  async deleteDataRecord(id: string, userId: string): Promise<void> {
    return this.crudService.deleteDataRecord(id, userId);
  }

  /**
   * Busca registros de datos por término de búsqueda
   */
  async searchDataRecords(
    searchTerm: string,
    filters: Partial<DataRecordFilters> = {}
  ): Promise<PaginatedResponse<DataRecord>> {
    const startTime = Date.now();
    try {
      const {
        page = 1,
        limit = 10,
        type
      } = filters;

      // Construir condiciones de búsqueda
      const where: Record<string, unknown> = {
        deletedAt: null,
        OR: [
          {
            type: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            data: {
              path: ['$'],
              string_contains: searchTerm
            }
          }
        ]
      };

      // Filtrar por tipo si se proporciona
      if (type) {
        where.type = type;
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta para obtener registros
      const [records, total] = await Promise.all([
        this.prisma.dataRecord.findMany({
          where,
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit,
        }) as Promise<DataRecord[]>,
        this.prisma.dataRecord.count({ where })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);

      // Registrar rendimiento
      logPerformance('dataRecord.search', Date.now() - startTime, {
        searchTerm,
        recordCount: records.length
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.searchDataRecords', {
        searchTerm,
        filters
      });
      throw error;
    }
  }

  /**
   * Realiza una búsqueda avanzada con múltiples criterios
   */
  async advancedSearch(
    criteria: AdvancedSearchParams['criteria'],
    pagination: AdvancedSearchParams['pagination'],
    sorting: AdvancedSearchParams['sorting']
  ): Promise<PaginatedResponse<DataRecord>> {
    const startTime = Date.now();
    try {
      const { page = 1, limit = 10 } = pagination;
      const { field = 'createdAt', order = 'desc' } = sorting;

      // Construir condiciones de búsqueda
      const where: Record<string, unknown> = {
        deletedAt: null
      };

      // Filtrar por tipos
      if (criteria.types && criteria.types.length > 0) {
        where.type = {
          in: criteria.types
        };
      }

      // Filtrar por rango de fechas
      if (criteria.dateRange) {
        const dateFilter: { gte?: Date; lte?: Date } = {};

        if (criteria.dateRange.from) {
          dateFilter.gte = criteria.dateRange.from;
        }

        if (criteria.dateRange.to) {
          dateFilter.lte = criteria.dateRange.to;
        }

        where.createdAt = dateFilter;
      }

      // Filtrar por términos de búsqueda
      if (criteria.searchTerms && criteria.searchTerms.length > 0) {
        const searchConditions = criteria.searchTerms.map(term => ({
          OR: [
            {
              type: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              data: {
                path: ['$'],
                string_contains: term
              }
            }
          ]
        }));

        // Si es coincidencia exacta, usar AND para todos los términos
        if (criteria.exactMatch) {
          where.AND = searchConditions;
        } else {
          // Si no es coincidencia exacta, usar OR para cualquier término
          where.OR = searchConditions.flatMap(condition => condition.OR);
        }
      }

      // Filtrar por campos de datos específicos
      if (criteria.dataFields && Object.keys(criteria.dataFields).length > 0) {
        const dataFieldConditions = Object.entries(criteria.dataFields).map(([key, value]) => ({
          data: {
            path: [key],
            equals: value
          }
        }));

        // Agregar a las condiciones AND existentes o crear nuevas
        if (where.AND) {
          where.AND = [...where.AND, ...dataFieldConditions];
        } else {
          where.AND = dataFieldConditions;
        }
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta para obtener registros
      const [records, total] = await Promise.all([
        this.prisma.dataRecord.findMany({
          where,
          orderBy: {
            [field]: order
          },
          skip,
          take: limit,
        }) as Promise<DataRecord[]>,
        this.prisma.dataRecord.count({ where })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);

      // Registrar rendimiento
      logPerformance('dataRecord.advancedSearch', Date.now() - startTime, {
        criteriaCount: Object.keys(criteria).length,
        recordCount: records.length
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.advancedSearch', {
        criteria,
        pagination,
        sorting
      });
      throw error;
    }
  }

  /**
   * Aplica filtros dinámicos a los registros
   */
  async applyDynamicFilters(
    filters: DynamicFilter[],
    pagination: { page: number; limit: number },
    sorting: { field: string; order: 'asc' | 'desc' }
  ): Promise<PaginatedResponse<DataRecord>> {
    const startTime = Date.now();
    try {
      const { page = 1, limit = 10 } = pagination;
      const { field = 'createdAt', order = 'desc' } = sorting;

      // Construir condiciones de filtrado
      const where: Record<string, unknown> = {
        deletedAt: null
      };

      // Convertir filtros dinámicos a condiciones de Prisma
      if (filters.length > 0) {
        const filterConditions = filters.map(filter => {
          const { field: filterField, operator, value } = filter;

          // Determinar si el campo es un campo de datos o un campo directo
          if (filterField.includes('.')) {
            // Campo dentro de datos JSON
            const [dataField, ...nestedPath] = filterField.split('.');
            const jsonPath = nestedPath.length > 0 ? [dataField, ...nestedPath] : [dataField];

            switch (operator) {
              case 'eq':
                return { data: { path: jsonPath, equals: value } };
              case 'neq':
                return { NOT: { data: { path: jsonPath, equals: value } } };
              case 'gt':
                return { data: { path: jsonPath, gt: value } };
              case 'gte':
                return { data: { path: jsonPath, gte: value } };
              case 'lt':
                return { data: { path: jsonPath, lt: value } };
              case 'lte':
                return { data: { path: jsonPath, lte: value } };
              case 'contains':
                return { data: { path: jsonPath, string_contains: value as string } };
              case 'startsWith':
                return { data: { path: jsonPath, string_starts_with: value as string } };
              case 'endsWith':
                return { data: { path: jsonPath, string_ends_with: value as string } };
              case 'in':
                return { data: { path: jsonPath, array_contains: value } };
              default:
                return {};
            }
          } else {
            // Campo directo del registro
            switch (operator) {
              case 'eq':
                return { [filterField]: { equals: value } };
              case 'neq':
                return { NOT: { [filterField]: { equals: value } } };
              case 'gt':
                return { [filterField]: { gt: value } };
              case 'gte':
                return { [filterField]: { gte: value } };
              case 'lt':
                return { [filterField]: { lt: value } };
              case 'lte':
                return { [filterField]: { lte: value } };
              case 'contains':
                return { [filterField]: { contains: value as string, mode: 'insensitive' } };
              case 'startsWith':
                return { [filterField]: { startsWith: value as string, mode: 'insensitive' } };
              case 'endsWith':
                return { [filterField]: { endsWith: value as string, mode: 'insensitive' } };
              case 'in':
                return { [filterField]: { in: value as any[] } };
              default:
                return {};
            }
          }
        });

        // Aplicar todos los filtros como condiciones AND
        where.AND = filterConditions;
      }

      // Calcular skip para paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta para obtener registros
      const [records, total] = await Promise.all([
        this.prisma.dataRecord.findMany({
          where,
          orderBy: {
            [field]: order
          },
          skip,
          take: limit,
        }) as Promise<DataRecord[]>,
        this.prisma.dataRecord.count({ where })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);

      // Registrar rendimiento
      logPerformance('dataRecord.applyDynamicFilters', Date.now() - startTime, {
        filterCount: filters.length,
        recordCount: records.length
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.applyDynamicFilters', {
        filters,
        pagination,
        sorting
      });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de registros de datos
   */
  async getDataRecordStats(): Promise<any> {
    const startTime = Date.now();
    try {
      // Contar registros por tipo
      const typeStats = await this.prisma.dataRecord.groupBy({
        by: ['type'],
        _count: {
          id: true
        },
        where: {
          deletedAt: null
        }
      });

      // Contar registros por día (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = await this.prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM data_record
        WHERE deleted_at IS NULL AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      // Contar registros totales
      const totalRecords = await this.prisma.dataRecord.count({
        where: {
          deletedAt: null
        }
      });

      // Contar registros eliminados
      const deletedRecords = await this.prisma.dataRecord.count({
        where: {
          deletedAt: {
            not: null
          }
        }
      });

      // Registrar rendimiento
      logPerformance('dataRecord.getStats', Date.now() - startTime, {});

      return {
        totalRecords,
        deletedRecords,
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count.id
        })),
        byDate: dailyStats
      };
    } catch (error) {
      logError(error as Error, 'DataRecordService.getDataRecordStats', {});
      throw error;
    }
  }

  /**
   * Obtiene el historial de versiones de un registro
   */
  async getRecordVersionHistory(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<any>> {
    return this.versioningService.getVersionHistory(id, page, limit);
  }

  /**
   * Restaura una versión anterior de un registro
   */
  async restoreRecordVersion(
    id: string,
    version: number,
    userId: string
  ): Promise<DataRecord> {
    return this.versioningService.restoreVersion(id, version, userId);
  }

  /**
   * Recupera un registro eliminado
   */
  async recoverDeletedRecord(id: string, userId: string): Promise<DataRecord> {
    return this.crudService.recoverDeletedRecord(id, userId);
  }

  /**
   * Verifica si hay conflictos de versión para un registro
   */
  async checkVersionConflict(
    id: string,
    lastKnownVersion: number
  ): Promise<{ hasConflict: boolean; currentVersion: number; lastModifiedBy?: string; lastModifiedAt?: Date }> {
    return this.versioningService.checkVersionConflict(id, lastKnownVersion);
  }
}
