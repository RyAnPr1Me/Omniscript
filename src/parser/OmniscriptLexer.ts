import { Lexer } from 'antlr4';

export default class OmniscriptLexer extends Lexer {
  constructor(input: any) {
    super(input);
  }

  emitToken(type: number, text: string): void {
    this.emit({
      type,
      text,
      line: this._tokenStartLine,
      column: this._tokenStartColumn,
    });
  }

  recover(error: any): void {
    console.error(`Lexer Error at line ${this._tokenStartLine}, column ${this._tokenStartColumn}: ${error.message}`);
    super.recover(error);
  }

  // Add support for nested comments
  static readonly NESTED_COMMENT_START = 1;
  static readonly NESTED_COMMENT_END = 2;

  // Add support for string interpolation
  static readonly TEMPLATE_STRING_START = 3;
  static readonly TEMPLATE_STRING_CONTENT = 4;
  static readonly TEMPLATE_STRING_END = 5;

  // Add support for additional tokens
  static readonly NEWLINE = 6;
  static readonly INDENT = 7;
  static readonly DEDENT = 8;
  // ...existing tokens...
}
