"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("../src/compiler");
const parser_1 = require("../src/parser");
const errors_1 = require("../src/errors");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Compiler', () => {
    const parser = new parser_1.Parser();
    const compiler = new compiler_1.Compiler();
    (0, globals_1.test)('compiles simple function', () => {
        const source = `
      fn main() {
        return 42;
      }
    `;
        const ast = parser.parse(source);
        const bytecode = compiler.compile(ast);
        (0, globals_1.expect)(bytecode).toBeDefined();
        (0, globals_1.expect)(bytecode.type).toBe('Function');
    });
    (0, globals_1.test)('compiles generic class', () => {
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
        (0, globals_1.expect)(bytecode.type).toBe('Class');
        (0, globals_1.expect)(bytecode.generics).toBeDefined();
    });
    (0, globals_1.test)('compiles pattern matching', () => {
        const source = `
      match value {
        0 => "zero",
        _ => "other"
      }
    `;
        const ast = parser.parse(source);
        const bytecode = compiler.compile(ast);
        (0, globals_1.expect)(bytecode.type).toBe('Match');
    });
    (0, globals_1.test)('compiles operator overloading', () => {
        const source = `
      class Complex {
        operator +(other: Complex): Complex {
          return new Complex(this.real + other.real);
        }
      }
    `;
        const ast = parser.parse(source);
        const bytecode = compiler.compile(ast);
        (0, globals_1.expect)(bytecode.type).toBe('Class');
        (0, globals_1.expect)(bytecode.operators).toBeDefined();
    });
    (0, globals_1.test)('handles type checking errors', () => {
        const source = `
      fn add(a: number, b: string) {
        return a + b;
      }
    `;
        const ast = parser.parse(source);
        (0, globals_1.expect)(() => compiler.compile(ast)).toThrow(errors_1.OmniscriptError);
    });
    (0, globals_1.test)('handles memory management', () => {
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
        (0, globals_1.expect)(bytecode.type).toBe('Class');
        (0, globals_1.expect)(bytecode.hasDestructor).toBe(true);
    });
    (0, globals_1.test)('validates generic constraints', () => {
        const source = `
      class NumericBox<T extends number> {
        value: T;
      }
    `;
        const ast = parser.parse(source);
        const bytecode = compiler.compile(ast);
        (0, globals_1.expect)(bytecode.type).toBe('Class');
        (0, globals_1.expect)(bytecode.generics[0].constraint).toBe('number');
    });
    (0, globals_1.test)('compiles standard library imports', () => {
        const source = `
      import { List, Map } from 'stdlib/collections';
      
      fn main() {
        let list = new List<number>();
        list.push(42);
      }
    `;
        const ast = parser.parse(source);
        const bytecode = compiler.compile(ast);
        (0, globals_1.expect)(bytecode.type).toBe('Function');
        (0, globals_1.expect)(bytecode.imports).toContain('stdlib/collections');
    });
});
