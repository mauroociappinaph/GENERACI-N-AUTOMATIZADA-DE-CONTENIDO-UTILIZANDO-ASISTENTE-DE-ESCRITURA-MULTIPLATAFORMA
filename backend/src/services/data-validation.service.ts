import { z } from 'zod';
import { logError, logBusinessEvent } from '@/utils/logger';

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'number' | 'string' | 'boolean' | 'date' | 'custom';
  message?: string;
  validator?: (value: unknown) => boolean;
  min?: number;
  max?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  validatedData?: unknown;
}

export interface DynamicValidationConfig {
  type: string;
  schema: z.ZodSchema;
  rules?: ValidationRule[];
  customValidators?: Array<{
    name: string;
    validator: (data: unknown) => Promise<boolean> | boolean;
    message: string;
  }>;
}

/**
 * Servicio de validación dinámica de datos
 * Responsabilidad: Validar datos según su tipo y esquemas dinámicos
 */
export class DataValidationService {
  private static typeSchemas: Map<string, z.ZodSchema> = new Map();
  private static typeValidationRules: Map<string, ValidationRule[]> = new Map();
  private static dynamicConfigs: Map<string, DynamicValidationConfig> = new Map();

  /**
   * Registra un esquema de validación para un tipo específico
   */
  static registerTypeSchema(type: string, schema: z.ZodSchema): void {
    this.typeSchemas.set(type, schema);
    logBusinessEvent('SCHEMA_REGISTERED', { type }, 'system');
  }

  /**
   * Registra una configuración de validación dinámica completa
   */
  static registerDynamicValidation(config: DynamicValidationConfig): void {
    this.dynamicConfigs.set(config.type, config);
    this.typeSchemas.set(config.type, config.schema);
    if (config.rules) {
      this.typeValidationRules.set(config.type, config.rules);
    }
    logBusinessEvent('DYNAMIC_VALIDATION_REGISTERED', { type: config.type }, 'system');
  }

