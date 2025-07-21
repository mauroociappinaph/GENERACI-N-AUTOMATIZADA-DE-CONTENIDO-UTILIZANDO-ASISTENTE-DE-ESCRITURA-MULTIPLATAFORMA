export interface ESLintError {
  ruleId: string | null;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType?: string;
  messageId?: string;
  endLine?: number;
  endColumn?: number;
  fix?: {
    range: [number, number];
    text: string;
  };
}

export interface ESLintResult {
  filePath: string;
  messages: ESLintError[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  output?: string;
}

export interface ESLintReport {
  results: ESLintResult[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

export interface FileValidationResult {
  isValid: boolean;
  exists: boolean;
  isReadable: boolean;
  isWritable: boolean;
  backupPath?: string;
  error?: string;
}

export interface ESLintExecutionOptions {
  fix?: boolean;
  cache?: boolean;
  cacheLocation?: string;
  configFile?: string;
  format?: string;
  outputFile?: string;
  quiet?: boolean;
  maxWarnings?: number;
}

export interface ESLintExecutionResult {
  success: boolean;
  report: ESLintReport;
  output: string;
  error?: string;
  fixedFiles: string[];
}
