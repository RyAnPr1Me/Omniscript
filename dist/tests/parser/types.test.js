"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../src/parser/types");
describe('AST Types', () => {
    test('Expression interface should enforce allowed literal types', () => {
        const expr = {
            type: 'Expression',
            kind: types_1.ExpressionKind.Literal,
            value: "hello",
            line: 1,
            column: 0
        };
        expect(typeof expr.value).toBe('string');
        expr.value = 42;
        expect(typeof expr.value).toBe('number');
        expr.value = true;
        expect(typeof expr.value).toBe('boolean');
    });
    test('Enums for ExpressionKind and Operator should have expected values', () => {
        expect(types_1.ExpressionKind.Binary).toBe("Binary");
        expect(types_1.Operator.Plus).toBe("+");
    });
    test('ASTError interface behaves as expected', () => {
        const error = {
            message: 'Unexpected token',
            line: 10,
            column: 5,
            details: 'Token was not recognized'
        };
        expect(error.message).toBe('Unexpected token');
        expect(error.line).toBe(10);
        expect(error.column).toBe(5);
        expect(error.details).toBeDefined();
    });
    test('VariableDeclaration interface accepts proper fields', () => {
        const varDecl = {
            type: 'VariableDeclaration',
            name: 'x',
            varType: 'number',
            initializer: {
                type: 'Expression',
                kind: types_1.ExpressionKind.Literal,
                value: 100,
                line: 2,
                column: 3
            },
            line: 2,
            column: 1
        };
        expect(varDecl.name).toBe('x');
        expect(varDecl.initializer?.value).toBe(100);
    });
    test('Decorator interface accepts proper fields', () => {
        const decorator = {
            type: 'Decorator',
            name: 'log',
            arguments: [{
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Literal,
                    value: "argument",
                    line: 3,
                    column: 4
                }],
            line: 3,
            column: 1
        };
        expect(decorator.name).toBe('log');
        expect(decorator.arguments?.[0].value).toBe("argument");
    });
    test('Program interface and Token interface must adhere to definitions', () => {
        const token = {
            text: "fn",
            type: 1,
            line: 1,
            column: 0
        };
        const program = {
            type: 'Program',
            body: [],
            line: token.line,
            column: token.column
        };
        expect(program.body).toEqual([]);
        expect(program.line).toBe(1);
    });
});
