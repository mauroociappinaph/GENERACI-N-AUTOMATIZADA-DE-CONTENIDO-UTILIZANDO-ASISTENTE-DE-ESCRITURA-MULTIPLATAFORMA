import { z } from 'zod';
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
export declare class DataValidationService {
    private static typeSchemas;
    private static typeValidationRules;
    private static dynamicConfigs;
    /**
     * Registra un esquema de validación para un tipo específico
     */
    static registerTypeSchema(type: string, schema: z.ZodSchema): void;
    /**
     * Registra una configuración de validación dinámica completa
     */
    static registerDynamicValidation(config: DynamicValidationConfig): void;
    /**
     * Valida datos según su tipo con validaciones dinámicas y personalizadas
     */
    static validateDataByType(type: string, data: unknown): Promise<{
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    }>;
    /**
     * Infiere un esquema Zod a partir de datos de ejemplo
     */
    private static inferSchemaFromData;
    /**
     * Valida datos según su tipo (versión síncrona para compatibilidad)
     */
    static validateDataByTypeSync(type: string, data: unknown): {
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    };
    /**
     * Validación básica para tipos sin esquema específico
     */
    private static basicValidation;
    /**
     * Obtiene los tipos de datos registrados
     */
    static getRegisteredTypes(): string[];
    /**
     * Valida metadatos
     */
    static validateMetadata(metadata: unknown): {
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    };
    /**
     * Valida un conjunto de datos con múltiples tipos
     */
    static validateBatch(items: Array<{
        type: string;
        data: unknown;
    }>): Promise<Array<{
        index: number;
        type: string;
        isValid: boolean;
        errors?: string[];
        validatedData?: unknown;
    }>>;
    /**
     * Obtiene el esquema de un tipo específico
     */
    static getSchemaForType(type: string): z.ZodSchema | null;
    /**
     * Obtiene la configuración dinámica de un tipo
     */
    static getDynamicConfig(type: string): DynamicValidationConfig | null;
    /**
     * Elimina un esquema registrado
     */
    static unregisterType(type: string): boolean;
    /**
     * Valida que los datos cumplan con reglas específicas
     */
    static validateWithRules(data: unknown, rules: ValidationRule[]): {
        isValid: boolean;
        errors?: string[];
    };
}
