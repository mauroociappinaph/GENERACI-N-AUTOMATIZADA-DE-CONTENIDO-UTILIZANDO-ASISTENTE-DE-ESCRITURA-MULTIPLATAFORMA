import { DataRecordService } from '../../src/services/data-record.service';
import { DataValidationService } from '../../src/services/data-validation.service';
import { DataRecord } from '@prisma/client';
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
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
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

      expect(mockPrismaClient.dataRecord.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
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
          where: { type: 'specific_type' },
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
          where: { createdBy: 'user-456' },
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
          where: {
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          },
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
            OR: [
              {
                type: {
                  contains: 'test search',
                },
              },
            ],
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

  describe('getDataRecordsSimple', () => {
    it('should return data in simple format', async () => {
      // Arrange
      const mockDataRecords = [mockDataRecord];
      mockPrismaClient.dataRecord.findMany.mockResolvedValue(mockDataRecords);
      mockPrismaClient.dataRecord.count.mockResolvedValue(1);

      // Act
      const result = await dataRecordService.getDataRecordsSimple(1, 10, 'test_type', 'user-123');

      // Assert
      expect(result).toEqual({
        dataRecords: mockDataRecords,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe('getDataRecordById', () => {
    it('should return data record by id', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(mockDataRecord);

      // Act
      const result = await dataRecordService.getDataRecordById('record-123');

      // Assert
      expect(result).toEqual(mockDataRecord);
      expect(mockPrismaClient.dataRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 'record-123' },
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
    });

    it('should return null if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(null);

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
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(mockDataRecord);
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
            ...updateInput,
            updater: { connect: { id: 'user-123' } },
          }),
        })
      );
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.updateDataRecord('nonexistent', updateInput, 'user-123')
      ).rejects.toThrow('Registro de datos no encontrado');

      expect(mockPrismaClient.dataRecord.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid data validation', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(mockDataRecord);
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
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(mockDataRecord);
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
            ...partialUpdate,
            updater: { connect: { id: 'user-123' } },
          }),
        })
      );
    });
  });

  describe('deleteDataRecord', () => {
    it('should delete data record successfully', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(mockDataRecord);
      mockPrismaClient.dataRecord.delete.mockResolvedValue(mockDataRecord);

      // Act
      await dataRecordService.deleteDataRecord('record-123', 'user-123');

      // Assert
      expect(mockPrismaClient.dataRecord.delete).toHaveBeenCalledWith({
        where: { id: 'record-123' },
      });
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.deleteDataRecord('nonexistent', 'user-123')
      ).rejects.toThrow('Registro de datos no encontrado');

      expect(mockPrismaClient.dataRecord.delete).not.toHaveBeenCalled();
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
            OR: [
              {
                type: {
                  contains: 'test search',
                },
              },
            ],
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
            OR: [
              {
                type: {
                  contains: 'test search',
                },
              },
            ],
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
      const mockRecordsByType = [
        { type: 'type1', _count: { id: 10 } },
        { type: 'type2', _count: { id: 5 } },
      ];
      const mockRecentActivity = [
        { createdAt: new Date('2024-01-15'), _count: { id: 3 } },
        { createdAt: new Date('2024-01-14'), _count: { id: 2 } },
      ];

      mockPrismaClient.dataRecord.count.mockResolvedValue(15);
      mockPrismaClient.dataRecord.groupBy
        .mockResolvedValueOnce(mockRecordsByType)
        .mockResolvedValueOnce(mockRecentActivity);

      // Act
      const result = await dataRecordService.getDataRecordStats();

      // Assert
      expect(result).toEqual({
        totalRecords: 15,
        recordsByType: [
          { type: 'type1', count: 10 },
          { type: 'type2', count: 5 },
        ],
        recentActivity: [
          { date: '2024-01-15', count: 3 },
          { date: '2024-01-14', count: 2 },
        ],
      });

      expect(mockPrismaClient.dataRecord.count).toHaveBeenCalled();
      expect(mockPrismaClient.dataRecord.groupBy).toHaveBeenCalledTimes(2);
    });
  });
});
