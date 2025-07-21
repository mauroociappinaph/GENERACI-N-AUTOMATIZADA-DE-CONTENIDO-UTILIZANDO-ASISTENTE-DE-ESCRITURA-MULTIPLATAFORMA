"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidationService = void 0;
const zod_1 = require("zod");
const logger_1 = require("@/utils/logger");
/**
 * Servicio de validación dinámica de datos
 * Responsabilidad: Validar datos según su tipo y esquemas dinámicos
 */
class DataValidationService {
    /**
     * Registra un esquema de validación para un tipo específico
     */
    static registerTypeSchema(type, schema) {
        this.typeSchemas.set(type, schema);
        (0, logger_1.logBusinessEvent)('SCHEMA_REGISTERED', { type }, 'system');
    }
    /**
     * Registra una configuración de validación dinámica completa
     */
    static registerDynamicValidation(config) {
        this.dynamicConfigs.set(config.type, config);
        this.typeSchemas.set(config.type, config.schema);
        if (config.rules) {
            this.typeValidationRules.set(config.type, config.rules);
        }
        (0, logger_1.logBusinessEvent)('DYNAMIC_VALIDATION_REGISTERED', { type: config.type }, 'system');
    }
    /**
     * Valida datos según su tipo con validaciones dinámicas y personalizadas
     */
    static async validateDataByType(type, data) {
        try {
            // Si no hay esquema específico para el tipo, intentar crear un esquema dinámico
            if (!this.typeSchemas.has(type)) {
                // Intentar inferir un esquema basado en los datos
                if (typeof data === 'object' && data !== null) {
                    const inferredSchema = this.inferSchemaFromData(data, type);
                    if (inferredSchema) {
                        this.registerTypeSchema(type, inferredSchema);
                        (0, logger_1.logBusinessEvent)('SCHEMA_INFERRED', { type }, 'system');
                    }
                    else {
                        (0, logger_1.logError)(new Error(`No schema found for type: ${type}`), 'DataValidationService.validateDataByType', { type });
                        return this.basicValidation(data);
                    }
                }
                else {
                    return this.basicValidation(data);
                }
            }
            const schema = this.typeSchemas.get(type);
            const result = schema.safeParse(data);
            if (!result.success) {
                const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
                (0, logger_1.logBusinessEvent)('VALIDATION_FAILED', { type, errors }, 'system');
                return {
                    isValid: false,
                    errors,
                };
            }
            // Ejecutar validaciones personalizadas si existen
            const config = this.dynamicConfigs.get(type);
            if (config?.customValidators) {
                const customErrors = [];
                for (const validator of config.customValidators) {
                    try {
                        const isValid = await validator.validator(result.data);
                        if (!isValid) {
                            customErrors.push(validator.message);
                        }
                    }
                    catch (error) {
                        (0, logger_1.logError)(error, `DataValidationService.customValidator.${validator.name}`, { type });
                        customErrors.push(`Error en validación personalizada: ${validator.name}`);
                    }
                }
                if (customErrors.length > 0) {
                    (0, logger_1.logBusinessEvent)('CUSTOM_VALIDATION_FAILED', { type, errors: customErrors }, 'system');
                    return {
                        isValid: false,
                        errors: customErrors,
                    };
                }
            }
            (0, logger_1.logBusinessEvent)('VALIDATION_SUCCESS', { type }, 'system');
            return {
                isValid: true,
                validatedData: result.data,
            };
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataValidationService.validateDataByType', { type });
            return {
                isValid: false,
                errors: ['Error interno de validación'],
            };
        }
    }
    /**
     * Infiere un esquema Zod a partir de datos de ejemplo
     */
    static inferSchemaFromData(data, type) {
        try {
            const schemaObject = {};
            for (const [key, value] of Object.entries(data)) {
                if (value === null || value === undefined) {
                    schemaObject[key] = zod_1.z.any().nullable().optional();
                    continue;
                }
                switch (typeof value) {
                    case 'string':
                        schemaObject[key] = zod_1.z.string();
                        break;
                    case 'number':
                        schemaObject[key] = zod_1.z.number();
                        break;
                    case 'boolean':
                        schemaObject[key] = zod_1.z.boolean();
                        break;
                    case 'object':
                        if (Array.isArray(value)) {
                            schemaObject[key] = zod_1.z.array(zod_1.z.any());
                        }
                        else {
                            schemaObject[key] = zod_1.z.record(zod_1.z.string(), zod_1.z.unknown());
                        }
                        break;
                    default:
                        schemaObject[key] = zod_1.z.any();
                }
            }
            return zod_1.z.object(schemaObject);
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataValidationService.inferSchemaFromData', { type });
            return null;
        }
    }
    /**
     * Valida datos según su tipo (versión síncrona para compatibilidad)
     */
    static validateDataByTypeSync(type, data) {
        try {
            if (!this.typeSchemas.has(type)) {
                return this.basicValidation(data);
            }
            const schema = this.typeSchemas.get(type);
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
        }
        catch (error) {
            (0, logger_1.logError)(error, 'DataValidationService.validateDataByTypeSync', { type });
            return {
                isValid: false,
                errors: ['Error interno de validación'],
            };
        }
    }
    /**
     * Validación básica para tipos sin esquema específico
     */
    static basicValidation(data) {
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
        if (Object.keys(data).length === 0) {
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
    static getRegisteredTypes() {
        return Array.from(this.typeSchemas.keys());
    }
    /**
     * Valida metadatos
     */
    static validateMetadata(metadata) {
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
    static async validateBatch(items) {
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
    static getSchemaForType(type) {
        return this.typeSchemas.get(type) || null;
    }
    /**
     * Obtiene la configuración dinámica de un tipo
     */
    static getDynamicConfig(type) {
        return this.dynamicConfigs.get(type) || null;
    }
    /**
     * Elimina un esquema registrado
     */
    static unregisterType(type) {
        const hadSchema = this.typeSchemas.delete(type);
        this.typeValidationRules.delete(type);
        this.dynamicConfigs.delete(type);
        if (hadSchema) {
            (0, logger_1.logBusinessEvent)('SCHEMA_UNREGISTERED', { type }, 'system');
        }
        return hadSchema;
    }
    /**
     * Valida que los datos cumplan con reglas específicas
     */
    static validateWithRules(data, rules) {
        const errors = [];
        for (const rule of rules) {
            const fieldValue = data?.[rule.field];
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
                        }
                        else {
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
                        }
                        else {
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
exports.DataValidationService = DataValidationService;
DataValidationService.typeSchemas = new Map();
DataValidationService.typeValidationRules = new Map();
DataValidationService.dynamicConfigs = new Map();
// Registrar algunos esquemas de ejemplo
DataValidationService.registerTypeSchema('user_profile', zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre es requerido'),
    email: zod_1.z.string().email('Email inválido'),
    age: zod_1.z.number().min(0, 'La edad debe ser positiva').optional(),
    preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
}));
DataValidationService.registerTypeSchema('product', zod_1.z.object({
    name: zod_1.z.string().min(1, 'El nombre del producto es requerido'),
    price: zod_1.z.number().min(0, 'El precio debe ser positivo'),
    category: zod_1.z.string().min(1, 'La categoría es requerida'),
    description: zod_1.z.string().optional(),
    inStock: zod_1.z.boolean().default(true),
}));
DataValidationService.registerTypeSchema('order', zod_1.z.object({
    customerId: zod_1.z.string().min(1, 'ID del cliente requerido'),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        quantity: zod_1.z.number().min(1),
        price: zod_1.z.number().min(0),
    })).min(1, 'Debe tener al menos un item'),
    total: zod_1.z.number().min(0, 'El total debe ser positivo'),
    status: zod_1.z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
}));
