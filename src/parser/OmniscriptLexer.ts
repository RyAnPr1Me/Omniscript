import { Lexer } from 'antlr4';

export default class OmniscriptLexer extends Lexer {
  constructor(input: any) {
    super(input);
  }

  // Remove unsupported emitToken method
  // Use the default emit method provided by the Lexer class

  // Remove unsupported recover method
  // Use the default error handling provided by the Lexer class

  // Add support for additional tokens
  static readonly NEWLINE = 1;
  static readonly INDENT = 2;
  static readonly DEDENT = 3;
  // ...existing tokens...
}
