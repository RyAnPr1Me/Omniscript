import { Parser } from 'antlr4';
import { Program, Statement, Expression, VariableDeclaration, Decorator, ParserInput, Token } from './types';

export default class OmniscriptParser extends Parser {
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
  static readonly FALSE = 27;
  static readonly NULL = 28;
  static readonly LBRACKET = 29;
  static readonly RBRACKET = 30;
  static readonly LBRACE = 31;
  static readonly RBRACE = 32;

  constructor(input: any) {
    super(input);
  }

  program(): Program {
    try {
      return {
        type: 'Program',
        body: this.parseStatements(),
        line: this._input.LT(1).line,
        column: this._input.LT(1).column
      };
    } catch (error) {
      const err = error as Error;
      console.error(`Parser Error: ${err.message}`);
      throw err;
    }
  }

  parseStatements(): Statement[] {
    const statements: Statement[] = [];
    while (this._input.LA(1) !== OmniscriptParser.EOF) {
      statements.push(this.statement());
    }
    return statements;
  }

  statement(): Statement {
    const token = this._input.LT(1);
    if (this._input.LA(1) === OmniscriptParser.VAR) {
      return this.variableDeclaration();
    }
    if (this._input.LA(1) === OmniscriptParser.AT) {
      return this.decorator();
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
    this.match(OmniscriptParser.AT);
    const name = this.qualifiedName();
    let args = null;
    if (this._input.LA(1) === OmniscriptParser.LPAREN) {
      this.match(OmniscriptParser.LPAREN);
      args = this.argumentList();
      this.match(OmniscriptParser.RPAREN);
    }
    return { type: 'Decorator', name, arguments: args };
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
      const operator = this.getCurrentOperator();
      const newPrecedence = this.getOperatorPrecedence(operator);
      
      if (newPrecedence <= precedence) {
        break;
      }

      this.match(this.getOperatorToken(operator));
      const right = this.parseBinaryExpression(newPrecedence);

      left = {
        type: 'Expression',
        kind: 'Binary',
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
      const operator = token.text;
      this.match(token.type);
      const operand = this.parseUnaryExpression();
      return {
        type: 'Expression',
        kind: 'Unary',
        operator,
        left: operand,
        line: token.line,
        column: token.column
      };
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): Expression {
    const token = this._input.LT(1);
    
    switch (token.type) {
      case OmniscriptParser.IDENTIFIER:
        this.match(OmniscriptParser.IDENTIFIER);
        let expr: Expression = {
          type: 'Expression',
          kind: 'Identifier',
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
              kind: 'MemberAccess',
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
              kind: 'Call',
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
          kind: 'Literal',
          value: Number(token.text),
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.STRING:
        this.match(OmniscriptParser.STRING);
        return {
          type: 'Expression',
          kind: 'Literal',
          value: token.text.slice(1, -1), // Remove quotes
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.TRUE:
      case OmniscriptParser.FALSE:
        this.match(token.type);
        return {
          type: 'Expression',
          kind: 'Literal',
          value: token.type === OmniscriptParser.TRUE,
          line: token.line,
          column: token.column
        };

      case OmniscriptParser.NULL:
        this.match(OmniscriptParser.NULL);
        return {
          type: 'Expression',
          kind: 'Literal',
          value: null,
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
      '-=': 2       // Subtract assign
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
      kind: 'ArrayLiteral',
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
      kind: 'ObjectLiteral',
      properties,
      line: startToken.line,
      column: startToken.column
    };
  }
}
