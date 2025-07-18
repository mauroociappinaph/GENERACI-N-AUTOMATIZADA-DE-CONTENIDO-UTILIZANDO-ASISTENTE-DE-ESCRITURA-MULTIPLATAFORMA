import { Request, Response } from 'express';
import { DataRecordController } from '../../src/controllers/data-record.controller';
import { DataValidationService } from '../../src/services/data-validation.service';

// Mock DataRecordService
jest.mock('../../src/services/data-record.service');

// Mock DataValidationService
jest.mock('../../src/services/data-validation.service');
const MockedDataValidationService = DataValidationService as jest.Mocked<typeof DataValidationService>;

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logError: jest.fn(),
  logBusinessEvent: jest.fn(),
}));

// Mock prisma
jest.mock('../../src/config/prisma', () => ({
  prisma: {},
}));

import { UserRole } from '@prisma/client';
import { UserResponse } from '../../src/types/user';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: UserResponse;
}

describe('DataRecordController - Advanced Features', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;

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

    // Create a mock instance for DataRecordService
    (DataRecordController as any).dataRecordService = {
      getDataRecords: jest.fn(),
      searchDataRecords: jest.fn(),
      getDataRecordStats: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('getDataRecords with advanced filters', () => {
    it('should handle dynamic data filters', async () => {
      // Arrange
      mockRequest.query = {
        page: '1',
        limit: '10',
        df: JSON.stringify({ name: 'Test', active: true }),
      };

      (DataRecordController as any).dataRecordService.getDataRecords.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      // Act
      await DataRecordController.getDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect((DataRecordController as any).dataRecordService.getDataRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          dataFilters: { name: 'Test', active: true },
        })
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle invalid JSON in data filters', async () => {
      // Arrange
      mockRequest.query = {
        page: '1',
        limit: '10',
        df: '{invalid-json',
      };

      // Act
      await DataRecordController.getDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Formato de filtros de datos inválido',
          }),
        })
      );
    });
  });

  describe('getDataTypes', () => {
    it('should return registered data types', async () => {
      // Arrange
      const mockTypes = ['user_profile', 'product', 'order'];
      MockedDataValidationService.getRegisteredTypes.mockReturnValue(mockTypes);

      // Act
      await DataRecordController.getDataTypes(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(MockedDataValidationService.getRegisteredTypes).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTypes,
        meta: expect.any(Object),
      });
    });

    it('should handle errors', async () => {
      // Arrange
      MockedDataValidationService.getRegisteredTypes.mockImplementation(() => {
        throw new Error('Test error');
      });

      // Act
      await DataRecordController.getDataTypes(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
            message: 'Error al obtener tipos de datos',
          }),
        })
      );
    });
  });

  describe('getDataRecordStats', () => {
    it('should return data record statistics', async () => {
      // Arrange
      const mockStats = {
        totalRecords: 100,
        recordsByType: [{ type: 'user_profile', count: 50 }, { type: 'product', count: 50 }],
        recentActivity: [{ date: '2024-07-16', count: 10 }],
      };
      (DataRecordController as any).dataRecordService.getDataRecordStats.mockResolvedValue(mockStats);

      // Act
      await DataRecordController.getDataRecordStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect((DataRecordController as any).dataRecordService.getDataRecordStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockStats,
        meta: expect.any(Object),
      });
    });

    it('should handle errors', async () => {
      // Arrange
      (DataRecordController as any).dataRecordService.getDataRecordStats.mockRejectedValue(
        new Error('Test error')
      );

      // Act
      await DataRecordController.getDataRecordStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
            message: 'Error al obtener estadísticas de registros',
          }),
        })
      );
    });
  });

  describe('searchDataRecords', () => {
    it('should search data records with search term', async () => {
      // Arrange
      mockRequest.query = {
        searchTerm: 'test',
        type: 'user_profile',
        page: '2',
        limit: '20',
      };

      const mockResult = {
        data: [{ id: 'record-1', type: 'user_profile', data: { name: 'Test' } }],
        pagination: {
          page: 2,
          limit: 20,
          total: 30,
          totalPages: 2,
          hasNext: false,
          hasPrev: true,
        },
      };

      (DataRecordController as any).dataRecordService.searchDataRecords.mockResolvedValue(mockResult);

      // Act
      await DataRecordController.searchDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect((DataRecordController as any).dataRecordService.searchDataRecords).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({
          type: 'user_profile',
          page: 2,
          limit: 20,
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockResult.data,
        pagination: mockResult.pagination,
        meta: expect.objectContaining({
          searchTerm: 'test',
        }),
      });
    });

    it('should require search term', async () => {
      // Arrange
      mockRequest.query = {};

      // Act
      await DataRecordController.searchDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Término de búsqueda requerido',
          }),
        })
      );
    });

    it('should handle errors', async () => {
      // Arrange
      mockRequest.query = { searchTerm: 'test' };
      (DataRecordController as any).dataRecordService.searchDataRecords.mockRejectedValue(
        new Error('Test error')
      );

      // Act
      await DataRecordController.searchDataRecords(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
            message: 'Error al buscar registros de datos',
          }),
        })
      );
    });
  });
});
