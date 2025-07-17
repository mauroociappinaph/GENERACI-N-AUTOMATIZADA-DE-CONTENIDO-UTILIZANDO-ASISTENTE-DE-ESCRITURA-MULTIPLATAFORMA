import { createDataRecordSchema, updateDataRecordSchema } from '../../src/types/data-record';
import { ZodError } from 'zod';

describe('DataRecord Validation Schemas', () => {
  describe('createDataRecordSchema', () => {
    it('should validate a correct data record creation input', () => {
      const validInput = {
        type: 'testType',
        data: { key: 'value' },
        metadata: { source: 'test' },
      };
      expect(() => createDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with only required fields', () => {
      const validInput = {
        type: 'anotherType',
        data: { id: 123 },
      };
      expect(() => createDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should throw error if type is missing', () => {
      const invalidInput = {
        data: { key: 'value' },
      };
      expect(() => createDataRecordSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should throw error if type is an empty string', () => {
      const invalidInput = {
        type: '',
        data: { key: 'value' },
      };
      expect(() => createDataRecordSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should throw error if data is missing', () => {
      const invalidInput = {
        type: 'testType',
      };
      expect(() => createDataRecordSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should validate if data is an empty object', () => {
      const validInput = {
        type: 'testType',
        data: {},
      };
      expect(() => createDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate if metadata is missing', () => {
      const validInput = {
        type: 'testType',
        data: { key: 'value' },
      };
      expect(() => createDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate if metadata is an empty object', () => {
      const validInput = {
        type: 'testType',
        data: { key: 'value' },
        metadata: {},
      };
      expect(() => createDataRecordSchema.parse(validInput)).not.toThrow();
    });
  });

  describe('updateDataRecordSchema', () => {
    it('should validate a correct data record update input', () => {
      const validInput = {
        type: 'updatedType',
        data: { newKey: 'newValue' },
        metadata: { updatedSource: 'test' },
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with only type', () => {
      const validInput = {
        type: 'onlyType',
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with only data', () => {
      const validInput = {
        data: { onlyData: true },
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with only metadata', () => {
      const validInput = {
        metadata: { onlyMetadata: true },
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate an empty object (no fields to update)', () => {
      const validInput = {};
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should throw error if type is an empty string when provided', () => {
      const invalidInput = {
        type: '',
      };
      expect(() => updateDataRecordSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should validate if data is an empty object when provided', () => {
      const validInput = {
        data: {},
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });

    it('should validate if metadata is an empty object when provided', () => {
      const validInput = {
        metadata: {},
      };
      expect(() => updateDataRecordSchema.parse(validInput)).not.toThrow();
    });
  });
});
