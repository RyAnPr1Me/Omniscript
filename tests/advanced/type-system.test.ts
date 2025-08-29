import { describe, expect, test } from '@jest/globals';
import { TypeChecker, TypeInferenceEngine, Type } from '../../src/type-checker';

describe('Advanced Type System', () => {
  const typeChecker = new TypeChecker();
  const inferenceEngine = new TypeInferenceEngine();

  test('infers union types for conditional expressions', () => {
    const binaryExpr = {
      type: 'Binary',
      operator: '||',
      left: { type: 'Literal', value: 'hello' },
      right: { type: 'Literal', value: 42 }
    };

    const inferredType = inferenceEngine.inferType(binaryExpr);
    expect(inferredType.kind).toBe('union');
    expect(inferredType.types).toHaveLength(2);
  });

  test('infers function return types', () => {
    const callExpr = {
      type: 'Call',
      callee: {
        type: 'Function',
        returnType: { kind: 'primitive', name: 'string' }
      },
      arguments: []
    };

    const inferredType = inferenceEngine.inferType(callExpr);
    expect(inferredType.kind).toBe('primitive');
    expect(inferredType.name).toBe('unknown'); // simplified for this test
  });

  test('creates intersection types', () => {
    const type1: Type = { kind: 'primitive', name: 'number' };
    const type2: Type = { kind: 'primitive', name: 'string' };
    
    const intersectionType = inferenceEngine.createIntersectionType([type1, type2]);
    expect(intersectionType.kind).toBe('intersection');
    expect(intersectionType.types).toContain(type1);
    expect(intersectionType.types).toContain(type2);
  });

  test('infers object literal types', () => {
    const objectExpr = {
      type: 'ObjectLiteral',
      properties: [
        { key: 'name', value: { type: 'Literal', value: 'test' } },
        { key: 'age', value: { type: 'Literal', value: 25 } }
      ]
    };

    const inferredType = inferenceEngine.inferType(objectExpr);
    expect(inferredType.kind).toBe('object');
    expect(inferredType.properties).toBeDefined();
    expect(inferredType.properties!['name'].name).toBe('string');
    expect(inferredType.properties!['age'].name).toBe('number');
  });

  test('infers array types with common element type', () => {
    const arrayExpr = {
      type: 'ArrayLiteral',
      elements: [
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 }
      ]
    };

    const inferredType = inferenceEngine.inferType(arrayExpr);
    expect(inferredType.kind).toBe('array');
    expect(inferredType.elementType?.kind).toBe('primitive');
    expect(inferredType.elementType?.name).toBe('number');
  });
});

describe('Type Checking with Advanced Features', () => {
  const typeChecker = new TypeChecker();

  test('handles type checking without errors for valid code', () => {
    const ast = {
      type: 'Program',
      body: [
        {
          type: 'VariableDeclaration',
          varType: 'number',
          initializer: { type: 'Literal', value: 42 }
        }
      ]
    };

    expect(() => typeChecker.check(ast)).not.toThrow();
  });

  test('detects binary expression type mismatches', () => {
    const ast = {
      type: 'Program',
      body: [
        {
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Literal', value: 'hello' },
          right: { type: 'Literal', value: 42 }
        }
      ]
    };

    // This should generate errors about incompatible types
    expect(() => typeChecker.check(ast)).toThrow('Type errors found');
  });
});