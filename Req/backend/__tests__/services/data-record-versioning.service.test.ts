import { DataRecordService } from '../../src/services/data-record.service';
import { DataRecord } from '../../src/types/data-record';

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
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  dataRecordVersion: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  deletedDataRecord: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('DataRecordService - Versioning', () => {
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

  const mockDataRecordVersion = {
    id: 'version-123',
    recordId: 'record-123',
    type: 'test_type',
    data: { name: 'Test Record', value: 42 },
    metadata: { source: 'test' },
    version: 1,
    createdBy: 'user-123',
    updatedBy: 'user-123',
    archivedBy: 'user-456',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    archivedAt: new Date('2024-01-02T00:00:00Z'),
  };

  beforeEach(() => {
    dataRecordService = new DataRecordService(mockPrismaClient as any);
    jest.clearAllMocks();
  });

  describe('getRecordVersionHistory', () => {
    it('should return version history with pagination', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      const mockVersions = [mockDataRecordVersion];
      mockPrismaClient.dataRecordVersion.findMany.mockResolvedValue(mockVersions);
      mockPrismaClient.dataRecordVersion.count.mockResolvedValue(1);

      // Act
      const result = await dataRecordService.getRecordVersionHistory('record-123', 1, 10);

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringContaining('current_'),
            version: mockDataRecord.version,
            isCurrent: true
          }),
          ...mockVersions
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2, // 1 version + current
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      expect(mockPrismaClient.dataRecordVersion.findMany).toHaveBeenCalledWith({
        where: { recordId: 'record-123' },
        orderBy: { version: 'desc' },
        skip: 0,
        take: 10,
        include: expect.any(Object)
      });
    });
  });

  describe('restoreRecordVersion', () => {
    it('should restore a previous version of a record', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      mockPrismaClient.dataRecordVersion.findFirst.mockResolvedValue(mockDataRecordVersion);

      const updatedRecord = {
        ...mockDataRecord,
        data: mockDataRecordVersion.data,
        metadata: mockDataRecordVersion.metadata,
        version: 2,
        updatedBy: 'user-456',
      };

      mockPrismaClient.dataRecord.update.mockResolvedValue(updatedRecord);

      // Act
      const result = await dataRecordService.restoreRecordVersion(
        'record-123',
        1,
        'user-456'
      );

      // Assert
      expect(result).toEqual(updatedRecord);
      expect(mockPrismaClient.dataRecordVersion.findFirst).toHaveBeenCalledWith({
        where: {
          recordId: 'record-123',
          version: 1,
        },
      });

      expect(mockPrismaClient.dataRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-123' },
        data: expect.objectContaining({
          data: mockDataRecordVersion.data,
          metadata: mockDataRecordVersion.metadata,
          type: mockDataRecordVersion.type,
          updatedBy: 'user-456',
          version: {
            increment: 1
          }
        })
      });
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.restoreRecordVersion('nonexistent', 1, 'user-456')
      ).rejects.toThrow('Registro de datos no encontrado');
    });

    it('should throw error if version not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(mockDataRecord);
      mockPrismaClient.dataRecordVersion.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.restoreRecordVersion('record-123', 999, 'user-456')
      ).rejects.toThrow('Versión 999 no encontrada para el registro record-123');
    });
  });

  describe('checkVersionConflict', () => {
    it('should detect no conflict when versions match', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue({
        ...mockDataRecord,
        version: 3,
        updater: {
          id: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
      });

      // Act
      const result = await dataRecordService.checkVersionConflict('record-123', 3);

      // Assert
      expect(result).toEqual({
        hasConflict: false,
        currentVersion: 3,
        lastModifiedBy: 'John Doe',
        lastModifiedAt: mockDataRecord.updatedAt
      });
    });

    it('should detect conflict when versions do not match', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue({
        ...mockDataRecord,
        version: 5,
        updater: {
          id: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
      });

      // Act
      const result = await dataRecordService.checkVersionConflict('record-123', 3);

      // Assert
      expect(result).toEqual({
        hasConflict: true,
        currentVersion: 5,
        lastModifiedBy: 'John Doe',
        lastModifiedAt: mockDataRecord.updatedAt
      });
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.checkVersionConflict('nonexistent', 1)
      ).rejects.toThrow('Registro de datos no encontrado');
    });
  });

  describe('recoverDeletedRecord', () => {
    it('should recover a deleted record', async () => {
      // Arrange
      const deletedRecord = {
        ...mockDataRecord,
        deletedAt: new Date('2024-01-02T00:00:00Z'),
        deletedBy: 'user-456'
      };

      // First call returns the deleted record, second call returns null (no active record with same ID)
      mockPrismaClient.dataRecord.findFirst
        .mockResolvedValueOnce(deletedRecord)
        .mockResolvedValueOnce(null);

      const recoveredRecord = {
        ...mockDataRecord,
        version: 2,
        updatedBy: 'user-456',
        deletedAt: null,
        deletedBy: null
      };

      mockPrismaClient.dataRecord.update.mockResolvedValue(recoveredRecord);

      // Act
      const result = await dataRecordService.recoverDeletedRecord('record-123', 'user-456');

      // Assert
      expect(result).toEqual(recoveredRecord);
      expect(mockPrismaClient.dataRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-123' },
        data: expect.objectContaining({
          deletedAt: null,
          deletedBy: null,
          updatedBy: 'user-456',
          version: {
            increment: 1
          }
        })
      });
    });

    it('should throw error if record not found', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        dataRecordService.recoverDeletedRecord('nonexistent', 'user-456')
      ).rejects.toThrow('Registro no encontrado');
    });

    it('should throw error if record is not deleted', async () => {
      // Arrange
      mockPrismaClient.dataRecord.findFirst.mockResolvedValue({
        ...mockDataRecord,
        deletedAt: null
      });

      // Act & Assert
      await expect(
        dataRecordService.recoverDeletedRecord('record-123', 'user-456')
      ).rejects.toThrow('El registro no está eliminado');
    });

    it('should throw error if an active record with the same ID already exists', async () => {
      // Arrange
      const deletedRecord = {
        ...mockDataRecord,
        deletedAt: new Date('2024-01-02T00:00:00Z'),
        deletedBy: 'user-456'
      };

      const activeRecord = {
        ...mockDataRecord,
        deletedAt: null,
        deletedBy: null
      };

      // First call returns the deleted record, second call returns an active record with the same ID
      mockPrismaClient.dataRecord.findFirst
        .mockResolvedValueOnce(deletedRecord)
        .mockResolvedValueOnce(activeRecord);

      // Act & Assert
      await expect(
        dataRecordService.recoverDeletedRecord('record-123', 'user-456')
      ).rejects.toThrow('Ya existe un registro activo con este ID');

      expect(mockPrismaClient.dataRecord.update).not.toHaveBeenCalled();
    });
  });
});
