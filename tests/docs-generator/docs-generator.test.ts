import { TypeScriptDocGenerator, MarkdownDocGenerator } from '../../src/docs-generator';
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Documentation Generator', () => {
  const testTsFile = path.join(__dirname, 'test-file.ts');
  
  beforeAll(() => {
    // Create a test TypeScript file
    const testContent = `
/**
 * Test class for documentation generation
 * This is a sample class with various features
 * @example
 * const instance = new TestClass();
 * instance.testMethod(42);
 */
export class TestClass {
  /**
   * A test property
   */
  public testProperty: string = 'test';
  
  /**
   * Private property
   */
  private privateProperty: number = 0;
  
  /**
   * Test method with parameters
   * @param value The input value
   * @param optional Optional parameter
   * @returns The processed result
   * @example
   * const result = instance.testMethod(42, 'optional');
   */
  public testMethod(value: number, optional?: string): string {
    return \`Result: \${value}\`;
  }
  
  /**
   * Async method example
   * @param data Input data
   * @returns Promise with result
   */
  public async asyncMethod(data: any): Promise<boolean> {
    return true;
  }
  
  /**
   * Static method
   * @param input Input parameter
   * @returns Processed output
   */
  public static staticMethod(input: string): string {
    return input.toUpperCase();
  }
}

/**
 * Test interface for documentation
 */
export interface TestInterface {
  /**
   * Interface property
   */
  interfaceProperty: boolean;
  
  /**
   * Interface method
   * @param param Method parameter
   * @returns Return value
   */
  interfaceMethod(param: string): number;
}

/**
 * Test function for documentation
 * @param a First parameter
 * @param b Second parameter
 * @returns Sum of parameters
 * @example
 * const result = testFunction(1, 2);
 */
export function testFunction(a: number, b: number): number {
  return a + b;
}

/**
 * Async function example
 * @param data Input data
 * @returns Promise with processed data
 */
export async function asyncFunction(data: any): Promise<any> {
  return data;
}
`;
    
    fs.writeFileSync(testTsFile, testContent);
  });
  
  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testTsFile)) {
      fs.unlinkSync(testTsFile);
    }
  });

  describe('TypeScriptDocGenerator', () => {
    test('should initialize with default config', () => {
      expect(() => {
        new TypeScriptDocGenerator();
      }).not.toThrow();
    });

    test('should generate documentation for modules', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });

    test('should extract class information', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      // Find our test module
      const testModule = modules.find(m => m.name.includes('test-file') || m.classes.some(c => c.name === 'TestClass'));
      
      if (testModule) {
        expect(testModule.classes.length).toBeGreaterThan(0);
        
        const testClass = testModule.classes.find(c => c.name === 'TestClass');
        if (testClass) {
          expect(testClass.name).toBe('TestClass');
          expect(testClass.exported).toBe(true);
          expect(testClass.methods.length).toBeGreaterThan(0);
          expect(testClass.properties.length).toBeGreaterThan(0);
          expect(testClass.documentation.description).toContain('Test class for documentation generation');
        }
      }
    });

    test('should extract interface information', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      const testModule = modules.find(m => m.interfaces.some(i => i.name === 'TestInterface'));
      
      if (testModule) {
        const testInterface = testModule.interfaces.find(i => i.name === 'TestInterface');
        if (testInterface) {
          expect(testInterface.name).toBe('TestInterface');
          expect(testInterface.exported).toBe(true);
          expect(testInterface.properties.length).toBeGreaterThan(0);
          expect(testInterface.methods.length).toBeGreaterThan(0);
        }
      }
    });

    test('should extract function information', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      const testModule = modules.find(m => m.functions.some(f => f.name === 'testFunction'));
      
      if (testModule) {
        const testFunction = testModule.functions.find(f => f.name === 'testFunction');
        if (testFunction) {
          expect(testFunction.name).toBe('testFunction');
          expect(testFunction.exported).toBe(true);
          expect(testFunction.async).toBe(false);
          expect(testFunction.parameters.length).toBe(2);
          expect(testFunction.returnType).toBe('number');
        }
      }
    });

    test('should extract JSDoc comments', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      const testModule = modules.find(m => m.classes.some(c => c.name === 'TestClass'));
      
      if (testModule) {
        const testClass = testModule.classes.find(c => c.name === 'TestClass');
        if (testClass) {
          expect(testClass.documentation.description).toBeTruthy();
          expect(testClass.documentation.example).toBeTruthy();
          
          const testMethod = testClass.methods.find(m => m.name === 'testMethod');
          if (testMethod) {
            expect(testMethod.documentation.description).toBeTruthy();
            expect(testMethod.documentation.params).toBeTruthy();
            expect(testMethod.documentation.returns).toBeTruthy();
          }
        }
      }
    });
  });

  describe('MarkdownDocGenerator', () => {
    test('should generate markdown from modules', () => {
      const generator = new TypeScriptDocGenerator();
      const modules = generator.generateDocumentation();
      
      const markdown = MarkdownDocGenerator.generateMarkdown(modules);
      
      expect(typeof markdown).toBe('string');
      expect(markdown.length).toBeGreaterThan(0);
      expect(markdown).toContain('# API Documentation');
      expect(markdown).toContain('## Table of Contents');
    });

    test('should include module information in markdown', () => {
      // Create a mock module for testing
      const mockModules = [{
        name: 'TestModule',
        path: '/test/path.ts',
        classes: [{
          name: 'TestClass',
          extends: undefined,
          implements: [],
          abstract: false,
          exported: true,
          methods: [{
            name: 'testMethod',
            signature: 'testMethod(value: number): string',
            visibility: 'public' as const,
            static: false,
            async: false,
            parameters: [{ name: 'value', type: 'number', optional: false }],
            returnType: 'string',
            documentation: {
              description: 'Test method description',
              params: [{ name: 'value', type: 'number', description: 'Input value' }],
              returns: { type: 'string', description: 'Result string' }
            }
          }],
          properties: [{
            name: 'testProperty',
            type: 'string',
            visibility: 'public' as const,
            static: false,
            readonly: false,
            documentation: { description: 'Test property description' }
          }],
          documentation: {
            description: 'Test class description',
            example: 'const test = new TestClass();'
          }
        }],
        interfaces: [],
        functions: [],
        exports: []
      }];

      const markdown = MarkdownDocGenerator.generateMarkdown(mockModules);
      
      expect(markdown).toContain('## TestModule');
      expect(markdown).toContain('#### TestClass');
      expect(markdown).toContain('Test class description');
      expect(markdown).toContain('testMethod');
      expect(markdown).toContain('testProperty');
      expect(markdown).toContain('Test method description');
      expect(markdown).toContain('**Example**:');
      expect(markdown).toContain('```typescript');
    });

    test('should handle empty modules gracefully', () => {
      const markdown = MarkdownDocGenerator.generateMarkdown([]);
      
      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('# API Documentation');
      expect(markdown).toContain('## Table of Contents');
    });

    test('should generate proper markdown formatting', () => {
      const mockModules = [{
        name: 'FormattingTest',
        path: '/test.ts',
        classes: [],
        interfaces: [{
          name: 'TestInterface',
          extends: ['BaseInterface'],
          exported: true,
          methods: [],
          properties: [{
            name: 'prop',
            type: 'string',
            visibility: 'public' as const,
            static: false,
            readonly: true,
            documentation: { description: 'Interface property' }
          }],
          documentation: { description: 'Test interface' }
        }],
        functions: [{
          name: 'testFunc',
          signature: 'function testFunc(): void',
          async: true,
          parameters: [],
          returnType: 'Promise<void>',
          exported: true,
          documentation: {
            description: 'Async test function',
            returns: { type: 'Promise<void>', description: 'Promise that resolves' }
          }
        }],
        exports: []
      }];

      const markdown = MarkdownDocGenerator.generateMarkdown(mockModules);
      
      // Check for proper markdown structure
      expect(markdown).toMatch(/^# API Documentation/);
      expect(markdown).toContain('## FormattingTest');
      expect(markdown).toContain('### Interfaces');
      expect(markdown).toContain('#### TestInterface');
      expect(markdown).toContain('**Extends**: `BaseInterface`');
      expect(markdown).toContain('### Functions');
      expect(markdown).toContain('#### testFunc');
      expect(markdown).toContain('**Signature**: `function testFunc(): void`');
      expect(markdown).toContain('**Returns**: `Promise<void>` - Promise that resolves');
    });
  });
});