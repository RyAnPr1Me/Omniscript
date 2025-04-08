"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_checker_1 = require("../../src/type-checker");
const parser_1 = require("../../src/parser");
const errors_1 = require("../../src/errors");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('TypeChecker', () => {
    const parser = new parser_1.Parser();
    const typeChecker = new type_checker_1.TypeChecker();
    (0, globals_1.test)('validates function parameter types', () => {
        const source = `
      fn process(value: string): number {
        return parseInt(value);
      }
    `;
        const ast = parser.parse(source);
        const result = typeChecker.check(ast);
        (0, globals_1.expect)(result.errors.length).toBe(0);
    });
    (0, globals_1.test)('detects invalid type assignments', () => {
        const source = `
      let x: number = "string";
    `;
        const ast = parser.parse(source);
        (0, globals_1.expect)(() => typeChecker.check(ast)).toThrow(errors_1.OmniscriptError);
    });
});
