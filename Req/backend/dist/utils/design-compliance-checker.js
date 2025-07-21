"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignComplianceChecker = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const debug_logger_1 = require("./debug-logger");
const logger = (0, debug_logger_1.createComponentLogger)('DESIGN_COMPLIANCE');
/**
 * Verificador de cumplimiento del design document
 * Implementa las reglas arquitectónicas definidas en design.md
 */
class DesignComplianceChecker {
    constructor(config) {
        this.config = {
            rules: {
                maxLinesPerComponent: 300,
                maxLinesPerFunction: 50,
                maxComplexity: 8,
                maxParameters: 4,
                maxNestingDepth: 4,
                enforceBarrelExports: true,
                requireHelperModularization: true,
                enforceSRP: true,
                ...config?.rules
            },
            exceptions: {
                allowedFiles: [
                    'src/types/**/*.ts',
                    'src/config/**/*.ts',
                    '**/*.test.ts',
                    '**/*.spec.ts',
                    ...config?.exceptions?.allowedFiles || []
                ],
                temporaryExceptions: config?.exceptions?.temporaryExceptions || []
            },
            actions: {
                blockCommits: true,
                generateReport: true,
                suggestRefactoring: true,
                ...config?.actions
            }
        };
    }
    /**
     * Verificar cumplimiento de un archivo
     */
    async checkFile(filePath) {
        try {
            logger.info(`Checking compliance for: ${filePath}`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const report = {
                filePath,
                violations: [],
                suggestions: [],
                metrics: this.calculateMetrics(content),
                passed: true,
                timestamp: new Date()
            };
            // Verificar si el archivo está en excepciones
            if (this.isFileExcepted(filePath)) {
                report.exempted = true;
                return report;
            }
            // Ejecutar todas las verificaciones
            await this.checkLineCount(content, report);
            await this.checkFunctionComplexity(content, report);
            await this.checkParameterCount(content, report);
            await this.checkNestingDepth(content, report);
            await this.checkSRP(content, report);
            await this.checkHelperModularization(filePath, content, report);
            await this.checkBarrelExports(filePath, report);
            // Determinar si pasó todas las verificaciones
            report.passed = report.violations.filter(v => v.severity === 'error').length === 0;
            logger.info(`Compliance check completed for ${filePath}: ${report.passed ? 'PASSED' : 'FAILED'}`);
            return report;
        }
        catch (error) {
            logger.error('Error checking file compliance', error, { filePath });
            throw error;
        }
    }
    /**
     * Verificar múltiples archivos
     */
    async checkMultipleFiles(filePaths) {
        const reports = [];
        for (const filePath of filePaths) {
            try {
                const report = await this.checkFile(filePath);
                reports.push(report);
            }
            catch (error) {
                logger.error(`Failed to check file: ${filePath}`, error);
                reports.push({
                    filePath,
                    violations: [{
                            rule: 'file_check_error',
                            message: `Failed to check file: ${error.message}`,
                            severity: 'error',
                            line: 0
                        }],
                    suggestions: [],
                    metrics: { lines: 0, functions: 0, complexity: 0 },
                    passed: false,
                    timestamp: new Date()
                });
            }
        }
        return reports;
    }
    /**
     * Verificar conteo de líneas
     */
    async checkLineCount(content, report) {
        const lines = content.split('\n');
        const totalLines = lines.length;
        // Verificar límite total del archivo
        if (totalLines > this.config.rules.maxLinesPerComponent) {
            report.violations.push({
                rule: 'max_lines_per_file',
                message: `File has ${totalLines} lines, maximum allowed is ${this.config.rules.maxLinesPerComponent}`,
                severity: 'error',
                line: totalLines,
                suggestion: 'Consider breaking this file into smaller, more focused modules following SRP'
            });
        }
        // Verificar funciones individuales
        const functions = this.extractFunctions(content);
        for (const func of functions) {
            if (func.lineCount > this.config.rules.maxLinesPerFunction) {
                report.violations.push({
                    rule: 'max_lines_per_function',
                    message: `Function '${func.name}' has ${func.lineCount} lines, maximum allowed is ${this.config.rules.maxLinesPerFunction}`,
                    severity: 'error',
                    line: func.startLine,
                    suggestion: 'Break this function into smaller, single-purpose functions'
                });
            }
        }
    }
    /**
     * Verificar complejidad de funciones
     */
    async checkFunctionComplexity(content, report) {
        const functions = this.extractFunctions(content);
        for (const func of functions) {
            const complexity = this.calculateCyclomaticComplexity(func.content);
            if (complexity > this.config.rules.maxComplexity) {
                report.violations.push({
                    rule: 'max_complexity',
                    message: `Function '${func.name}' has complexity ${complexity}, maximum allowed is ${this.config.rules.maxComplexity}`,
                    severity: 'error',
                    line: func.startLine,
                    suggestion: 'Reduce complexity by extracting conditions into separate functions or using early returns'
                });
            }
        }
    }
    /**
     * Verificar conteo de parámetros
     */
    async checkParameterCount(content, report) {
        const functions = this.extractFunctions(content);
        for (const func of functions) {
            if (func.parameterCount > this.config.rules.maxParameters) {
                report.violations.push({
                    rule: 'max_parameters',
                    message: `Function '${func.name}' has ${func.parameterCount} parameters, maximum allowed is ${this.config.rules.maxParameters}`,
                    severity: 'warning',
                    line: func.startLine,
                    suggestion: 'Consider using an options object or breaking the function into smaller parts'
                });
            }
        }
    }
    /**
     * Verificar profundidad de anidamiento
     */
    async checkNestingDepth(content, report) {
        const functions = this.extractFunctions(content);
        for (const func of functions) {
            const maxDepth = this.calculateNestingDepth(func.content);
            if (maxDepth > this.config.rules.maxNestingDepth) {
                report.violations.push({
                    rule: 'max_nesting_depth',
                    message: `Function '${func.name}' has nesting depth ${maxDepth}, maximum allowed is ${this.config.rules.maxNestingDepth}`,
                    severity: 'warning',
                    line: func.startLine,
                    suggestion: 'Use early returns, extract nested logic into separate functions, or use guard clauses'
                });
            }
        }
    }
    /**
     * Verificar Single Responsibility Principle
     */
    async checkSRP(content, report) {
        if (!this.config.rules.enforceSRP)
            return;
        // Detectar múltiples responsabilidades por patrones en el código
        const responsibilities = this.detectResponsibilities(content);
        if (responsibilities.length > 1) {
            report.violations.push({
                rule: 'single_responsibility_principle',
                message: `File appears to have multiple responsibilities: ${responsibilities.join(', ')}`,
                severity: 'warning',
                line: 1,
                suggestion: 'Consider splitting this file into separate modules, each with a single responsibility'
            });
        }
    }
    /**
     * Verificar modularización de helpers
     */
    async checkHelperModularization(filePath, content, report) {
        if (!this.config.rules.requireHelperModularization)
            return;
        const utilityFunctions = this.detectUtilityFunctions(content);
        const isHelperFile = filePath.includes('/helpers/') || filePath.includes('/utils/');
        if (utilityFunctions.length > 0 && !isHelperFile) {
            report.suggestions.push({
                rule: 'helper_modularization',
                message: `Found ${utilityFunctions.length} utility functions that could be moved to helpers/`,
                severity: 'info',
                line: 1,
                suggestion: `Consider moving utility functions (${utilityFunctions.join(', ')}) to appropriate helper modules`
            });
        }
    }
    /**
     * Verificar barrel exports
     */
    async checkBarrelExports(filePath, report) {
        if (!this.config.rules.enforceBarrelExports)
            return;
        const dirPath = path.dirname(filePath);
        const indexPath = path.join(dirPath, 'index.ts');
        // Verificar si existe index.ts en directorios con múltiples archivos
        if (this.shouldHaveBarrelExport(dirPath) && !fs.existsSync(indexPath)) {
            report.suggestions.push({
                rule: 'barrel_exports',
                message: 'Directory with multiple files should have an index.ts barrel export',
                severity: 'info',
                line: 1,
                suggestion: `Create ${indexPath} to export public interfaces from this module`
            });
        }
    }
    /**
     * Extraer funciones del código
     */
    extractFunctions(content) {
        const functions = [];
        const lines = content.split('\n');
        // Regex para detectar funciones (simplificado)
        const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*:\s*[^=]*=>)|(\w+)\s*\([^)]*\)\s*:\s*[^{]*{|async\s+(\w+)\s*\([^)]*\))/g;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3] || match[4] || 'anonymous';
            const startIndex = match.index;
            const startLine = content.substring(0, startIndex).split('\n').length;
            // Encontrar el final de la función (simplificado)
            const functionContent = this.extractFunctionBody(content, startIndex);
            const lineCount = functionContent.split('\n').length;
            const parameterCount = this.countParameters(match[0]);
            functions.push({
                name: functionName,
                startLine,
                lineCount,
                parameterCount,
                content: functionContent
            });
        }
        return functions;
    }
    /**
     * Extraer el cuerpo de una función
     */
    extractFunctionBody(content, startIndex) {
        let braceCount = 0;
        let inFunction = false;
        let functionBody = '';
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                braceCount++;
                inFunction = true;
            }
            else if (char === '}') {
                braceCount--;
            }
            if (inFunction) {
                functionBody += char;
            }
            if (inFunction && braceCount === 0) {
                break;
            }
        }
        return functionBody;
    }
    /**
     * Contar parámetros de una función
     */
    countParameters(functionSignature) {
        const paramMatch = functionSignature.match(/\(([^)]*)\)/);
        if (!paramMatch || !paramMatch[1].trim())
            return 0;
        const params = paramMatch[1].split(',').filter(p => p.trim().length > 0);
        return params.length;
    }
    /**
     * Calcular complejidad ciclomática
     */
    calculateCyclomaticComplexity(code) {
        let complexity = 1; // Base complexity
        // Contar estructuras de control que aumentan la complejidad
        const patterns = [
            /\bif\b/g,
            /\belse\s+if\b/g,
            /\bwhile\b/g,
            /\bfor\b/g,
            /\bswitch\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\b\?\s*:/g, // Operador ternario
            /\b&&\b/g,
            /\b\|\|\b/g
        ];
        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });
        return complexity;
    }
    /**
     * Calcular profundidad de anidamiento
     */
    calculateNestingDepth(code) {
        let maxDepth = 0;
        let currentDepth = 0;
        for (const char of code) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            else if (char === '}') {
                currentDepth--;
            }
        }
        return maxDepth;
    }
    /**
     * Detectar responsabilidades múltiples
     */
    detectResponsibilities(content) {
        const responsibilities = [];
        // Patrones que indican diferentes responsabilidades
        const patterns = [
            { pattern: /database|query|sql|prisma/i, responsibility: 'Database' },
            { pattern: /http|request|response|api/i, responsibility: 'HTTP' },
            { pattern: /auth|login|token|jwt/i, responsibility: 'Authentication' },
            { pattern: /valid|sanitiz|check/i, responsibility: 'Validation' },
            { pattern: /log|debug|error/i, responsibility: 'Logging' },
            { pattern: /cache|redis|memory/i, responsibility: 'Caching' },
            { pattern: /email|notification|send/i, responsibility: 'Notification' },
            { pattern: /render|component|jsx|tsx/i, responsibility: 'UI Rendering' },
            { pattern: /state|useState|useEffect/i, responsibility: 'State Management' }
        ];
        patterns.forEach(({ pattern, responsibility }) => {
            if (pattern.test(content) && !responsibilities.includes(responsibility)) {
                responsibilities.push(responsibility);
            }
        });
        return responsibilities;
    }
    /**
     * Detectar funciones utilitarias
     */
    detectUtilityFunctions(content) {
        const utilities = [];
        // Patrones de funciones utilitarias
        const utilityPatterns = [
            /function\s+(format\w+|parse\w+|validate\w+|sanitize\w+|transform\w+)/g,
            /const\s+(format\w+|parse\w+|validate\w+|sanitize\w+|transform\w+)\s*=/g
        ];
        utilityPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                utilities.push(match[1]);
            }
        });
        return utilities;
    }
    /**
     * Verificar si un directorio debería tener barrel export
     */
    shouldHaveBarrelExport(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
            const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
            return tsFiles.length > 2; // Más de 2 archivos TypeScript
        }
        catch {
            return false;
        }
    }
    /**
     * Verificar si un archivo está en excepciones
     */
    isFileExcepted(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return this.config.exceptions.allowedFiles.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(normalizedPath);
        }) || this.config.exceptions.temporaryExceptions.includes(normalizedPath);
    }
    /**
     * Calcular métricas del archivo
     */
    calculateMetrics(content) {
        const lines = content.split('\n').length;
        const functions = this.extractFunctions(content);
        const avgComplexity = functions.length > 0
            ? functions.reduce((sum, f) => sum + this.calculateCyclomaticComplexity(f.content), 0) / functions.length
            : 0;
        return {
            lines,
            functions: functions.length,
            complexity: Math.round(avgComplexity),
            avgFunctionLength: functions.length > 0
                ? Math.round(functions.reduce((sum, f) => sum + f.lineCount, 0) / functions.length)
                : 0
        };
    }
    /**
     * Generar reporte de cumplimiento
     */
    generateComplianceReport(reports) {
        const totalFiles = reports.length;
        const passedFiles = reports.filter(r => r.passed).length;
        const failedFiles = totalFiles - passedFiles;
        let report = `# Design Compliance Report\n\n`;
        report += `**Generated:** ${new Date().toISOString()}\n`;
        report += `**Total Files:** ${totalFiles}\n`;
        report += `**Passed:** ${passedFiles}\n`;
        report += `**Failed:** ${failedFiles}\n`;
        report += `**Success Rate:** ${((passedFiles / totalFiles) * 100).toFixed(1)}%\n\n`;
        // Resumen de violaciones
        const allViolations = reports.flatMap(r => r.violations);
        const violationsByRule = allViolations.reduce((acc, v) => {
            acc[v.rule] = (acc[v.rule] || 0) + 1;
            return acc;
        }, {});
        report += `## Violations Summary\n\n`;
        Object.entries(violationsByRule)
            .sort(([, a], [, b]) => b - a)
            .forEach(([rule, count]) => {
            report += `- **${rule}**: ${count} violations\n`;
        });
        // Detalles por archivo
        report += `\n## File Details\n\n`;
        reports.forEach(fileReport => {
            if (!fileReport.passed) {
                report += `### ❌ ${fileReport.filePath}\n\n`;
                fileReport.violations.forEach(violation => {
                    report += `- **${violation.rule}** (Line ${violation.line}): ${violation.message}\n`;
                    if (violation.suggestion) {
                        report += `  - *Suggestion: ${violation.suggestion}*\n`;
                    }
                });
                report += `\n`;
            }
        });
        return report;
    }
}
exports.DesignComplianceChecker = DesignComplianceChecker;
exports.default = DesignComplianceChecker;
