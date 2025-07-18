import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import {
  errorHandler,
  BusinessError,
  ValidationError,
} from '../../src/middleware/error-handler';
import { logError } from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger');
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockRequest = {
      path: '/api/test',
      method: 'POST',
      body: { test: 'data' },
      query: { param: 'value' },
      params: { id: '123' },
    };

    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('BusinessError handling', () => {
    it('should handle BusinessError with custom status code', () => {
      const error = new BusinessError('Custom business error', 'BUSINESS_ERROR', 422);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(422);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'BUSINESS_ERROR',
          message: 'Custom business error',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
      expect(mockLogError).toHaveBeenCalledWith(
        error,
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: { test: 'data' },
          query: { param: 'value' },
          params: { id: '123' },
        })
      );
    });

    it('should handle BusinessError with default status code', () => {
      const error = new BusinessError('Default business error', 'DEFAULT_ERROR');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'DEFAULT_ERROR',
          message: 'Default business error',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });
  });

  describe('ValidationError handling', () => {
    it('should handle ValidationError with details', () => {
      const validationDetails = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short', code: 'too_small' },
      ];
      const error = new ValidationError('Validation failed', validationDetails, 422);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(422);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationDetails,
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with validation issues', () => {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        age: z.number().min(18, 'Must be at least 18 years old'),
      });

      let zodError: ZodError;
      try {
        schema.parse({ email: 'invalid-email', age: 15 });
      } catch (error) {
        zodError = error as ZodError;
      }

      errorHandler(zodError!, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String),
              code: expect.any(String),
            }),
          ]),
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });
  });

  describe('Prisma error handling', () => {
    it('should handle P2002 (unique constraint) error', () => {
      const prismaError = new Error('Unique constraint failed') as Error & { code: string };
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.code = 'P2002';

      errorHandler(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(409);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this information already exists',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });

    it('should handle P2025 (record not found) error', () => {
      const prismaError = new Error('Record not found') as Error & { code: string };
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.code = 'P2025';

      errorHandler(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });

    it('should handle unknown Prisma errors', () => {
      const prismaError = new Error('Unknown database error') as Error & { code: string };
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.code = 'P9999';

      errorHandler(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'DATABASE_ERROR',
          message: 'A database error occurred',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });
  });

  describe('JWT error handling', () => {
    it('should handle JsonWebTokenError', () => {
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';

      errorHandler(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });

    it('should handle TokenExpiredError', () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';

      errorHandler(expiredError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle unknown errors with 500 status', () => {
      const genericError = new Error('Something went wrong');

      errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          timestamp: expect.any(String),
          path: '/api/test',
        },
      });
      expect(mockLogError).toHaveBeenCalledWith(genericError, '/api/test', expect.any(Object));
    });
  });

  describe('User context logging', () => {
    it('should log user ID when available in request', () => {
      const mockRequestWithUser = {
        ...mockRequest,
        user: { id: 'user-123' },
      } as Request & { user: { id: string } };

      const error = new Error('Test error');

      errorHandler(error, mockRequestWithUser, mockResponse as Response, mockNext);

      expect(mockLogError).toHaveBeenCalledWith(
        error,
        '/api/test',
        expect.objectContaining({
          userId: 'user-123',
        })
      );
    });

    it('should handle request without user context', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogError).toHaveBeenCalledWith(
        error,
        '/api/test',
        expect.objectContaining({
          userId: undefined,
        })
      );
    });
  });

  describe('Error class constructors', () => {
    it('should create BusinessError with correct properties', () => {
      const error = new BusinessError('Test message', 'TEST_CODE', 422);

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('BusinessError');
    });

    it('should create BusinessError with default status code', () => {
      const error = new BusinessError('Test message', 'TEST_CODE');

      expect(error.statusCode).toBe(400);
    });

    it('should create ValidationError with correct properties', () => {
      const details = [{ field: 'test', message: 'Test error' }];
      const error = new ValidationError('Validation failed', details, 422);

      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('ValidationError');
    });

    it('should create ValidationError with default status code', () => {
      const details = [{ field: 'test', message: 'Test error' }];
      const error = new ValidationError('Validation failed', details);

      expect(error.statusCode).toBe(400);
    });
  });
});
