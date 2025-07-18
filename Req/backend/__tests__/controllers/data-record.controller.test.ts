import { Request, Response } from 'express';
import { DataRecordController } from '../../src/controllers/data-record.controller';
import { DataRecordService } from '../../src/services/data-record.service';

// Mock DataRecordService
jest.mock('../../src/services/data-record.service');

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logError: jest.fn(),
  logBusinessEvent: jest.fn(),
}));

// Mock prisma
jest.mock('../../src/config/prisma', () => ({
  prisma: {},
}));

import { UserResponse } from '../../src/types/user';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: UserResponse;
}

describe('DataRecordController', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockDataRecordService: jest.Mocked<DataRecordService>;

  const mockDataRecord = {
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
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ip: '127.0.0.1',
      path: '/api/data-records',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Create a mock instance
    mockDataRecordService = {
      createDataRecord: jest.fn(),
      getDataRecords: jest.fn(),
      getDataRecordById: jest.fn(),
      updateDataRecord: jest.fn(),
      deleteDataRecord: jest.fn(),
      getDataRecordsSimple: jest.fn(),
      searchDataRecords: jest.fn(),
      getDataRecordStats: jest.fn(),
    } as any;

    // Mock the static service instance
    (DataRecordController as any).dataRecordService = mockDataRecordService;

    jest.clearAllMocks();
  });

  describe('createDataRecord', () => {
    const createInput = {
      type: 'test_type',
      data: { name: 'Test Record', value: 42 },
      metadata: { source: 'test' },
    };

    it('should create data record successfully', async () => {
      // Arrange
      mockRequest.body = createInput;
      mockDataRecordService.createDataRecord.mockResolvedValue(mockDataRecord);

      // Act
      await DataRecordController.createDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.createDataRecord).toHaveBeenCalledWith(createInput, 'user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockDataRecord,
        meta: {
          timestamp: expect.any(String),
          version: '1.0',
        },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.body = createInput;

      // Act
      await DataRecordController.createDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.createDataRecord).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockRequest.body = createInput;
      mockDataRecordService.createDataRecord.mockRejectedValue(
        new Error('Validación fallida: Invalid data format')
      );

      // Act
      await DataRecordController.createDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: 'Validación fallida: Invalid data format',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle internal server errors', async () => {
      // Arrange
      mockRequest.body = createInput;
      mockDataRecordService.createDataRecord.mockRejectedValue(new Error('Database error'));

      // Act
      await DataRecordController.createDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear registro de datos',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });
  });

  describe('getDataRecords', () => {
    const mockPaginatedResponse = {
      data: [mockDataRecord],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    it('should get data records with valid filters', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10', type: 'test_type' };
      mockDataRecordService.getDataRecords.mockResolvedValue(mockPaginatedResponse);

      // Act
      await DataRecordController.getDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.getDataRecords).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        type: 'test_type',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockPaginatedResponse.data,
        pagination: mockPaginatedResponse.pagination,
        meta: {
          timestamp: expect.any(String),
          version: '1.0',
        },
      });
    });

    it('should handle invalid filter parameters', async () => {
      // Arrange
      mockRequest.query = { page: 'invalid', limit: '0' };

      // Act
      await DataRecordController.getDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.getDataRecords).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parámetros de filtrado inválidos',
          details: expect.any(Array),
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10' };
      mockDataRecordService.getDataRecords.mockRejectedValue(new Error('Database error'));

      // Act
      await DataRecordController.getDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener registros de datos',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });
  });

  describe('getDataRecordById', () => {
    it('should get data record by id successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockDataRecordService.getDataRecordById.mockResolvedValue(mockDataRecord);

      // Act
      await DataRecordController.getDataRecordById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.getDataRecordById).toHaveBeenCalledWith('record-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockDataRecord,
        meta: {
          timestamp: expect.any(String),
          version: '1.0',
        },
      });
    });

    it('should return 404 if record not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent' };
      mockDataRecordService.getDataRecordById.mockResolvedValue(null);

      // Act
      await DataRecordController.getDataRecordById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'DATA_RECORD_NOT_FOUND',
          message: 'Registro de datos no encontrado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockDataRecordService.getDataRecordById.mockRejectedValue(new Error('Database error'));

      // Act
      await DataRecordController.getDataRecordById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener registro de datos',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });
  });

  describe('updateDataRecord', () => {
    const updateInput = {
      data: { name: 'Updated Record', value: 100 },
      metadata: { source: 'updated' },
    };

    it('should update data record successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockRequest.body = updateInput;
      const updatedRecord = { ...mockDataRecord, ...updateInput };
      mockDataRecordService.updateDataRecord.mockResolvedValue(updatedRecord);

      // Act
      await DataRecordController.updateDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.updateDataRecord).toHaveBeenCalledWith(
        'record-123',
        updateInput,
        'user-123'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: updatedRecord,
        meta: {
          timestamp: expect.any(String),
          version: '1.0',
        },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: 'record-123' };
      mockRequest.body = updateInput;

      // Act
      await DataRecordController.updateDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.updateDataRecord).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should return 404 if record not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = updateInput;
      mockDataRecordService.updateDataRecord.mockRejectedValue(
        new Error('Registro de datos no encontrado')
      );

      // Act
      await DataRecordController.updateDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'DATA_RECORD_NOT_FOUND',
          message: 'Registro de datos no encontrado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockRequest.body = updateInput;
      mockDataRecordService.updateDataRecord.mockRejectedValue(
        new Error('Validación fallida: Invalid update data')
      );

      // Act
      await DataRecordController.updateDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: 'Validación fallida: Invalid update data',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });
  });

  describe('deleteDataRecord', () => {
    it('should delete data record successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockDataRecordService.deleteDataRecord.mockResolvedValue();

      // Act
      await DataRecordController.deleteDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.deleteDataRecord).toHaveBeenCalledWith('record-123', 'user-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Registro de datos eliminado exitosamente' },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: 'record-123' };

      // Act
      await DataRecordController.deleteDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDataRecordService.deleteDataRecord).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should return 404 if record not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent' };
      mockDataRecordService.deleteDataRecord.mockRejectedValue(
        new Error('Registro de datos no encontrado')
      );

      // Act
      await DataRecordController.deleteDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'DATA_RECORD_NOT_FOUND',
          message: 'Registro de datos no encontrado',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.params = { id: 'record-123' };
      mockDataRecordService.deleteDataRecord.mockRejectedValue(new Error('Database error'));

      // Act
      await DataRecordController.deleteDataRecord(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al eliminar registro de datos',
          timestamp: expect.any(String),
          path: '/api/data-records',
        },
      });
    });
  });
});
