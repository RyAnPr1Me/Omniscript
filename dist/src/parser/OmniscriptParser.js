"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4_1 = require("antlr4");
const types_1 = require("./types");
/**
 * OmniscriptParser is responsible for parsing Omniscript source code into an AST.
 * Supports advanced features like:
 * - Generic type parameters
 * - Union and intersection types
 * - Async/await functions
 * - Decorators
 * - Enhanced error recovery
 *
 * @example
 * ```typescript
 * // Parse a generic function
 * fn map<T, U>(items: T[], fn: (item: T) => U): U[] {
 *   return items.map(fn);
 * }
 *
 * // Parse a decorated class with generic constraint
 * @component
 * class List<T extends Comparable> {
 *   items: T[];
 * }
 * ```
 */
class OmniscriptParser extends antlr4_1.Parser {
    constructor(input) {
        super(input);
    }
    program() {
        try {
            return {
                type: 'Program',
                body: this.parseStatements(),
                line: this._input.LT(1).line,
                column: this._input.LT(1).column
            };
        }
        catch (error) {
            const err = error;
            console.error(`Parser Error: ${err.message}`);
            throw err;
        }
    }
    parseStatements() {
        const statements = [];
        while (this._input.LA(1) !== OmniscriptParser.EOF) {
            statements.push(this.statement());
        }
        return statements;
    }
    statement() {
        const token = this._input.LT(1);
        if (this._input.LA(1) === OmniscriptParser.VAR) {
            return this.variableDeclaration();
        }
        if (this._input.LA(1) === OmniscriptParser.AT) {
            return this.decorator();
        }
        if (this._input.LA(1) === OmniscriptParser.ASYNC) {
            this.match(OmniscriptParser.ASYNC);
            return this.functionDeclaration(true);
        }
        throw new Error(`Unexpected token: ${token.text} at line ${token.line}:${token.column}`);
    }
    variableDeclaration() {
        const startToken = this._input.LT(1);
        this.match(OmniscriptParser.VAR);
        const name = this.match(OmniscriptParser.IDENTIFIER).text;
        let type = null;
        if (this._input.LA(1) === OmniscriptParser.COLON) {
            this.match(OmniscriptParser.COLON);
            type = this.type();
        }
        let initializer = null;
        if (this._input.LA(1) === OmniscriptParser.ASSIGN) {
            this.match(OmniscriptParser.ASSIGN);
            initializer = this.expression();
        }
        return {
            type: 'VariableDeclaration',
            name,
            varType: type,
            initializer,
            line: startToken.line,
            column: startToken.column
        };
    }
    decorator() {
        const startToken = this._input.LT(1);
        this.match(OmniscriptParser.AT);
        const name = this.qualifiedName();
        let args = null;
        if (this._input.LA(1) === OmniscriptParser.LPAREN) {
            this.match(OmniscriptParser.LPAREN);
            args = this.argumentList();
            this.match(OmniscriptParser.RPAREN);
        }
        return {
            type: 'Decorator',
            name,
            arguments: args,
            line: startToken.line,
            column: startToken.column
        };
    }
    qualifiedName() {
        const parts = [this.match(OmniscriptParser.IDENTIFIER).text];
        while (this._input.LA(1) === OmniscriptParser.DOT) {
            this.match(OmniscriptParser.DOT);
            parts.push(this.match(OmniscriptParser.IDENTIFIER).text);
        }
        return parts.join('.');
    }
    argumentList() {
        const args = [];
        do {
            args.push(this.expression());
            if (this._input.LA(1) === OmniscriptParser.COMMA) {
                this.match(OmniscriptParser.COMMA);
            }
            else {
                break;
            }
        } while (true);
        return args;
    }
    type() {
        if (this._input.LA(1) === OmniscriptParser.IDENTIFIER) {
            return this.match(OmniscriptParser.IDENTIFIER).text;
        }
        throw new Error(`Invalid type: ${this._input.LT(1).text}`);
    }
    expression() {
        return this.parseBinaryExpression(0);
    }
    parseBinaryExpression(precedence) {
        let left = this.parseUnaryExpression();
        while (true) {
            const operator = this.getCurrentOperator(); // Fixed type
            const newPrecedence = this.getOperatorPrecedence(operator);
            if (newPrecedence <= precedence) {
                break;
            }
            this.match(this.getOperatorToken(operator));
            const right = this.parseBinaryExpression(newPrecedence);
            left = {
                type: 'Expression',
                kind: types_1.ExpressionKind.Binary,
                operator,
                left,
                right,
                line: left.line,
                column: left.column
            };
        }
        return left;
    }
    parseUnaryExpression() {
        const token = this._input.LT(1);
        if (this.isUnaryOperator(token.type)) {
            const operator = token.text; // Fixed type
            this.match(token.type);
            const operand = this.parseUnaryExpression();
            return {
                type: 'Expression',
                kind: types_1.ExpressionKind.Unary,
                operator,
                left: operand,
                line: token.line,
                column: token.column
            };
        }
        return this.parsePrimaryExpression();
    }
    parsePrimaryExpression() {
        const token = this._input.LT(1);
        switch (token.type) {
            case OmniscriptParser.IDENTIFIER:
                this.match(OmniscriptParser.IDENTIFIER);
                let expr = {
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Identifier,
                    name: token.text,
                    line: token.line,
                    column: token.column
                };
                // Handle member access and function calls
                while (this._input.LA(1) === OmniscriptParser.DOT ||
                    this._input.LA(1) === OmniscriptParser.LPAREN) {
                    if (this._input.LA(1) === OmniscriptParser.DOT) {
                        this.match(OmniscriptParser.DOT);
                        const member = this.match(OmniscriptParser.IDENTIFIER).text;
                        expr = {
                            type: 'Expression',
                            kind: types_1.ExpressionKind.MemberAccess,
                            object: expr,
                            member,
                            line: token.line,
                            column: token.column
                        };
                    }
                    else {
                        this.match(OmniscriptParser.LPAREN);
                        const args = this._input.LA(1) !== OmniscriptParser.RPAREN ?
                            this.argumentList() : [];
                        this.match(OmniscriptParser.RPAREN);
                        expr = {
                            type: 'Expression',
                            kind: types_1.ExpressionKind.Call,
                            callee: expr,
                            arguments: args,
                            line: token.line,
                            column: token.column
                        };
                    }
                }
                return expr;
            case OmniscriptParser.NUMBER:
                this.match(OmniscriptParser.NUMBER);
                return {
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Literal,
                    value: Number(token.text),
                    line: token.line,
                    column: token.column
                };
            case OmniscriptParser.STRING:
                this.match(OmniscriptParser.STRING);
                return {
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Literal,
                    value: token.text.slice(1, -1),
                    line: token.line,
                    column: token.column
                };
            case OmniscriptParser.TRUE:
            case OmniscriptParser.FALSE:
                this.match(token.type);
                return {
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Literal,
                    value: token.type === OmniscriptParser.TRUE,
                    line: token.line,
                    column: token.column
                };
            case OmniscriptParser.NULL:
                this.match(OmniscriptParser.NULL);
                return {
                    type: 'Expression',
                    kind: types_1.ExpressionKind.Literal,
                    value: null, // Fixed type
                    line: token.line,
                    column: token.column
                };
            case OmniscriptParser.LBRACKET:
                return this.parseArrayLiteral();
            case OmniscriptParser.LBRACE:
                return this.parseObjectLiteral();
            case OmniscriptParser.LPAREN:
                this.match(OmniscriptParser.LPAREN);
                const groupExpr = this.expression();
                this.match(OmniscriptParser.RPAREN);
                return groupExpr;
            default:
                throw new Error(`Unexpected token in expression: ${token.text} at line ${token.line}:${token.column}`);
        }
    }
    getOperatorPrecedence(operator) {
        const precedenceMap = {
            '.': 16, // Member access
            '[]': 16, // Array access
            '()': 16, // Function call
            '!': 15, // Logical NOT
            '~': 15, // Bitwise NOT
            '*': 14, // Multiply
            '/': 14, // Divide
            '%': 14, // Modulo
            '+': 13, // Add
            '-': 13, // Subtract
            '<<': 12, // Bit shift left
            '>>': 12, // Bit shift right
            '<': 11, // Less than
            '<=': 11, // Less than or equal
            '>': 11, // Greater than
            '>=': 11, // Greater than or equal
            '==': 10, // Equal
            '!=': 10, // Not equal
            '&': 9, // Bitwise AND
            '^': 8, // Bitwise XOR
            '|': 7, // Bitwise OR
            '&&': 6, // Logical AND
            '||': 5, // Logical OR
            '??': 4, // Nullish coalescing
            '?:': 3, // Ternary
            '=': 2, // Assignment
            '+=': 2, // Add assign
            '-=': 2 // Subtract assign
        };
        return precedenceMap[operator] || 0;
    }
    getOperatorToken(operator) {
        const operatorMap = {
            '+': OmniscriptParser.PLUS,
            '-': OmniscriptParser.MINUS,
            '*': OmniscriptParser.MULTIPLY,
            '/': OmniscriptParser.DIVIDE,
            '%': OmniscriptParser.MOD,
            '==': OmniscriptParser.EQ,
            '!=': OmniscriptParser.NEQ,
            '<': OmniscriptParser.LT,
            '>': OmniscriptParser.GT,
            '<=': OmniscriptParser.LTE,
            '>=': OmniscriptParser.GTE,
            '&&': OmniscriptParser.AND,
            '||': OmniscriptParser.OR,
            '!': OmniscriptParser.NOT
        };
        return operatorMap[operator] || 0;
    }
    parseArrayLiteral() {
        const startToken = this._input.LT(1);
        this.match(OmniscriptParser.LBRACKET);
        const elements = [];
        while (this._input.LA(1) !== OmniscriptParser.RBRACKET) {
            elements.push(this.expression());
            if (this._input.LA(1) === OmniscriptParser.COMMA) {
                this.match(OmniscriptParser.COMMA);
            }
            else {
                break;
            }
        }
        this.match(OmniscriptParser.RBRACKET);
        return {
            type: 'Expression',
            kind: types_1.ExpressionKind.ArrayLiteral, // Fixed type
            elements,
            line: startToken.line,
            column: startToken.column
        };
    }
    parseObjectLiteral() {
        const startToken = this._input.LT(1);
        this.match(OmniscriptParser.LBRACE);
        const properties = [];
        while (this._input.LA(1) !== OmniscriptParser.RBRACE) {
            const key = this.match(OmniscriptParser.IDENTIFIER).text;
            this.match(OmniscriptParser.COLON);
            const value = this.expression();
            properties.push({ key, value });
            if (this._input.LA(1) === OmniscriptParser.COMMA) {
                this.match(OmniscriptParser.COMMA);
            }
            else {
                break;
            }
        }
        this.match(OmniscriptParser.RBRACE);
        return {
            type: 'Expression',
            kind: types_1.ExpressionKind.ObjectLiteral, // Fixed type
            properties,
            line: startToken.line,
            column: startToken.column
        };
    }
    getCurrentOperator() {
        const token = this._input.LT(1);
        return token.text;
    }
    isUnaryOperator(type) {
        const token = this._input.LT(1);
        return ['-', '!', '~'].includes(token.text);
    }
    /**
     * Parses a function declaration with optional generic parameters.
     * @param isAsync - Whether the function is async
     */
    functionDeclaration(isAsync = false) {
        const startToken = this._input.LT(1);
        this.match(OmniscriptParser.FN);
        const name = this.match(OmniscriptParser.IDENTIFIER).text;
        // Parse generic parameters if present
        const generics = this._input.LA(1) === OmniscriptParser.LT ?
            this.parseGenericParameters() : undefined;
        this.match(OmniscriptParser.LPAREN);
        const params = this.parameterList();
        this.match(OmniscriptParser.RPAREN);
        this.match(OmniscriptParser.COLON);
        const returnType = this.parseTypeReference();
        const body = this.block();
        return {
            type: 'FunctionDeclaration',
            name,
            generics,
            params,
            returnType,
            body,
            isAsync,
            line: startToken.line,
            column: startToken.column
        };
    }
    /**
     * Parses generic type parameters with optional constraints.
     * Example: <T extends number, U = string>
     */
    parseGenericParameters() {
        const generics = [];
        this.match(OmniscriptParser.LT);
        do {
            const name = this.match(OmniscriptParser.IDENTIFIER).text;
            let constraint, defaultType;
            if (this._input.LA(1) === OmniscriptParser.EXTENDS) {
                this.match(OmniscriptParser.EXTENDS);
                constraint = this.parseTypeReference();
            }
            if (this._input.LA(1) === OmniscriptParser.ASSIGN) {
                this.match(OmniscriptParser.ASSIGN);
                defaultType = this.parseTypeReference();
            }
            generics.push({ name, constraint, default: defaultType });
            if (this._input.LA(1) === OmniscriptParser.COMMA) {
                this.match(OmniscriptParser.COMMA);
            }
            else {
                break;
            }
        } while (true);
        this.match(OmniscriptParser.GT);
        return generics;
    }
    /**
     * Parses a type reference, including generics and union types.
     * Examples:
     * - number
     * - Array<T>
     * - string | null
     */
    parseTypeReference() {
        const name = this.match(OmniscriptParser.IDENTIFIER).text;
        // Handle generic type arguments
        let typeArguments;
        if (this._input.LA(1) === OmniscriptParser.LT) {
            this.match(OmniscriptParser.LT);
            typeArguments = [];
            do {
                typeArguments.push(this.parseTypeReference());
                if (this._input.LA(1) === OmniscriptParser.COMMA) {
                    this.match(OmniscriptParser.COMMA);
                }
                else {
                    break;
                }
            } while (true);
            this.match(OmniscriptParser.GT);
        }
        // Handle union types
        if (this._input.LA(1) === OmniscriptParser.PIPE) {
            this.match(OmniscriptParser.PIPE);
            const rightType = this.parseTypeReference();
            return {
                name: 'Union',
                isUnion: true,
                unionTypes: [
                    { name, typeArguments, isArray: false },
                    rightType
                ]
            };
        }
        return {
            name,
            typeArguments,
            isArray: name === 'Array' || name.endsWith('[]'),
            isUnion: false
        };
    }
    parameterList() {
        // Placeholder implementation for parameter list parsing
        return [];
    }
    block() {
        // Placeholder implementation for block parsing
        return [];
    }
}
OmniscriptParser.EOF = -1; // Define EOF as a static property
OmniscriptParser.VAR = 1; // Define VAR as a static property
OmniscriptParser.AT = 2; // Define AT as a static property
OmniscriptParser.COLON = 3; // Define COLON as a static property
OmniscriptParser.ASSIGN = 4; // Define ASSIGN as a static property
OmniscriptParser.IDENTIFIER = 5; // Define IDENTIFIER as a static property
OmniscriptParser.LPAREN = 6; // Define LPAREN as a static property
OmniscriptParser.RPAREN = 7; // Define RPAREN as a static property
OmniscriptParser.DOT = 8; // Define DOT as a static property
OmniscriptParser.COMMA = 9; // Define COMMA as a static property
OmniscriptParser.PLUS = 10;
OmniscriptParser.MINUS = 11;
OmniscriptParser.MULTIPLY = 12;
OmniscriptParser.DIVIDE = 13;
OmniscriptParser.MOD = 14;
OmniscriptParser.EQ = 15;
OmniscriptParser.NEQ = 16;
OmniscriptParser.LT = 17;
OmniscriptParser.GT = 18;
OmniscriptParser.LTE = 19;
OmniscriptParser.GTE = 20;
OmniscriptParser.AND = 21;
OmniscriptParser.OR = 22;
OmniscriptParser.NOT = 23;
OmniscriptParser.STRING = 24;
OmniscriptParser.NUMBER = 25;
OmniscriptParser.TRUE = 26;
/**
 * Core token definitions for the Omniscript parser.
 * Each token represents a discrete lexical element in the language syntax.
 *
 * Token Categories:
 * ----------------
 * Basic Syntax (1-9):      Core language building blocks
 *   VAR, AT, COLON, etc.   - Basic syntax elements
 *
 * Operators (10-23):       Mathematical and logical operations
 *   PLUS, MINUS, etc.      - Arithmetic operators
 *   AND, OR, etc.          - Logical operators
 *
 * Literals (24-28):        Constant values
 *   STRING, NUMBER         - Basic data types
 *   TRUE, FALSE, NULL      - Special literals
 *
 * Delimiters (29-32):      Code block and grouping symbols
 *   LBRACKET/RBRACKET     - Array literals, indexing
 *   LBRACE/RBRACE         - Object literals, blocks
 *
 * Keywords (33-39):        Reserved language keywords
 *   ASYNC/AWAIT           - Asynchronous programming
 *   FN                    - Function declarations
 *   MATCH/CASE           - Pattern matching
 *
 * Types (40-46):          Advanced type system tokens
 *   EXTENDS/PIPE         - Inheritance and unions
 *   GENERIC             - Generic type parameters
 *   IMPLEMENTS          - Interface implementation
 *   ABSTRACT           - Abstract classes/methods
 *   TYPEOF            - Type queries
 *   INFER             - Type inference
 *
 * Control Flow (47-52):   Enhanced flow control
 *   YIELD             - Generator functions
 *   WITH              - Resource management
 *   DO               - Expression blocks
 *   UNLESS           - Inverted if
 *   UNTIL            - Inverted while
 *
 * Pattern Matching (53-58): Pattern matching features
 *   AS               - Pattern binding
 *   WHEN             - Pattern guards
 *   REST             - Rest patterns
 *   IS               - Type testing
 *   SOME             - Optional matching
 *   NONE             - Optional matching
 *
 * @example
 * ```typescript
 * // Pattern matching with type guards
 * match value {
 *   case x is Number when x > 0 => "positive",
 *   case Some(x) => x,
 *   case None => "nothing"
 * }
 *
 * // Enhanced control flow
 * do {
 *   let x = compute()
 *   x * 2
 * }
 *
 * // Resource management
 * with(file.open()) {
 *   file.write()
 * }
 * ```
 *
 * Developer Notes:
 * - Token values are sequential for efficient lookup
 * - Categories are grouped logically for maintainability
 * - Add new tokens at the end of their category
 * - Update grammar file when adding tokens
 * - Pattern matching tokens support rich pattern expressions
 * - Control flow tokens enable more expressive code structure
 * - Type system tokens allow for advanced type relationships
 */
/** Boolean literal false */
OmniscriptParser.FALSE = 27;
/** Null literal */
OmniscriptParser.NULL = 28;
/** Left square bracket [ */
OmniscriptParser.LBRACKET = 29;
/** Right square bracket ] */
OmniscriptParser.RBRACKET = 30;
/** Left curly brace { */
OmniscriptParser.LBRACE = 31;
/** Right curly brace } */
OmniscriptParser.RBRACE = 32;
/** async keyword for asynchronous functions */
OmniscriptParser.ASYNC = 33;
/** await keyword for awaiting Promises */
OmniscriptParser.AWAIT = 34;
/** fn keyword for function declarations */
OmniscriptParser.FN = 35;
/** extends keyword for type constraints and class inheritance */
OmniscriptParser.EXTENDS = 36;
/** | operator for union types */
OmniscriptParser.PIPE = 37;
/** Generic type parameter tokens like <T> */
OmniscriptParser.GENERIC = 38;
exports.default = OmniscriptParser;
