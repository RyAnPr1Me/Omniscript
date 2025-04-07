import { Parser } from 'antlr4';

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

  constructor(input: any) {
    super(input);
  }

  program() {
    try {
      return { type: 'Program', body: this.parseStatements() };
    } catch (error) {
      const err = error as Error; // Explicitly cast to Error
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
    if (this._input.LA(1) === OmniscriptParser.VAR) {
      return this.variableDeclaration();
    }
    if (this._input.LA(1) === OmniscriptParser.AT) {
      return this.decorator();
    }
    // ...existing code for other statements...
    throw new Error(`Unexpected token: ${this._input.LT(1).text}`);
  }

  variableDeclaration() {
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
    return { type: 'VariableDeclaration', name, varType: type, initializer };
  }

  decorator() {
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
      } else {
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
    if (this._input.LA(1) === OmniscriptParser.LPAREN) {
      this.match(OmniscriptParser.LPAREN);
      const expr = this.expression();
      this.match(OmniscriptParser.RPAREN);
      return expr;
    }
    // ...existing code for other expressions...
  }
}
