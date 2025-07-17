import { DataValidationService } from '../../src/services/data-validation.service';
import { z } from 'zod';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  logError: jest.fn(),
  logBusinessEvent: jest.fn(),
}));

describe('DataValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDataByType', () => {
    it('should validate data with registered schema', async () => {
      // Arrange
      const testSchema = z.object({
        name: z.string(),
        age: z.number(),
      });
      DataValidationService.registerTypeSchema('test_type', testSchema);

      // Act
      const result = await DataValidationService.validateDataByType('test_type', {
        name: 'Test',
        age: 30,
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual({
        name: 'Test',
        age: 30,
      });
    });

    it('should return validation errors for invalid data', async () => {
      // Arrange
      const testSchema = z.object({
        name: z.string(),
        age: z.number().min(18),
      });
      DataValidationService.registerTypeSchema('test_type', testSchema);

      // Act
      const result = await DataValidationService.validateDataByType('test_type', {
        name: 'Test',
        age: 15,
      });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('age: Too small: expected number to be >=18');
    });

    it('should infer schema from data when no schema is registered', async () => {
      // Arrange
      const data = {
        name: 'Test',
        age: 30,
        isActive: true,
      };

      // Act
      const result = await DataValidationService.validateDataByType('new_type', data);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual(data);

      // Verify the schema was registered
      expect(DataValidationService.getRegisteredTypes()).toContain('new_type');
    });

    it('should use basic validation for non-object data', async () => {
      // Act
      const result = await DataValidationService.validateDataByType('unknown_type', 'string data');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Los datos deben ser un objeto');
    });
  });

  describe('validateMetadata', () => {
    it('should validate valid metadata', () => {
      // Arrange
      const metadata = { source: 'test', timestamp: 123456789 };

      // Act
      const result = DataValidationService.validateMetadata(metadata);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual(metadata);
    });

    it('should reject non-object metadata', () => {
      // Act
      const result = DataValidationService.validateMetadata('invalid');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Los metadatos deben ser un objeto');
    });

    it('should accept null or undefined metadata', () => {
      // Act
      const result1 = DataValidationService.validateMetadata(null);
      const result2 = DataValidationService.validateMetadata(undefined);

      // Assert
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('registerTypeSchema', () => {
    it('should register and retrieve schema', () => {
      // Arrange
      const testSchema = z.object({
        name: z.string(),
      });

      // Act
      DataValidationService.registerTypeSchema('test_register', testSchema);
      const types = DataValidationService.getRegisteredTypes();
      const retrievedSchema = DataValidationService.getSchemaForType('test_register');

      // Assert
      expect(types).toContain('test_register');
      expect(retrievedSchema).toBe(testSchema);
    });

    it('should unregister schema', () => {
      // Arrange
      const testSchema = z.object({
        name: z.string(),
      });
      DataValidationService.registerTypeSchema('test_unregister', testSchema);

      // Act
      const result = DataValidationService.unregisterType('test_unregister');
      const types = DataValidationService.getRegisteredTypes();

      // Assert
      expect(result).toBe(true);
      expect(types).not.toContain('test_unregister');
    });
  });

  describe('validateWithRules', () => {
    it('should validate data with rules', () => {
      // Arrange
      const data = {
        name: 'Test',
        email: 'test@example.com',
        age: 25,
      };
      const rules = [
        { field: 'name', type: 'required' as const },
        { field: 'email', type: 'email' as const },
        { field: 'age', type: 'number' as const, min: 18, max: 100 },
      ];

      // Act
      const result = DataValidationService.validateWithRules(data, rules);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should return errors for invalid data', () => {
      // Arrange
      const data = {
        name: '',
        email: 'invalid-email',
        age: 15,
      };
      const rules = [
        { field: 'name', type: 'required' as const, message: 'Name is required' },
        { field: 'email', type: 'email' as const },
        { field: 'age', type: 'number' as const, min: 18, max: 100 },
      ];

      // Act
      const result = DataValidationService.validateWithRules(data, rules);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('email debe ser un email válido');
      expect(result.errors).toContain('age debe ser mayor o igual a 18');
    });

    it('should validate with custom validator', () => {
      // Arrange
      const data = {
        password: 'password123',
      };
      const rules = [
        {
          field: 'password',
          type: 'custom' as const,
          validator: (value: unknown) => typeof value === 'string' && value.length >= 8,
          message: 'Password must be at least 8 characters',
        },
      ];

      // Act
      const result = DataValidationService.validateWithRules(data, rules);

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple items', async () => {
      // Arrange
      const testSchema = z.object({
        name: z.string(),
      });
      DataValidationService.registerTypeSchema('batch_type', testSchema);

      const items = [
        { type: 'batch_type', data: { name: 'Item 1' } },
        { type: 'batch_type', data: { name: 'Item 2' } },
        { type: 'batch_type', data: { name: '' } }, // Valid but empty
      ];

      // Act
      const results = await DataValidationService.validateBatch(items);

      // Assert
      expect(results.length).toBe(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(true);
    });

    it('should return validation errors for invalid items', async () => {
      // Arrange
      const testSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(18, 'Must be 18 or older'),
      });
      DataValidationService.registerTypeSchema('batch_type', testSchema);

      const items = [
        { type: 'batch_type', data: { name: 'Item 1', age: 20 } }, // Valid
        { type: 'batch_type', data: { name: '', age: 15 } }, // Invalid
      ];

      // Act
      const results = await DataValidationService.validateBatch(items);

      // Assert
      expect(results.length).toBe(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].errors).toContain('name: Name is required');
      expect(results[1].errors).toContain('age: Must be 18 or older');
    });
  });
});
