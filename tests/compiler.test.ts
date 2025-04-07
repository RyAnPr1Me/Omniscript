import { Compiler } from '../src/compiler';
import { Parser } from '../src/parser';
import { OmniscriptError } from '../src/errors';
import { describe, expect, test } from '@jest/globals';

describe('Compiler', () => {
  const parser = new Parser();
  const compiler = new Compiler();

  test('compiles simple function', () => {
    const source = `
      fn main() {
        return 42;
      }
    `;
    
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    
    expect(bytecode).toBeDefined();
    expect(bytecode.type).toBe('Function');
  });

  test('compiles generic class', () => {
    const source = `
      class Box<T> {
        value: T;
        constructor(value: T) {
          this.value = value;
        }
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Class');
    expect(bytecode.generics).toBeDefined();
  });

  test('compiles pattern matching', () => {
    const source = `
      match value {
        0 => "zero",
        _ => "other"
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Match');
  });

  test('compiles operator overloading', () => {
    const source = `
      class Complex {
        operator +(other: Complex): Complex {
          return new Complex(this.real + other.real);
        }
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Class');
    expect(bytecode.operators).toBeDefined();
  });

  test('handles type checking errors', () => {
    const source = `
      fn add(a: number, b: string) {
        return a + b;
      }
    `;
    const ast = parser.parse(source);
    expect(() => compiler.compile(ast)).toThrow(OmniscriptError);
  });

  test('handles memory management', () => {
    const source = `
      class Resource {
        constructor() {
          this.allocate();
        }
        destroy() {
          this.free();
        }
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Class');
    expect(bytecode.hasDestructor).toBe(true);
  });

  test('validates generic constraints', () => {
    const source = `
      class NumericBox<T extends number> {
        value: T;
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Class');
    expect(bytecode.generics[0].constraint).toBe('number');
  });

  test('compiles standard library imports', () => {
    const source = `
      import { List, Map } from 'stdlib/collections';
      
      fn main() {
        let list = new List<number>();
        list.push(42);
      }
    `;
    const ast = parser.parse(source);
    const bytecode = compiler.compile(ast);
    expect(bytecode.type).toBe('Function');
    expect(bytecode.imports).toContain('stdlib/collections');
  });
});
