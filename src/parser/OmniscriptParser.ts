import { Parser } from 'antlr4';
import { OmniscriptError } from '../errors';
import { 
  Program, Statement, Expression, VariableDeclaration, 
  Decorator, ParserInput, Token, ExpressionKind, 
  Operator, FunctionDeclaration, GenericParameter,
  Parameter, TypeReference, ASTError, ReturnStatement, IfStatement, WhileStatement, ForStatement, ThrowStatement, TryStatement 
} from './types';

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
export default class OmniscriptParser extends Parser {
  // Add a safe stub for addTokenNode to prevent null dereference errors
  private _state: any = {};
  addTokenNode(token: any) {
    // Safe no-op: accept unexpected null/undefined and avoid accessing internal parser state.
    try {
      if (!token) return;
      // Optionally collect tokens for diagnostics in debug builds
      if (!this._state) this._state = {};
      // harmlessly record last token text for diagnostics
      this._state.lastTokenText = token.text || token.value || null;
    } catch (e) {
      // swallow any errors - parser should continue to throw original errors where appropriate
    }
  }
  static readonly EOF = -1; // Define EOF as a static property
  static readonly VAR = 1; // Define VAR as a static property
  static readonly AT = 2; // Define AT as a static property
  static readonly COLON = 3; // Define COLON as a static property
  static readonly ASSIGN = 4; // Define ASSIGN as a static property
  static readonly IDENTIFIER = 5; // Define IDENTIFIER as a static property
  static readonly LPAREN = 6; // Define LPAREN as a static property
  static readonly RPAREN = 7; // Define RPAREN as a static property
  static readonly DOT = 8; // Define DOT as a static property
  static readonly COMMA = 9; // Define COMMA as a static property
  static readonly PLUS = 10;
  static readonly MINUS = 11;
  static readonly MULTIPLY = 12;
  static readonly DIVIDE = 13;
  static readonly MOD = 14;
  static readonly EQ = 15;
  static readonly NEQ = 16;
  static readonly LT = 17;
  static readonly GT = 18;
  static readonly LTE = 19;
  static readonly GTE = 20;
  static readonly AND = 21;
  static readonly OR = 22;
  static readonly NOT = 23;
  static readonly STRING = 24;
  static readonly NUMBER = 25;
  static readonly TRUE = 26;

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
  static readonly FALSE = 27;
  
  /** Null literal */
  static readonly NULL = 28;
  
  /** Left square bracket [ */
  static readonly LBRACKET = 29;
  
  /** Right square bracket ] */
  static readonly RBRACKET = 30;
  
  /** Left curly brace { */
  static readonly LBRACE = 31;
  
  /** Right curly brace } */
  static readonly RBRACE = 32;
  
  /** async keyword for asynchronous functions */
  static readonly ASYNC = 33;
  
  /** await keyword for awaiting Promises */
  static readonly AWAIT = 34;
  
  /** fn keyword for function declarations */
  static readonly FN = 35;
  
  /** extends keyword for type constraints and class inheritance */
  static readonly EXTENDS = 36;
  
  /** | operator for union types */
  static readonly PIPE = 37;
  
  /** Generic type parameter tokens like <T> */
  static readonly GENERIC = 38;

  // Add new static tokens for the new features
  static readonly QUESTION = 39; // ?
  static readonly NULLISH_ASSIGN = 40; // ??=
  // Additional keyword tokens (placeholders; actual lexer must supply these types)
  static readonly RETURN = 41;
  static readonly IF = 42;
  static readonly ELSE = 43;
  static readonly WHILE = 44;
  static readonly FOR = 45;
  static readonly TRY = 46;
  static readonly CATCH = 47;
  static readonly FINALLY = 48;
  static readonly THROW = 49;
  static readonly LBRACE_FN = 50; // pseudo token for '{'
  static readonly RBRACE_FN = 51; // pseudo token for '}'
  static readonly SEMI = 52; // ;
  static readonly MATCH = 53; // match keyword
  static readonly ARROW = 54; // =>

  constructor(input: any) {
    if (!input) {
      throw new OmniscriptError('No input provided to parser');
    }
    super(input);
  }

