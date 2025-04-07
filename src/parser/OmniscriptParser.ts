import { Parser } from 'antlr4';

export default class OmniscriptParser extends Parser {
  constructor(input: any) {
    super(input);
  }

  program() {
    try {
      return { type: 'Program', body: this.parseStatements() };
    } catch (error) {
      console.error(`Parser Error: ${error.message}`);
      throw error;
    }
  }

  parseStatements() {
    const statements = [];
    while (this._input.LA(1) !== this.EOF) {
      statements.push(this.statement());
    }
    return statements;
  }

  statement() {
    if (this._input.LA(1) === this.VAR) {
      return this.variableDeclaration();
    }
    if (this._input.LA(1) === this.AT) {
      return this.decorator();
    }
    // ...existing code for other statements...
    throw new Error(`Unexpected token: ${this._input.LT(1).text}`);
  }

  variableDeclaration() {
    this.match(this.VAR);
    const name = this.match(this.IDENTIFIER).text;
    let type = null;
    if (this._input.LA(1) === this.COLON) {
      this.match(this.COLON);
      type = this.type();
    }
    let initializer = null;
    if (this._input.LA(1) === this.ASSIGN) {
      this.match(this.ASSIGN);
      initializer = this.expression();
    }
    return { type: 'VariableDeclaration', name, varType: type, initializer };
  }

  decorator() {
    this.match(this.AT);
    const name = this.qualifiedName();
    let args = null;
    if (this._input.LA(1) === this.LPAREN) {
      this.match(this.LPAREN);
      args = this.argumentList();
      this.match(this.RPAREN);
    }
    return { type: 'Decorator', name, arguments: args };
  }

  qualifiedName() {
    const parts = [this.match(this.IDENTIFIER).text];
    while (this._input.LA(1) === this.DOT) {
      this.match(this.DOT);
      parts.push(this.match(this.IDENTIFIER).text);
    }
    return parts.join('.');
  }

  argumentList() {
    const args = [];
    do {
      args.push(this.expression());
      if (this._input.LA(1) === this.COMMA) {
        this.match(this.COMMA);
      } else {
        break;
      }
    } while (true);
    return args;
  }

  type() {
    if (this._input.LA(1) === this.IDENTIFIER) {
      return this.match(this.IDENTIFIER).text;
    }
    throw new Error(`Invalid type: ${this._input.LT(1).text}`);
  }

  expression() {
    if (this._input.LA(1) === this.LPAREN) {
      this.match(this.LPAREN);
      const expr = this.expression();
      this.match(this.RPAREN);
      return expr;
    }
    // ...existing code for other expressions...
  }
}
