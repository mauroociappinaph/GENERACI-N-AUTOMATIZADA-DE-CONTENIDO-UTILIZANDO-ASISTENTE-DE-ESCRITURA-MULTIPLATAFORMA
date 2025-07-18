import { DataRecordService } from '../../src/services/data-record.service';
import { DataValidationService } from '../../src/services/data-validation.service';
import { DataRecord } from '../../src/types/data-record';
import { CreateDataRecordInput, UpdateDataRecordInput, DataRecordFilters } from '../../src/types/data-record';

// Mock DataValidationService
jest.mock('../../src/services/data-validation.service');
const MockedDataValidationService = DataValidationService as jest.Mocked<typeof DataValidationService>;

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  logError: jest.fn(),
  logBusinessEvent: jest.fn(),
  logPerformance: jest.fn(),
}));

// Mock Prisma Client
const mockPrismaClient = {
  dataRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  dataRecordVersion: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('DataRecordService', () => {
  let dataRecordService: DataRecordService;

  const mockDataRecord: DataRecord = {
    id: 'record-123',
    type: 'test_type',
    data: { name: 'Test Record', value: 42 },
    metadata: { source: 'test' },
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    version: 1,
    deletedAt: null,
    deletedBy: null
  };

  beforeEach(() => {
    dataRecordService = new DataRecordService(mockPrismaClient as any);
    jest.clearAllMocks();
  });

  describe('createDataRecord', () => {
    const createInput: CreateDataRecordInput = {
      type: 'test_type',
      data: { name: 'Test Record', value: 42 },
      metadata: { source: 'test' },
    };

    it('should create data record successfully with valid data', async () => {
      // Arrange
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: true,
        validatedData: createInput.data,
      });
      MockedDataValidationService.validateMetadata.mockReturnValue({
        isValid: true,
        validatedData: createInput.metadata,
      });
      mockPrismaClient.dataRecord.create.mockResolvedValue(mockDataRecord);

      // Act
      const result = await dataRecordService.createDataRecord(createInput, 'user-123');

      // Assert
      expect(result).toEqual(mockDataRecord);
      expect(MockedDataValidationService.validateDataByType).toHaveBeenCalledWith(
        createInput.type,
        createInput.data
      );
      expect(MockedDataValidationService.validateMetadata).toHaveBeenCalledWith(
        createInput.metadata
      );
      expect(mockPrismaClient.dataRecord.create).toHaveBeenCalledWith({
        data: {
          ...createInput,
          data: createInput.data,
          createdBy: 'user-123',
          updatedBy: 'user-123',
          version: 1,
        },
      });
    });

    it('should throw error for invalid data validation', async () => {
      // Arrange
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: false,
        errors: ['Invalid data format'],
      });

      // Act & Assert
      await expect(
        dataRecordService.createDataRecord(createInput, 'user-123')
      ).rejects.toThrow('Validación fallida: Invalid data format');

      expect(mockPrismaClient.dataRecord.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid metadata validation', async () => {
      // Arrange
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: true,
        validatedData: createInput.data,
      });
      MockedDataValidationService.validateMetadata.mockReturnValue({
        isValid: false,
        errors: ['Invalid metadata format'],
      });

      // Act & Assert
      await expect(
        dataRecordService.createDataRecord(createInput, 'user-123')
      ).rejects.toThrow('Validación de metadatos fallida: Invalid metadata format');

      expect(mockPrismaClient.dataRecord.create).not.toHaveBeenCalled();
    });

    it('should create record without metadata', async () => {
      // Arrange
      const inputWithoutMetadata = { ...createInput };
      delete inputWithoutMetadata.metadata;

      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: true,
        validatedData: createInput.data,
      });
      mockPrismaClient.dataRecord.create.mockResolvedValue(mockDataRecord);

      // Act
      const result = await dataRecordService.createDataRecord(inputWithoutMetadata, 'user-123');

      // Assert
      expect(result).toEqual(mockDataRecord);
      expect(MockedDataValidationService.validateMetadata).not.toHaveBeenCalled();
    });
  });

  describe('getDataRecords', () => {
    const mockDataRecords = [mockDataRecord];
    const filters: DataRecordFilters = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    it('should return paginated data records', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      const result = await dataRecordService.getDataRecords(filters);

      // Assert
      expect(result).toEqual({
        data: mockDataRecords,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null
          }),
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      );
    });

    it('should apply type filter', async () => {
      // Arrange
      const filtersWithType = { ...filters, type: 'specific_type' };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.getDataRecords(filtersWithType);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'specific_type',
            deletedAt: null
          }),
        })
      );
    });

    it('should apply createdBy filter', async () => {
      // Arrange
      const filtersWithCreatedBy = { ...filters, createdBy: 'user-456' };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.getDataRecords(filtersWithCreatedBy);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdBy: 'user-456',
            deletedAt: null
          }),
        })
      );
    });

    it('should apply date range filters', async () => {
      // Arrange
      const filtersWithDates = {
        ...filters,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.getDataRecords(filtersWithDates);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
            deletedAt: null
          }),
        })
      );
    });

    it('should apply search filter', async () => {
      // Arrange
      const filtersWithSearch = { ...filters, search: 'test search' };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.getDataRecords(filtersWithSearch);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: expect.arrayContaining([
              expect.objectContaining({
                type: {
                  contains: 'test search',
                  mode: 'insensitive'
                }
              })
            ])
          }),
        })
      );
    });

    it('should handle different sort options', async () => {
      // Arrange
      const filtersWithSort = { ...filters, sortBy: 'updatedAt' as const, sortOrder: 'asc' as const };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.getDataRecords(filtersWithSort);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'asc' },
        })
      );
    });

    it('should calculate pagination correctly', async () => {
      // Arrange
      const filtersPage2 = { ...filters, page: 2, limit: 5 };
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(12);

      // Act
      const result = await dataRecordService.getDataRecords(filtersPage2);

      // Assert
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit
          take: 5,
        })
      );
    });
  });

  describe('getDataRecordById', () => {
    it('should return data record by id', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);

      // Act
      const result = await dataRecordService.getDataRecordById('record-123');

      // Assert
      expect(result).toEqual(mockDataRecord);
      expect(mockPrismaClient.dataRecord.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'record-123',
          deletedAt: null // Solo registros no eliminados
        }
      });
    });

    it('should return null if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act
      const result = await dataRecordService.getDataRecordById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateDataRecord', () => {
    const updateInput: UpdateDataRecordInput = {
      data: { name: 'Updated Record', value: 100 },
      metadata: { source: 'updated' },
    };

    it('should update data record successfully', async () => {
      // Arrange
      const updatedRecord = { ...mockDataRecord, ...updateInput };
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: true,
        validatedData: updateInput.data,
      });
      MockedDataValidationService.validateMetadata.mockReturnValue({
        isValid: true,
        validatedData: updateInput.metadata,
      });
      mockPrismaClient.dataRecord.update.mockResolvedValue(updatedRecord);

      // Act
      const result = await dataRecordService.updateDataRecord('record-123', updateInput, 'user-123');

      // Assert
      expect(result).toEqual(updatedRecord);
      expect(MockedDataValidationService.validateDataByType).toHaveBeenCalledWith(
        mockDataRecord.type,
        updateInput.data
      );
      expect(mockPrismaClient.dataRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'record-123' },
          data: expect.objectContaining({
            data: updateInput.data,
            metadata: updateInput.metadata,
            updatedBy: 'user-123',
            version: { increment: 1 }
          }),
        })
      );
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.updateDataRecord('nonexistent', updateInput, 'user-123')
      ).rejects.toThrow('Registro de datos no encontrado');

      expect(mockPrismaClient.dataRecord.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid data validation', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: false,
        errors: ['Invalid update data'],
      });

      // Act & Assert
      await expect(
        dataRecordService.updateDataRecord('record-123', updateInput, 'user-123')
      ).rejects.toThrow('Validación fallida: Invalid update data');

      expect(mockPrismaClient.dataRecord.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      // Arrange
      const partialUpdate = { data: { name: 'Partial Update' } };
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      MockedDataValidationService.validateDataByType.mockResolvedValue({
        isValid: true,
        validatedData: partialUpdate.data,
      });
      mockPrismaClient.dataRecord.update.mockResolvedValue(mockDataRecord);

      // Act
      await dataRecordService.updateDataRecord('record-123', partialUpdate, 'user-123');

      // Assert
      expect(MockedDataValidationService.validateMetadata).not.toHaveBeenCalled();
      expect(mockPrismaClient.dataRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'record-123' },
          data: expect.objectContaining({
            data: partialUpdate.data,
            updatedBy: 'user-123',
            version: { increment: 1 }
          }),
        })
      );
    });
  });

  describe('deleteDataRecord', () => {
    it('should delete data record successfully', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      mockPrismaClient.dataRecord.update.mockResolvedValue(mockDataRecord);

      // Act
      await dataRecordService.deleteDataRecord('record-123', 'user-123');

      // Assert
      expect(mockPrismaClient.dataRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-123' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          deletedBy: 'user-123'
        })
      });
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.deleteDataRecord('nonexistent', 'user-123')
      ).rejects.toThrow('Registro de datos no encontrado');

      expect(mockPrismaClient.dataRecord.update).not.toHaveBeenCalled();
    });
  });

  describe('searchDataRecords', () => {
    it('should search data records with search term', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      const result = await dataRecordService.searchDataRecords('test search');

      // Assert
      expect(result.data).toEqual(mockDataRecords);
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: expect.arrayContaining([
              expect.objectContaining({
                type: {
                  contains: 'test search',
                  mode: 'insensitive'
                }
              })
            ])
          }),
        })
      );
    });

    it('should apply additional filters to search', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      await dataRecordService.searchDataRecords('test search', {
        type: 'specific_type',
        page: 2,
        limit: 5,
      });

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'specific_type',
            deletedAt: null,
            OR: expect.arrayContaining([
              expect.objectContaining({
                type: {
                  contains: 'test search',
                  mode: 'insensitive'
                }
              })
            ])
          }),
          skip: 5,
          take: 5,
        })
      );
    });
  });

  describe('getDataRecordStats', () => {
    it('should return data record statistics', async () => {
      // Arrange
      const mockTypeStats = [
        { type: 'type1', _count: { id: 10 } },
        { type: 'type2', _count: { id: 5 } },
      ];
      const mockDailyStats = [
        { date: '2024-01-15', count: 3 },
        { date: '2024-01-14', count: 2 },
      ];

      mockPrismaClient.dataRecord.count.mockResolvedValue(15);
      mockPrismaClient.dataRecord.groupBy.mockResolvedValue(mockTypeStats);
      mockPrismaClient.$queryRaw.mockResolvedValue(mockDailyStats);

      // Act
      const result = await dataRecordService.getDataRecordStats();

      // Assert
      expect(result).toEqual({
        totalRecords: 15,
        deletedRecords: 15,
        byType: [
          { type: 'type1', count: 10 },
          { type: 'type2', count: 5 },
        ],
        byDate: mockDailyStats
      });

      expect(mockPrismaClient.dataRecord.count).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.dataRecord.groupBy).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with multiple criteria', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      const criteria = {
        searchTerms: ['test', 'record'],
        dataFields: { name: 'Test', value: 42 },
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31')
        },
        types: ['test_type'],
        exactMatch: true
      };

      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'createdAt', order: 'desc' as const };

      // Act
      const result = await dataRecordService.advancedSearch(criteria, pagination, sorting);

      // Assert
      expect(result.data).toEqual(mockDataRecords);
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            type: { in: ['test_type'] },
            createdAt: {
              gte: criteria.dateRange.from,
              lte: criteria.dateRange.to
            }
          }),
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      );
    });

    it('should handle empty criteria', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      const criteria = {};
      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'updatedAt', order: 'asc' as const };

      // Act
      const result = await dataRecordService.advancedSearch(criteria, pagination, sorting);

      // Assert
      expect(result.data).toEqual(mockDataRecords);
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null
          }),
          skip: 0,
          take: 10,
          orderBy: { updatedAt: 'asc' }
        })
      );
    });

    it('should handle data field filtering with exact match', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      const criteria = {
        dataFields: { name: 'Exact Name', active: true, count: 5 },
        exactMatch: true
      };
      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'createdAt', order: 'desc' as const };

      // Act
      await dataRecordService.advancedSearch(criteria, pagination, sorting);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            AND: expect.arrayContaining([
              expect.objectContaining({
                data: expect.objectContaining({
                  path: ['name'],
                  equals: 'Exact Name'
                })
              }),
              expect.objectContaining({
                data: expect.objectContaining({
                  path: ['active'],
                  equals: true
                })
              }),
              expect.objectContaining({
                data: expect.objectContaining({
                  path: ['count'],
                  equals: 5
                })
              })
            ])
          })
        })
      );
    });
  });

  describe('applyDynamicFilters', () => {
    it('should apply dynamic filters to data records', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      const filters = [
        { field: 'type', operator: 'eq' as const, value: 'test_type' },
        { field: 'name', operator: 'contains' as const, value: 'Test' },
        { field: 'active', operator: 'eq' as const, value: true }
      ];
      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'createdAt', order: 'desc' as const };

      // Act
      const result = await dataRecordService.applyDynamicFilters(filters, pagination, sorting);

      // Assert
      expect(result.data).toEqual(mockDataRecords);
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            AND: expect.arrayContaining([
              expect.objectContaining({
                type: { equals: 'test_type' }
              })
            ])
          }),
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      );
    });

    it('should handle different operators in dynamic filters', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      const filters = [
        { field: 'createdAt', operator: 'gt' as const, value: '2024-01-01' },
        { field: 'value', operator: 'gte' as const, value: 10 },
        { field: 'value', operator: 'lt' as const, value: 100 },
        { field: 'name', operator: 'startsWith' as const, value: 'Test' },
        { field: 'tags', operator: 'in' as const, value: ['tag1', 'tag2'] }
      ];
      const pagination = { page: 1, limit: 10 };
      const sorting = { field: 'createdAt', order: 'desc' as const };

      // Act
      await dataRecordService.applyDynamicFilters(filters, pagination, sorting);

      // Assert
      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            AND: expect.arrayContaining([
              expect.objectContaining({
                createdAt: { gt: '2024-01-01' }
              })
            ])
          }),
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      );
    });
  });
});
