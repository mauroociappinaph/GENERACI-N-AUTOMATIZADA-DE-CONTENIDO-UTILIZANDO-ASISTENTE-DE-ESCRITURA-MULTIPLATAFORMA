import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface TypeFixResult {
  success: boolean;
  filePath: string;
  changes: TypeChange[];
  todos: TodoComment[];
  error?: string;
}

export interface TypeChange {
  type: 'return-type' | 'any-replacement' | 'type-annotation';
  line: number;
  column: number;
  original: string;
  fixed: string;
  description: string;
}

export interface TodoComment {
  line: number;
  column: number;
  message: string;
  context: string;
}

export interface TypeFixOptions {
  fixReturnTypes?: boolean;
  replaceAnyTypes?: boolean;
  generateTodos?: boolean;
  preserveComments?: boolean;
}

/**
 * Detects and fixes missing return types in TypeScript functions
 */
export function fixReturnTypes(filePath: string, options: TypeFixOptions = {}): TypeFixResult {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const changes: TypeChange[] = [];
    const todos: TodoComment[] = [];
    let modifiedSource = sourceCode;

    // Find functions without explicit return types
    function visitNode(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
        if (!node.type && node.body) {
          const returnType = inferReturnType(node, sourceFile);
          if (returnType) {
            const position = getInsertPosition(node, sourceFile);
            const change: TypeChange = {
              type: 'return-type',
              line: position.line,
              column: position.column,
              original: getNodeText(node, sourceFile),
              fixed: `${getNodeText(node, sourceFile)}: ${returnType}`,
              description: `Added return type: ${returnType}`
            };
            changes.push(change);
          } else {
            // Generate TODO comment for complex cases
            if (options.generateTodos) {
              const position = getNodePosition(node, sourceFile);
              todos.push({
                line: position.line,
                column: position.column,
                message: 'TODO: Add explicit return type',
                context: getNodeText(node, sourceFile).substring(0, 50) + '...'
              });
            }
          }
        }
      }
      ts.forEachChild(node, visitNode);
    }

    visitNode(sourceFile);

    // Apply changes to source code
    if (changes.length > 0) {
      modifiedSource = applyTypeChanges(sourceCode, changes);
      fs.writeFileSync(filePath, modifiedSource, 'utf8');
    }

    return {
      success: true,
      filePath,
      changes,
      todos
    };
  } catch (error) {
    return {
      success: false,
      filePath,
      changes: [],
      todos: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Identifies and replaces 'any' types with specific types where possible
 */
export function replaceAnyTypes(filePath: string, options: TypeFixOptions = {}): TypeFixResult {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const changes: TypeChange[] = [];
    const todos: TodoComment[] = [];
    let modifiedSource = sourceCode;

    function visitNode(node: ts.Node) {
      // Check for 'any' type annotations
      if (ts.isTypeReferenceNode(node) && node.typeName.getText() === 'any') {
        const inferredType = inferSpecificType(node, sourceFile);
        if (inferredType && inferredType !== 'any') {
          const position = getNodePosition(node, sourceFile);
          const change: TypeChange = {
            type: 'any-replacement',
            line: position.line,
            column: position.column,
            original: 'any',
            fixed: inferredType,
            description: `Replaced 'any' with '${inferredType}'`
          };
          changes.push(change);
        } else if (options.generateTodos) {
          const position = getNodePosition(node, sourceFile);
          todos.push({
            line: position.line,
            column: position.column,
            message: 'TODO: Replace any type with specific type',
            context: getContextAroundNode(node, sourceFile)
          });
        }
      }

      // Check for implicit any in variable declarations
      if (ts.isVariableDeclaration(node) && !node.type && node.initializer) {
        const inferredType = inferTypeFromInitializer(node.initializer, sourceFile);
        if (inferredType && inferredType !== 'any') {
          const position = getInsertPositionForVariable(node, sourceFile);
          const change: TypeChange = {
            type: 'type-annotation',
            line: position.line,
            column: position.column,
            original: node.name.getText(),
            fixed: `${node.name.getText()}: ${inferredType}`,
            description: `Added type annotation: ${inferredType}`
          };
          changes.push(change);
        }
      }

      ts.forEachChild(node, visitNode);
    }

    visitNode(sourceFile);

    // Apply changes to source code
    if (changes.length > 0) {
      modifiedSource = applyTypeChanges(sourceCode, changes);
      fs.writeFileSync(filePath, modifiedSource, 'utf8');
    }

    return {
      success: true,
      filePath,
      changes,
      todos
    };
  } catch (error) {
    return {
      success: false,
      filePath,
      changes: [],
      todos: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generates TODO comments for complex type fixes that require manual intervention
 */
export function generateTodoComments(filePath: string, issues: string[]): TodoComment[] {
  const todos: TodoComment[] = [];

  try {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const lines = sourceCode.split('\n');

    issues.forEach((issue, index) => {
      todos.push({
        line: 1,
        column: 1,
        message: `TODO: ${issue}`,
        context: `File: ${path.basename(filePath)}`
      });
    });
  } catch (error) {
    // Handle error silently, return empty array
  }

  return todos;
}

// Helper functions
function inferReturnType(node: ts.FunctionLikeDeclaration, sourceFile: ts.SourceFile): string | null {
  if (!node.body) return null;

  // Simple heuristics for common return types
  if (ts.isBlock(node.body)) {
    const returnStatements = findReturnStatements(node.body);
    if (returnStatements.length === 0) return 'void';

    // Analyze return statements to infer type
    const returnTypes = returnStatements.map(stmt => inferTypeFromExpression(stmt.expression));
    const uniqueTypes = [...new Set(returnTypes.filter(t => t !== null))];

    if (uniqueTypes.length === 1) return uniqueTypes[0];
    if (uniqueTypes.length > 1) return uniqueTypes.join(' | ');
  }

  // For arrow functions with expression body
  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
    return inferTypeFromExpression(node.body);
  }

  return null;
}

function findReturnStatements(block: ts.Block): ts.ReturnStatement[] {
  const returns: ts.ReturnStatement[] = [];

  function visit(node: ts.Node) {
    if (ts.isReturnStatement(node)) {
      returns.push(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(block);
  return returns;
}

function inferTypeFromExpression(expr: ts.Expression | undefined): string | null {
  if (!expr) return 'void';

  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return 'string';
  if (ts.isNumericLiteral(expr)) return 'number';
  if (expr.kind === ts.SyntaxKind.TrueKeyword || expr.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
  if (ts.isArrayLiteralExpression(expr)) return 'any[]';
  if (ts.isObjectLiteralExpression(expr)) return 'object';
  if (expr.kind === ts.SyntaxKind.NullKeyword) return 'null';
  if (expr.kind === ts.SyntaxKind.UndefinedKeyword) return 'undefined';

  return null;
}

function inferSpecificType(node: ts.Node, sourceFile: ts.SourceFile): string | null {
  // This is a simplified implementation
  // In a real scenario, you'd use TypeScript's type checker
  return null;
}

function inferTypeFromInitializer(initializer: ts.Expression, sourceFile: ts.SourceFile): string | null {
  return inferTypeFromExpression(initializer);
}

function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getFullText(sourceFile).trim();
}

function getNodePosition(node: ts.Node, sourceFile: ts.SourceFile): { line: number; column: number } {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return { line: position.line + 1, column: position.character + 1 };
}

function getInsertPosition(node: ts.FunctionLikeDeclaration, sourceFile: ts.SourceFile): { line: number; column: number } {
  // Find position after parameter list, before body
  const position = sourceFile.getLineAndCharacterOfPosition(
    node.body ? node.body.getStart() - 1 : node.getEnd()
  );
  return { line: position.line + 1, column: position.character + 1 };
}

function getInsertPositionForVariable(node: ts.VariableDeclaration, sourceFile: ts.SourceFile): { line: number; column: number } {
  const position = sourceFile.getLineAndCharacterOfPosition(node.name.getEnd());
  return { line: position.line + 1, column: position.character + 1 };
}

function getContextAroundNode(node: ts.Node, sourceFile: ts.SourceFile): string {
  const start = Math.max(0, node.getStart() - 20);
  const end = Math.min(sourceFile.getEnd(), node.getEnd() + 20);
  return sourceFile.getFullText().substring(start, end).trim();
}

function applyTypeChanges(sourceCode: string, changes: TypeChange[]): string {
  // Sort changes by position (reverse order to avoid offset issues)
  const sortedChanges = changes.sort((a, b) => b.line - a.line || b.column - a.column);

  let modifiedSource = sourceCode;
  const lines = sourceCode.split('\n');

  // Apply changes line by line
  sortedChanges.forEach(change => {
    if (change.line <= lines.length) {
      const lineIndex = change.line - 1;
      const line = lines[lineIndex];

      // Simple replacement logic - in production, you'd want more sophisticated parsing
      if (change.type === 'return-type') {
        // Add return type annotation
        lines[lineIndex] = line.replace(/(\))(\s*{)/, `$1: ${change.fixed.split(': ')[1]}$2`);
      } else if (change.type === 'any-replacement') {
        lines[lineIndex] = line.replace(/\bany\b/, change.fixed);
      } else if (change.type === 'type-annotation') {
        lines[lineIndex] = line.replace(change.original, change.fixed);
      }
    }
  });

  return lines.join('\n');
}
