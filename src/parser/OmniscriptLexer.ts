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
  static readonly MATCH = 4; // Pattern matching keyword
  static readonly CASE = 5;  // Case keyword for pattern matching
  static readonly AS = 6;    // Pattern binding
  static readonly WHEN = 7;  // Pattern guard
  static readonly IS = 8;    // Type testing
  static readonly SOME = 9;  // Optional matching
  static readonly NONE = 10; // Optional matching
  static readonly YIELD = 11; // Generator functions
  static readonly WITH = 12;  // Resource management
  static readonly DO = 13;    // Expression blocks
  static readonly UNLESS = 14; // Inverted if
  static readonly UNTIL = 15;  // Inverted while
  static readonly ABSTRACT = 16; // Abstract classes/methods
  static readonly IMPLEMENTS = 17; // Interface implementation
  static readonly TYPEOF = 18; // Type queries
  static readonly INFER = 19;  // Type inference
}