  program(): Program {
    try {
      // Validate input stream
      if (!this._input || !this._input.LT) {
        throw new OmniscriptError('Invalid parser input stream');
      }

      // Get first token for line/column info
      const startToken = this._input.LT(1);
      if (!startToken) {
        throw new OmniscriptError('Unable to read first token');
      }

      return {
        type: 'Program',
        body: this.parseStatements(),
        line: startToken.line || 0,
        column: startToken.column || 0
      };
    } catch (error) {
      if (error instanceof OmniscriptError) {
        throw error;
      }
      throw new OmniscriptError(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  parseStatements(): Statement[] {
    const statements: Statement[] = [];
    try {
      while (this._input && this._input.LA(1) !== OmniscriptParser.EOF) {
        const token = this._input.LT(1);
        if (!token) {
          throw new OmniscriptError('Unexpected end of input');
        }
        statements.push(this.statement());
      }
      return statements;
    } catch (error) {
      if (error instanceof OmniscriptError) {
        throw error;
      }
      throw new OmniscriptError(`Error parsing statements: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  statement(): Statement {
    const token = this._input.LT(1);
    if (this._input.LA(1) === OmniscriptParser.VAR) {
      return this.variableDeclaration();
    }
    if (this._input.LA(1) === OmniscriptParser.AT) {
      // accumulate decorators then apply to next declaration
      const decorators: any[] = [];
      while (this._input.LA(1) === OmniscriptParser.AT) {
        decorators.push(this.decorator());
      }
      // After decorators, expect class or function
      if (this._input.LA(1) === OmniscriptParser.FN || this._input.LA(1) === OmniscriptParser.ASYNC) {
        const isAsync = this._input.LA(1) === OmniscriptParser.ASYNC;
        if (isAsync) this.match(OmniscriptParser.ASYNC);
        const fnDecl = this.functionDeclaration(isAsync);
        (fnDecl as any).decorators = decorators;
        return fnDecl as any;
      }
      if (this._input.LA(1) === OmniscriptParser.IDENTIFIER && this._input.LT(1).text === 'class') {
        // but 'class' is not tokenized yet; treat as identifier for now
        return this.classDeclaration(decorators);
      }
      // Fallback: return first decorator node if nothing to decorate
      return decorators[0];
    }
    if (this._input.LA(1) === OmniscriptParser.ASYNC) {
      this.match(OmniscriptParser.ASYNC);
      return this.functionDeclaration(true);
    }
    if (this._input.LA(1) === OmniscriptParser.FN) {
      return this.functionDeclaration(false);
    }
    // naive 'class' keyword recognition (IDENTIFIER with text 'class')
    if (this._input.LA(1) === OmniscriptParser.IDENTIFIER && token.text === 'class') {
      return this.classDeclaration();
    }
    if (this._input.LA(1) === OmniscriptParser.RETURN) {
      return this.returnStatement();
    }
    if (this._input.LA(1) === OmniscriptParser.IF) {
      return this.ifStatement();
    }
    if (this._input.LA(1) === OmniscriptParser.WHILE) {
      return this.whileStatement();
    }
    if (this._input.LA(1) === OmniscriptParser.FOR) {
      return this.forStatement();
    }
    if (this._input.LA(1) === OmniscriptParser.TRY) {
      return this.tryStatement();
    }
    if (this._input.LA(1) === OmniscriptParser.THROW) {
      return this.throwStatement();
    }
      // Handle import statements
      if (this._input.LA(1) === OmniscriptParser.IDENTIFIER && token.text === 'import') {
        // Simple import node for AST, not full implementation
        this.match(OmniscriptParser.IDENTIFIER);
        let imported = null;
        if (this._input.LA(1) === OmniscriptParser.LBRACE) {
          this.match(OmniscriptParser.LBRACE);
          imported = [];
          while (this._input.LA(1) === OmniscriptParser.IDENTIFIER) {
            imported.push(this.match(OmniscriptParser.IDENTIFIER).text);
            if (this._input.LA(1) === OmniscriptParser.COMMA) this.match(OmniscriptParser.COMMA);
          }
          this.match(OmniscriptParser.RBRACE);
          if (this._input.LA(1) === OmniscriptParser.IDENTIFIER && this._input.LT(1).text === 'from') this.match(OmniscriptParser.IDENTIFIER);
        }
        const from = this.match(OmniscriptParser.STRING).text;
        if (this._input.LA(1) === OmniscriptParser.SEMI) this.match(OmniscriptParser.SEMI);
        return { type: 'ImportDeclaration', imported, from, line: token.line, column: token.column } as any;
      }
      // Handle match statements as expressions
      if (this._input.LA(1) === OmniscriptParser.MATCH) {
        return this.parseMatchExpression();
      }
    throw new Error(`Unexpected token: ${token.text} at line ${token.line}:${token.column}`);
  }

  variableDeclaration(): VariableDeclaration {
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

  decorator(): Decorator {
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

  qualifiedName(): string {
    const parts = [this.match(OmniscriptParser.IDENTIFIER).text];
    while (this._input.LA(1) === OmniscriptParser.DOT) {
      this.match(OmniscriptParser.DOT);
      parts.push(this.match(OmniscriptParser.IDENTIFIER).text);
    }
    return parts.join('.');
  }

  argumentList(): any[] {
    const args: any[] = [];
    do {
      args.push(this.expression());
      if (this._input.LA(1) === OmniscriptParser.COMMA) {
        this.match(OmniscriptParser.COMMA);
      } else {
        break;
      }
    } while (true);
    return args;
  }

  type(): string {
    if (this._input.LA(1) === OmniscriptParser.IDENTIFIER) {
      return this.match(OmniscriptParser.IDENTIFIER).text;
    }
    throw new Error(`Invalid type: ${this._input.LT(1).text}`);
  }

  expression(): Expression {
    return this.parseBinaryExpression(0);
  }

  private parseBinaryExpression(precedence: number): Expression {
    let left = this.parseUnaryExpression();

    while (true) {
      const operator = this.getCurrentOperator() as Operator; // Fixed type
      const newPrecedence = this.getOperatorPrecedence(operator);

      // Add support for ternary operator (?:)
      if (this._input.LA(1) === OmniscriptParser.QUESTION) {
        this.match(OmniscriptParser.QUESTION);
        const trueExpr = this.expression();
        this.match(OmniscriptParser.COLON);
        const falseExpr = this.expression();
        left = {
          type: 'Expression',
          kind: ExpressionKind.Ternary,
          condition: left,
          trueExpr,
          falseExpr,
          line: left.line,
          column: left.column
        };
        continue;
      }

      // Add support for nullish assignment (??=)
      if (this._input.LA(1) === OmniscriptParser.NULLISH_ASSIGN) {
        this.match(OmniscriptParser.NULLISH_ASSIGN);
        const right = this.parseBinaryExpression(newPrecedence);
        left = {
          type: 'Expression',
          kind: ExpressionKind.Binary,
          operator: '??=',
          left,
          right,
          line: left.line,
          column: left.column
        };
        continue;
      }

      if (newPrecedence <= precedence) {
        break;
      }

      this.match(this.getOperatorToken(operator));
      const right = this.parseBinaryExpression(newPrecedence);

      left = {
        type: 'Expression',
        kind: ExpressionKind.Binary,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      };
    }

    return left;
  }

  private parseUnaryExpression(): Expression {
    const token = this._input.LT(1);
    if (this.isUnaryOperator(token.type)) {
      const operator = token.text as Operator; // Fixed type
      this.match(token.type);
      const operand = this.parseUnaryExpression();
      return {
        type: 'Expression',
        kind: ExpressionKind.Unary,
        operator,
        left: operand,
        line: token.line,
        column: token.column
      };
    }
    if (token.type === OmniscriptParser.AWAIT) {
      this.match(OmniscriptParser.AWAIT);
      const expr = this.parseUnaryExpression();
      return { type:'Expression', kind: ExpressionKind.Await, left: expr, line: token.line, column: token.column } as any;
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): Expression {
    const token = this._input.LT(1);
    if (!token) {
      throw new OmniscriptError('Unexpected end of input in expression');
    }
    
    switch (token.type) {
      case OmniscriptParser.IDENTIFIER:
        this.match(OmniscriptParser.IDENTIFIER);
        let expr: Expression = {
          type: 'Expression',
          kind: ExpressionKind.Identifier,
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
              kind: ExpressionKind.MemberAccess,
              object: expr,
              member,
              line: token.line,
              column: token.column
            };
          } else {
            this.match(OmniscriptParser.LPAREN);
            const args = this._input.LA(1) !== OmniscriptParser.RPAREN ? 
              this.argumentList() : [];
            this.match(OmniscriptParser.RPAREN);
            expr = {
              type: 'Expression',
              kind: ExpressionKind.Call,
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
          kind: ExpressionKind.Literal,
          value: Number(token.text),
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.STRING:
        this.match(OmniscriptParser.STRING);
        return {
          type: 'Expression',
          kind: ExpressionKind.Literal,
          value: token.text.slice(1, -1),
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.TRUE:
      case OmniscriptParser.FALSE:
        this.match(token.type);
        return {
          type: 'Expression',
          kind: ExpressionKind.Literal,
          value: token.type === OmniscriptParser.TRUE,
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.NULL:
        this.match(OmniscriptParser.NULL);
        return {
          type: 'Expression',
          kind: ExpressionKind.Literal,
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

      case OmniscriptParser.MATCH:
        return this.parseMatchExpression();

      default:
        throw new Error(`Unexpected token in expression: ${token.text ?? '<null>'} at line ${token.line ?? '?'}:${token.column ?? '?'}`);
    }
  }

  private parseMatchExpression(): Expression {
    const start = this._input.LT(1); this.match(OmniscriptParser.MATCH);
    const subject = this.expression();
    this.match(OmniscriptParser.LBRACE);
    const arms: any[] = [];
    while (this._input.LA(1) !== OmniscriptParser.RBRACE && this._input.LA(1) !== OmniscriptParser.EOF) {
      // pattern
      const patTok = this._input.LT(1);
      let pattern: any;
      if (patTok.type === OmniscriptParser.IDENTIFIER) {
        if (patTok.text === '_') { this.match(OmniscriptParser.IDENTIFIER); pattern = { kind:'Wildcard' }; }
        else { this.match(OmniscriptParser.IDENTIFIER); pattern = { kind:'Identifier', name: patTok.text }; }
      } else if (patTok.type === OmniscriptParser.NUMBER) {
        this.match(OmniscriptParser.NUMBER); pattern = { kind:'Number', value: Number(patTok.text) };
      } else {
        throw new Error(`Invalid match pattern: ${patTok.text}`);
      }
      // optional guard: if <expr>
      let guard: Expression | undefined;
      if (this._input.LA(1) === OmniscriptParser.IF) {
        this.match(OmniscriptParser.IF);
        guard = this.expression();
      }
      // => value expression
      if (this._input.LA(1) === OmniscriptParser.ARROW) this.match(OmniscriptParser.ARROW); else {
        // allow ':' as fallback
        if (this._input.LA(1) === OmniscriptParser.COLON) this.match(OmniscriptParser.COLON); else throw new Error('Expected => in match arm');
      }
      const valueExpr = this.expression();
      arms.push({ pattern, guard, value: valueExpr });
      if (this._input.LA(1) === OmniscriptParser.COMMA) { this.match(OmniscriptParser.COMMA); continue; }
      else break;
    }
    this.match(OmniscriptParser.RBRACE);
    return {
      type: 'Expression',
      kind: ExpressionKind.Match,
      subject,
      matchArms: arms,
      line: start.line,
      column: start.column
    } as any;
  }

  private getOperatorPrecedence(operator: string): number {
    const precedenceMap: {[key: string]: number} = {
      '.': 16,      // Member access
      '[]': 16,     // Array access
      '()': 16,     // Function call
      '!': 15,      // Logical NOT
      '~': 15,      // Bitwise NOT
      '*': 14,      // Multiply
      '/': 14,      // Divide
      '%': 14,      // Modulo
      '+': 13,      // Add
      '-': 13,      // Subtract
      '<<': 12,     // Bit shift left
      '>>': 12,     // Bit shift right
      '<': 11,      // Less than
      '<=': 11,     // Less than or equal
      '>': 11,      // Greater than
      '>=': 11,     // Greater than or equal
      '==': 10,     // Equal
      '!=': 10,     // Not equal
      '&': 9,       // Bitwise AND
      '^': 8,       // Bitwise XOR
      '|': 7,       // Bitwise OR
      '&&': 6,      // Logical AND
      '||': 5,      // Logical OR
      '??': 4,      // Nullish coalescing
      '?:': 3,      // Ternary
      '=': 2,       // Assignment
      '+=': 2,      // Add assign
      '-=': 2,      // Subtract assign
      '??=': 2      // Nullish assignment
    };
    return precedenceMap[operator] || 0;
  }

  private getOperatorToken(operator: string): number {
    const operatorMap: {[key: string]: number} = {
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

  private parseArrayLiteral(): Expression {
    const startToken = this._input.LT(1);
    this.match(OmniscriptParser.LBRACKET);
    const elements: Expression[] = [];
    
    while (this._input.LA(1) !== OmniscriptParser.RBRACKET) {
      elements.push(this.expression());
      if (this._input.LA(1) === OmniscriptParser.COMMA) {
        this.match(OmniscriptParser.COMMA);
      } else {
        break;
      }
    }
    
    this.match(OmniscriptParser.RBRACKET);
    return {
      type: 'Expression',
      kind: ExpressionKind.ArrayLiteral, // Fixed type
      elements,
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseObjectLiteral(): Expression {
    const startToken = this._input.LT(1);
    this.match(OmniscriptParser.LBRACE);
    const properties: {key: string; value: Expression}[] = [];
    
    while (this._input.LA(1) !== OmniscriptParser.RBRACE) {
      const key = this.match(OmniscriptParser.IDENTIFIER).text;
      this.match(OmniscriptParser.COLON);
      const value = this.expression();
      properties.push({ key, value });
      
      if (this._input.LA(1) === OmniscriptParser.COMMA) {
        this.match(OmniscriptParser.COMMA);
      } else {
        break;
      }
    }
    
    this.match(OmniscriptParser.RBRACE);
    return {
      type: 'Expression',
      kind: ExpressionKind.ObjectLiteral, // Fixed type
      properties,
      line: startToken.line,
      column: startToken.column
    };
  }

  private getCurrentOperator(): string {
    const token = this._input.LT(1);
    if (!token) {
      throw new OmniscriptError('Unexpected end of input while reading operator');
    }
    return token.text;
  }

  private isUnaryOperator(type: number): boolean {
    const token = this._input.LT(1);
    if (!token) {
      throw new OmniscriptError('Unexpected end of input while checking unary operator');
    }
    return ['-', '!', '~'].includes(token.text);
  }

  /**
   * Parses a function declaration with optional generic parameters.
   * @param isAsync - Whether the function is async
   */
  functionDeclaration(isAsync: boolean = false): FunctionDeclaration {
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
  private parseGenericParameters(): GenericParameter[] {
    const generics: GenericParameter[] = [];
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
      } else {
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
  private parseTypeReference(): TypeReference {
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
        } else {
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

  private parameterList(): any[] {
    const params: Parameter[] = [];
    while (this._input.LA(1) === OmniscriptParser.IDENTIFIER) {
      const nameTok = this._input.LT(1); this.match(OmniscriptParser.IDENTIFIER);
      let optional = false;
      if (this._input.LA(1) === OmniscriptParser.QUESTION) { this.match(OmniscriptParser.QUESTION); optional = true; }
      let typeRef: TypeReference = { name: 'any', isUnion: false } as any;
      if (this._input.LA(1) === OmniscriptParser.COLON) {
        this.match(OmniscriptParser.COLON);
        typeRef = this.parseTypeReference();
      }
      let defaultValue: Expression | undefined;
      if (this._input.LA(1) === OmniscriptParser.ASSIGN) {
        this.match(OmniscriptParser.ASSIGN);
        defaultValue = this.expression();
      }
      params.push({ name: nameTok.text, type: typeRef, optional, defaultValue });
      if (this._input.LA(1) === OmniscriptParser.COMMA) { this.match(OmniscriptParser.COMMA); } else break;
    }
    return params;
  }

  private block(): any[] {
    const stmts: Statement[] = [];
    // Expect '{'
    if (this._input.LA(1) !== OmniscriptParser.LBRACE) {
      return stmts; // treat empty block if missing
    }
    this.match(OmniscriptParser.LBRACE);
    while (this._input.LA(1) !== OmniscriptParser.RBRACE && this._input.LA(1) !== OmniscriptParser.EOF) {
      stmts.push(this.statement());
    }
    if (this._input.LA(1) === OmniscriptParser.RBRACE) this.match(OmniscriptParser.RBRACE);
    return stmts;
  }

  private returnStatement(): ReturnStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.RETURN);
    let argument: Expression | null = null;
    if (this._input.LA(1) !== OmniscriptParser.RBRACE && this._input.LA(1) !== OmniscriptParser.EOF) {
      argument = this.expression();
    }
    return { type: 'ReturnStatement', argument, line: tok.line, column: tok.column };
  }

  private ifStatement(): IfStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.IF);
    const condition = this.expression();
    const thenBody = this.block();
    let elseBody: Statement[] | undefined;
    if (this._input.LA(1) === OmniscriptParser.ELSE) { this.match(OmniscriptParser.ELSE); elseBody = this.block(); }
    return { type:'IfStatement', condition, thenBody, elseBody, line: tok.line, column: tok.column };
  }

  private classDeclaration(decorators: any[] = []): any {
    const start = this._input.LT(1); // 'class' identifier
    this.match(OmniscriptParser.IDENTIFIER); // consume 'class'
    const nameTok = this.match(OmniscriptParser.IDENTIFIER);
    this.match(OmniscriptParser.LBRACE);
    const methods: any[] = [];
    while (this._input.LA(1) !== OmniscriptParser.RBRACE && this._input.LA(1) !== OmniscriptParser.EOF) {
      // operator method: identifier 'operator' SYMBOL
      const mDecorators: any[] = [];
      while (this._input.LA(1) === OmniscriptParser.AT) mDecorators.push(this.decorator());
      let isAsync = false;
      if (this._input.LA(1) === OmniscriptParser.ASYNC) { this.match(OmniscriptParser.ASYNC); isAsync = true; }
      if (this._input.LA(1) === OmniscriptParser.IDENTIFIER && this._input.LT(1).text === 'operator') {
        this.match(OmniscriptParser.IDENTIFIER); // operator keyword
        const opTok = this._input.LT(1); this.match(this._input.LA(1)); // consume operator symbol token
        const params = this.parseMethodParams();
        const body = this.block();
        methods.push({ type:'MethodDeclaration', name:`operator${opTok.text}`, isOperator:true, operatorSymbol: opTok.text, params, body, isAsync, decorators:mDecorators });
        continue;
      }
      // normal method name
      const methodNameTok = this.match(OmniscriptParser.IDENTIFIER);
      const params = this.parseMethodParams();
      const body = this.block();
      methods.push({ type:'MethodDeclaration', name: methodNameTok.text, params, body, isAsync, decorators:mDecorators });
    }
    this.match(OmniscriptParser.RBRACE);
    return { type:'ClassDeclaration', name: nameTok.text, methods, decorators, line: start.line, column: start.column };
  }

  private parseMethodParams(): any[] {
    this.match(OmniscriptParser.LPAREN);
    const params: any[] = [];
    while (this._input.LA(1) === OmniscriptParser.IDENTIFIER) {
      const p = this.match(OmniscriptParser.IDENTIFIER); params.push({ name: p.text });
      if (this._input.LA(1) === OmniscriptParser.COMMA) { this.match(OmniscriptParser.COMMA); } else break;
    }
    this.match(OmniscriptParser.RPAREN);
    return params;
  }

  private whileStatement(): WhileStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.WHILE);
    const condition = this.expression();
    const body = this.block();
    return { type:'WhileStatement', condition, body, line: tok.line, column: tok.column };
  }

  private forStatement(): ForStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.FOR);
    // Canonical form: for (init; condition; update) { ... }
    this.match(OmniscriptParser.LPAREN);
    // init: may be variable declaration or expression or empty
    let init: Statement | null = null;
    if (this._input.LA(1) !== OmniscriptParser.SEMI) {
      if (this._input.LA(1) === OmniscriptParser.VAR) {
        init = this.variableDeclaration();
      } else {
        const exprInit = this.expression();
        init = exprInit as any;
      }
    }
    this.match(OmniscriptParser.SEMI);

    // condition: expression or empty
    let condition: Expression | null = null;
    if (this._input.LA(1) !== OmniscriptParser.SEMI) {
      condition = this.expression();
    }
    this.match(OmniscriptParser.SEMI);

    // update: expression or empty
    let update: Expression | null = null;
    if (this._input.LA(1) !== OmniscriptParser.RPAREN) {
      update = this.expression();
    }
    this.match(OmniscriptParser.RPAREN);

    const body = this.block();
    return { type:'ForStatement', init, condition, update, body, line: tok.line, column: tok.column };
  }

  private throwStatement(): ThrowStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.THROW);
    const argument = this.expression();
    return { type:'ThrowStatement', argument, line: tok.line, column: tok.column };
  }

  private tryStatement(): TryStatement {
    const tok = this._input.LT(1); this.match(OmniscriptParser.TRY);
    const tryBlock = this.block();
    let catchVar: string | undefined; let catchBlock: Statement[] | undefined; let finallyBlock: Statement[] | undefined;
    if (this._input.LA(1) === OmniscriptParser.CATCH) {
      this.match(OmniscriptParser.CATCH);
      if (this._input.LA(1) === OmniscriptParser.LPAREN) { this.match(OmniscriptParser.LPAREN); catchVar = this.match(OmniscriptParser.IDENTIFIER).text; this.match(OmniscriptParser.RPAREN); }
      catchBlock = this.block();
    }
    if (this._input.LA(1) === OmniscriptParser.FINALLY) { this.match(OmniscriptParser.FINALLY); finallyBlock = this.block(); }
    return { type:'TryStatement', tryBlock, catchVar, catchBlock, finallyBlock, line: tok.line, column: tok.column };
  }
}
