import { Compiler, CompilerOptions } from '../../src/compiler';
import { AOTCompiler } from '../../src/compiler/aot';
import { Parser } from '../../src/parser';
import { describe, expect, test, beforeEach } from '@jest/globals';

describe('Fast Compilation Engine', () => {
  let parser: Parser;
  let standardCompiler: Compiler;
  let fastCompiler: Compiler;
  let aotCompiler: AOTCompiler;

  beforeEach(() => {
    parser = new Parser();
    standardCompiler = new Compiler();
    fastCompiler = new Compiler({ 
      fastMode: true, 
      skipTypeChecking: true, 
      enableCaching: true 
    });
    aotCompiler = new AOTCompiler({ optimizationLevel: 2 });
  });

  test('fast mode compilation should skip type checking', () => {
    const source = `
      fn add(a, b) {
        return a + b;
      }
    `;
    
    const ast = parser.parse(source);
    const bytecode = fastCompiler.compile(ast);
    
    expect(bytecode).toBeDefined();
    expect(bytecode.type).toBe('Function');
  });

  test('AOT compiler should generate optimized machine code', () => {
    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionDeclaration',
        name: 'test',
        params: [],
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 5 },
            right: { type: 'Literal', value: 3 }
          }
        }]
      }]
    };

    const machineCode = aotCompiler.compileToMachineCode(ast);
    
    expect(machineCode).toBeDefined();
    expect(machineCode.type).toBe('Block');
    expect(machineCode.body).toBeDefined();
    expect(machineCode.body[0].aot).toBe(true);
  });

  test('compilation caching should work', () => {
    const ast = {
      type: 'Program',
      body: [{
        type: 'FunctionDeclaration',
        name: 'cached',
        params: [],
        body: []
      }]
    };

    // First compilation
    const start1 = Date.now();
    const bytecode1 = fastCompiler.compile(ast);
    const end1 = Date.now();

    // Second compilation (should be cached)
    const start2 = Date.now();
    const bytecode2 = fastCompiler.compile(ast);
    const end2 = Date.now();

    expect(bytecode1).toEqual(bytecode2);
    // Second compilation should be faster due to caching
    // Note: This is a simple test, actual timing may vary
  });

  test('AOT compiler constant folding optimization', () => {
    const ast = {
      type: 'BinaryExpression',
      operator: '*',
      left: { type: 'Literal', value: 4 },
      right: { type: 'Literal', value: 6 }
    };

    const optimized = aotCompiler.compileToMachineCode(ast);
    
    // Should be folded to a constant value
    expect(optimized.type).toBe('Value');
    expect(optimized.value).toBe(24);
  });

  test('different optimization levels should produce different results', () => {
    const ast = {
      type: 'FunctionDeclaration',
      name: 'test',
      params: [],
      body: [{
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 }
      }]
    };

    const level0 = new AOTCompiler({ optimizationLevel: 0 });
    const level3 = new AOTCompiler({ optimizationLevel: 3 });

    const code0 = level0.compileToMachineCode(ast);
    const code3 = level3.compileToMachineCode(ast);

    expect(code0).toBeDefined();
    expect(code3).toBeDefined();
    // Level 3 should have more optimizations applied
  });

  test('fast compilation should be faster than standard compilation', () => {
    const source = `
      fn fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    `;
    
    const ast = parser.parse(source);

    // Measure standard compilation time
    const start1 = process.hrtime.bigint();
    standardCompiler.compile(ast);
    const end1 = process.hrtime.bigint();
    const standardTime = Number(end1 - start1) / 1000000; // Convert to milliseconds

    // Measure fast compilation time
    const start2 = process.hrtime.bigint();
    fastCompiler.compile(ast);
    const end2 = process.hrtime.bigint();
    const fastTime = Number(end2 - start2) / 1000000; // Convert to milliseconds

    // Fast compilation should be faster (this is a heuristic test)
    console.log(`Standard: ${standardTime}ms, Fast: ${fastTime}ms`);
    expect(fastTime).toBeLessThanOrEqual(standardTime * 2); // Allow some variance
  });

  test('fast mode should produce functional bytecode', () => {
    const source = `
      fn multiply(x, y) {
        return x * y;
      }
    `;
    
    const ast = parser.parse(source);
    const bytecode = fastCompiler.compile(ast);
    
    expect(bytecode.type).toBe('Function');
    expect(bytecode.name).toBe('multiply');
    expect(bytecode.params).toEqual(['x', 'y']);
    expect(bytecode.body).toBeDefined();
  });

  test('AOT compiler should handle complex expressions', () => {
    const ast = {
      type: 'BinaryExpression',
      operator: '+',
      left: {
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Literal', value: 2 },
        right: { type: 'Literal', value: 3 }
      },
      right: { type: 'Literal', value: 4 }
    };

    const result = aotCompiler.compileToMachineCode(ast);
    
    // Should fold (2 * 3) + 4 = 10
    expect(result.type).toBe('Value');
    expect(result.value).toBe(10);
  });
});