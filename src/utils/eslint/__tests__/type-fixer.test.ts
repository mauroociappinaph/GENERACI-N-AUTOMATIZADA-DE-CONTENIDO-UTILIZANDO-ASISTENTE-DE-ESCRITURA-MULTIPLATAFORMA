import * as fs from 'fs';
import * as path from 'path';
import { fixReturnTypes, replaceAnyTypes, generateTodoComments, TypeFixResult, TodoComment } from '../type-fixer';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('TypeScript Type Fixer', () => {
  const testFilePath = '/test/file.ts';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fixReturnTypes', () => {
    it('should add return type to function without explicit return type', () => {
      const sourceCode = `
function greet(name: string) {
  return "Hello, " + name;
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('return-type');
      expect(result.changes[0].description).toContain('string');
    });

    it('should add void return type to function with no return statement', () => {
      const sourceCode = `
function logMessage(message: string) {
  console.log(message);
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].description).toContain('void');
    });

    it('should handle arrow functions', () => {
      const sourceCode = `
const add = (a: number, b: number) => {
  return a + b;
};
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].description).toContain('number');
    });

    it('should handle arrow functions with expression body', () => {
      const sourceCode = `
const multiply = (a: number, b: number) => a * b;
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].description).toContain('number');
    });

    it('should generate TODO comments for complex return types', () => {
      const sourceCode = `
function complexFunction(data: any) {
  if (Math.random() > 0.5) {
    return { success: true, data };
  }
  return null;
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath, { generateTodos: true });

      expect(result.success).toBe(true);
      expect(result.todos.length).toBeGreaterThan(0);
      expect(result.todos[0].message).toContain('TODO: Add explicit return type');
    });

    it('should skip functions that already have return types', () => {
      const sourceCode = `
function greet(name: string): string {
  return "Hello, " + name;
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(0);
    });

    it('should handle file read errors', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
      expect(result.changes).toHaveLength(0);
    });

    it('should handle multiple return statements with same type', () => {
      const sourceCode = `
function getStatus(condition: boolean) {
  if (condition) {
    return "success";
  }
  return "failure";
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].description).toContain('string');
    });

    it('should handle multiple return statements with different types', () => {
      const sourceCode = `
function getValue(flag: boolean) {
  if (flag) {
    return 42;
  }
  return "default";
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = fixReturnTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].description).toContain('number | string');
    });
  });

  describe('replaceAnyTypes', () => {
    it('should replace any type with inferred specific type', () => {
      const sourceCode = `
let message: any = "Hello World";
let count: any = 42;
let isActive: any = true;
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      const stringChange = result.changes.find(c => c.fixed === 'string');
      const numberChange = result.changes.find(c => c.fixed === 'number');
      const booleanChange = result.changes.find(c => c.fixed === 'boolean');

      expect(stringChange).toBeDefined();
      expect(numberChange).toBeDefined();
      expect(booleanChange).toBeDefined();
    });

    it('should add type annotations to variables without explicit types', () => {
      const sourceCode = `
let name = "John Doe";
let age = 30;
let isStudent = false;
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      result.changes.forEach(change => {
        expect(change.type).toBe('type-annotation');
        expect(['string', 'number', 'boolean']).toContain(change.fixed.split(': ')[1]);
      });
    });

    it('should generate TODO comments for complex any types', () => {
      const sourceCode = `
function processData(data: any): any {
  return data.someComplexOperation();
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath, { generateTodos: true });

      expect(result.success).toBe(true);
      expect(result.todos.length).toBeGreaterThan(0);
      expect(result.todos[0].message).toContain('TODO: Replace any type');
    });

    it('should handle array types', () => {
      const sourceCode = `
let items = ["apple", "banana", "cherry"];
let numbers = [1, 2, 3, 4, 5];
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      const arrayChange = result.changes.find(c => c.fixed.includes('any[]'));
      expect(arrayChange).toBeDefined();
    });

    it('should handle object types', () => {
      const sourceCode = `
let user = { name: "John", age: 30 };
let config = { debug: true, port: 3000 };
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      const objectChange = result.changes.find(c => c.fixed.includes('object'));
      expect(objectChange).toBeDefined();
    });

    it('should handle null and undefined values', () => {
      const sourceCode = `
let nullValue = null;
let undefinedValue = undefined;
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      const nullChange = result.changes.find(c => c.fixed.includes('null'));
      const undefinedChange = result.changes.find(c => c.fixed.includes('undefined'));

      expect(nullChange).toBeDefined();
      expect(undefinedChange).toBeDefined();
    });

    it('should handle file processing errors', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = replaceAnyTypes(testFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
      expect(result.changes).toHaveLength(0);
    });
  });

  describe('generateTodoComments', () => {
    it('should generate TODO comments for provided issues', () => {
      const sourceCode = `
function example() {
  // Some code here
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);

      const issues = [
        'Fix return type for function example',
        'Replace any type in parameter',
        'Add type annotation for variable'
      ];

      const todos = generateTodoComments(testFilePath, issues);

      expect(todos).toHaveLength(3);
      todos.forEach((todo, index) => {
        expect(todo.message).toBe(`TODO: ${issues[index]}`);
        expect(todo.context).toContain('file.ts');
      });
    });

    it('should handle empty issues array', () => {
      const sourceCode = `
function example() {
  return "test";
}
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);

      const todos = generateTodoComments(testFilePath, []);

      expect(todos).toHaveLength(0);
    });

    it('should handle file read errors gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not accessible');
      });

      const issues = ['Some issue'];
      const todos = generateTodoComments(testFilePath, issues);

      expect(todos).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle a complete TypeScript file with multiple issues', () => {
      const sourceCode = `
function processUser(userData: any) {
  const name = userData.name;
  const age = userData.age;

  if (age >= 18) {
    return { isAdult: true, name };
  }

  return { isAdult: false, name };
}

const helper = (input: any) => input.toString();

let globalConfig = { debug: true, version: "1.0.0" };
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);
      mockFs.writeFileSync.mockImplementation(() => {});

      // Test return type fixing
      const returnTypeResult = fixReturnTypes(testFilePath, { generateTodos: true });
      expect(returnTypeResult.success).toBe(true);
      expect(returnTypeResult.changes.length).toBeGreaterThan(0);

      // Test any type replacement
      const anyTypeResult = replaceAnyTypes(testFilePath, { generateTodos: true });
      expect(anyTypeResult.success).toBe(true);
      expect(anyTypeResult.changes.length).toBeGreaterThan(0);
    });

    it('should preserve existing type annotations', () => {
      const sourceCode = `
function typedFunction(param: string): string {
  return param.toUpperCase();
}

const typedArrow = (x: number): number => x * 2;

let typedVariable: boolean = true;
      `.trim();

      mockFs.readFileSync.mockReturnValue(sourceCode);

      const returnTypeResult = fixReturnTypes(testFilePath);
      const anyTypeResult = replaceAnyTypes(testFilePath);

      expect(returnTypeResult.success).toBe(true);
      expect(returnTypeResult.changes).toHaveLength(0);

      expect(anyTypeResult.success).toBe(true);
      expect(anyTypeResult.changes).toHaveLength(0);
    });
  });
});