  /**
   * Valida datos según su tipo con validaciones dinámicas y personalizadas
   */
  static async validateDataByType(type: string, data: unknown): Promise<{
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  }> {
    try {
      // Si no hay esquema específico para el tipo, intentar crear un esquema dinámico
      if (!this.typeSchemas.has(type)) {
        // Intentar inferir un esquema basado en los datos
        if (typeof data === 'object' && data !== null) {
          const inferredSchema = this.inferSchemaFromData(data as Record<string, unknown>, type);
          if (inferredSchema) {
            this.registerTypeSchema(type, inferredSchema);
            logBusinessEvent('SCHEMA_INFERRED', { type }, 'system');
          } else {
            logError(new Error(`No schema found for type: ${type}`), 'DataValidationService.validateDataByType', { type });
            return this.basicValidation(data);
          }
        } else {
          return this.basicValidation(data);
        }
      }

      const schema = this.typeSchemas.get(type)!;
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        logBusinessEvent('VALIDATION_FAILED', { type, errors }, 'system');
        return {
          isValid: false,
          errors,
        };
      }

      // Ejecutar validaciones personalizadas si existen
      const config = this.dynamicConfigs.get(type);
      if (config?.customValidators) {
        const customErrors: string[] = [];

        for (const validator of config.customValidators) {
          try {
            const isValid = await validator.validator(result.data);
            if (!isValid) {
              customErrors.push(validator.message);
            }
          } catch (error) {
            logError(error as Error, `DataValidationService.customValidator.${validator.name}`, { type });
            customErrors.push(`Error en validación personalizada: ${validator.name}`);
          }
        }

        if (customErrors.length > 0) {
          logBusinessEvent('CUSTOM_VALIDATION_FAILED', { type, errors: customErrors }, 'system');
          return {
            isValid: false,
            errors: customErrors,
          };
        }
      }

      logBusinessEvent('VALIDATION_SUCCESS', { type }, 'system');
      return {
        isValid: true,
        validatedData: result.data,
      };
    } catch (error) {
      logError(error as Error, 'DataValidationService.validateDataByType', { type });
      return {
        isValid: false,
        errors: ['Error interno de validación'],
      };
    }
  }

  /**
   * Infiere un esquema Zod a partir de datos de ejemplo
   */
  private static inferSchemaFromData(data: Record<string, unknown>, type: string): z.ZodSchema | null {
    try {
      const schemaObject: Record<string, z.ZodTypeAny> = {};

      for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
          schemaObject[key] = z.any().nullable().optional();
          continue;
        }

        switch (typeof value) {
          case 'string':
            schemaObject[key] = z.string();
            break;
          case 'number':
            schemaObject[key] = z.number();
            break;
          case 'boolean':
            schemaObject[key] = z.boolean();
            break;
          case 'object':
            if (Array.isArray(value)) {
              schemaObject[key] = z.array(z.any());
            } else {
              schemaObject[key] = z.record(z.string(), z.unknown());
            }
            break;
          default:
            schemaObject[key] = z.any();
        }
      }

      return z.object(schemaObject);
    } catch (error) {
      logError(error as Error, 'DataValidationService.inferSchemaFromData', { type });
      return null;
    }
  }

  /**
   * Valida datos según su tipo (versión síncrona para compatibilidad)
   */
  static validateDataByTypeSync(type: string, data: unknown): {
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  } {
    try {
      if (!this.typeSchemas.has(type)) {
        return this.basicValidation(data);
      }

      const schema = this.typeSchemas.get(type)!;
      const result = schema.safeParse(data);

      if (result.success) {
        return {
          isValid: true,
          validatedData: result.data,
        };
      }

      return {
        isValid: false,
        errors: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    } catch (error) {
      logError(error as Error, 'DataValidationService.validateDataByTypeSync', { type });
      return {
        isValid: false,
        errors: ['Error interno de validación'],
      };
    }
  }

  /**
   * Validación básica para tipos sin esquema específico
   */
  private static basicValidation(data: unknown): {
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  } {
    // Validaciones básicas
    if (data === null || data === undefined) {
      return {
        isValid: false,
        errors: ['Los datos no pueden ser nulos o indefinidos'],
      };
    }

    if (typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Los datos deben ser un objeto'],
      };
    }

    if (Object.keys(data as Record<string, unknown>).length === 0) {
      return {
        isValid: false,
        errors: ['Los datos no pueden estar vacíos'],
      };
    }

    return {
      isValid: true,
      validatedData: data,
    };
  }

  /**
   * Obtiene los tipos de datos registrados
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.typeSchemas.keys());
  }

  /**
   * Valida metadatos
   */
  static validateMetadata(metadata: unknown): {
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  } {
    if (metadata === null || metadata === undefined) {
      return { isValid: true, validatedData: metadata };
    }

    if (typeof metadata !== 'object') {
      return {
        isValid: false,
        errors: ['Los metadatos deben ser un objeto'],
      };
    }

    return {
      isValid: true,
      validatedData: metadata,
    };
  }

  /**
   * Valida un conjunto de datos con múltiples tipos
   */
  static async validateBatch(items: Array<{ type: string; data: unknown }>): Promise<Array<{
    index: number;
    type: string;
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  }>> {
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const result = await this.validateDataByType(item.type, item.data);
      results.push({
        index: i,
        type: item.type,
        ...result,
      });
    }

    return results;
  }

  /**
   * Obtiene el esquema de un tipo específico
   */
  static getSchemaForType(type: string): z.ZodSchema | null {
    return this.typeSchemas.get(type) || null;
  }

  /**
   * Obtiene la configuración dinámica de un tipo
   */
  static getDynamicConfig(type: string): DynamicValidationConfig | null {
    return this.dynamicConfigs.get(type) || null;
  }

  /**
   * Elimina un esquema registrado
   */
  static unregisterType(type: string): boolean {
    const hadSchema = this.typeSchemas.delete(type);
    this.typeValidationRules.delete(type);
    this.dynamicConfigs.delete(type);

    if (hadSchema) {
      logBusinessEvent('SCHEMA_UNREGISTERED', { type }, 'system');
    }

    return hadSchema;
  }

  /**
   * Valida que los datos cumplan con reglas específicas
   */
  static validateWithRules(data: unknown, rules: ValidationRule[]): {
    isValid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    for (const rule of rules) {
      const fieldValue = (data as Record<string, unknown>)?.[rule.field];

      switch (rule.type) {
        case 'required':
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            errors.push(rule.message || `${rule.field} es requerido`);
          }
          break;

        case 'email':
          if (fieldValue && typeof fieldValue === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
              errors.push(rule.message || `${rule.field} debe ser un email válido`);
            }
          }
          break;

        case 'number':
          if (fieldValue !== undefined && fieldValue !== null) {
            const num = Number(fieldValue);
            if (isNaN(num)) {
              errors.push(rule.message || `${rule.field} debe ser un número`);
            } else {
              if (rule.min !== undefined && num < rule.min) {
                errors.push(rule.message || `${rule.field} debe ser mayor o igual a ${rule.min}`);
              }
              if (rule.max !== undefined && num > rule.max) {
                errors.push(rule.message || `${rule.field} debe ser menor o igual a ${rule.max}`);
              }
            }
          }
          break;

        case 'string':
          if (fieldValue !== undefined && fieldValue !== null) {
            if (typeof fieldValue !== 'string') {
              errors.push(rule.message || `${rule.field} debe ser una cadena de texto`);
            } else {
              if (rule.min !== undefined && fieldValue.length < rule.min) {
                errors.push(rule.message || `${rule.field} debe tener al menos ${rule.min} caracteres`);
              }
              if (rule.max !== undefined && fieldValue.length > rule.max) {
                errors.push(rule.message || `${rule.field} debe tener máximo ${rule.max} caracteres`);
              }
            }
          }
          break;

        case 'custom':
          if (rule.validator && !rule.validator(fieldValue)) {
            errors.push(rule.message || `${rule.field} no cumple con la validación personalizada`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// Registrar algunos esquemas de ejemplo
DataValidationService.registerTypeSchema('user_profile', z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  age: z.number().min(0, 'La edad debe ser positiva').optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
}));

DataValidationService.registerTypeSchema('product', z.object({
  name: z.string().min(1, 'El nombre del producto es requerido'),
  price: z.number().min(0, 'El precio debe ser positivo'),
  category: z.string().min(1, 'La categoría es requerida'),
  description: z.string().optional(),
  inStock: z.boolean().default(true),
}));

DataValidationService.registerTypeSchema('order', z.object({
  customerId: z.string().min(1, 'ID del cliente requerido'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, 'Debe tener al menos un item'),
  total: z.number().min(0, 'El total debe ser positivo'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
}));
