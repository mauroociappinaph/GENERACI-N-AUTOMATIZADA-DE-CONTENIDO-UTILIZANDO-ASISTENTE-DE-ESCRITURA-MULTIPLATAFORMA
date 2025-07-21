/**
 * Verificador de cumplimiento del design document
 * Implementa las reglas arquitectónicas definidas en design.md
 */
export declare class DesignComplianceChecker {
    private config;
    constructor(config?: Partial<DesignComplianceConfig>);
    /**
     * Verificar cumplimiento de un archivo
     */
    checkFile(filePath: string): Promise<ComplianceReport>;
    /**
     * Verificar múltiples archivos
     */
    checkMultipleFiles(filePaths: string[]): Promise<ComplianceReport[]>;
    /**
     * Verificar conteo de líneas
     */
    private checkLineCount;
    /**
     * Verificar complejidad de funciones
     */
    private checkFunctionComplexity;
    /**
     * Verificar conteo de parámetros
     */
    private checkParameterCount;
    /**
     * Verificar profundidad de anidamiento
     */
    private checkNestingDepth;
    /**
     * Verificar Single Responsibility Principle
     */
    private checkSRP;
    /**
     * Verificar modularización de helpers
     */
    private checkHelperModularization;
    /**
     * Verificar barrel exports
     */
    private checkBarrelExports;
    /**
     * Extraer funciones del código
     */
    private extractFunctions;
    /**
     * Extraer el cuerpo de una función
     */
    private extractFunctionBody;
    /**
     * Contar parámetros de una función
     */
    private countParameters;
    /**
     * Calcular complejidad ciclomática
     */
    private calculateCyclomaticComplexity;
    /**
     * Calcular profundidad de anidamiento
     */
    private calculateNestingDepth;
    /**
     * Detectar responsabilidades múltiples
     */
    private detectResponsibilities;
    /**
     * Detectar funciones utilitarias
     */
    private detectUtilityFunctions;
    /**
     * Verificar si un directorio debería tener barrel export
     */
    private shouldHaveBarrelExport;
    /**
     * Verificar si un archivo está en excepciones
     */
    private isFileExcepted;
    /**
     * Calcular métricas del archivo
     */
    private calculateMetrics;
    /**
     * Generar reporte de cumplimiento
     */
    generateComplianceReport(reports: ComplianceReport[]): string;
}
interface DesignComplianceConfig {
    rules: {
        maxLinesPerComponent: number;
        maxLinesPerFunction: number;
        maxComplexity: number;
        maxParameters: number;
        maxNestingDepth: number;
        enforceBarrelExports: boolean;
        requireHelperModularization: boolean;
        enforceSRP: boolean;
    };
    exceptions: {
        allowedFiles: string[];
        temporaryExceptions: string[];
    };
    actions: {
        blockCommits: boolean;
        generateReport: boolean;
        suggestRefactoring: boolean;
    };
}
interface ComplianceReport {
    filePath: string;
    violations: Violation[];
    suggestions: Violation[];
    metrics: FileMetrics;
    passed: boolean;
    exempted?: boolean;
    timestamp: Date;
}
interface Violation {
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    line: number;
    suggestion?: string;
}
interface FileMetrics {
    lines: number;
    functions: number;
    complexity: number;
    avgFunctionLength?: number;
}
export default DesignComplianceChecker;
