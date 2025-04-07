import { TypeChecker } from '../../src/type-checker';
import { Parser } from '../../src/parser';
import { OmniscriptError } from '../../src/errors';
import { describe, expect, test } from '@jest/globals';

describe('TypeChecker', () => {
  const parser = new Parser();
  const typeChecker = new TypeChecker();

  test('validates function parameter types', () => {
    const source = `
      fn process(value: string): number {
        return parseInt(value);
      }
    `;
    const ast = parser.parse(source);
    const result = typeChecker.check(ast);
    expect(result.errors.length).toBe(0);
  });

  test('detects invalid type assignments', () => {
    const source = `
      let x: number = "string";
    `;
    const ast = parser.parse(source);
    expect(() => typeChecker.check(ast)).toThrow(OmniscriptError);
  });
});
