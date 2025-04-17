import { Lexer, CharStream } from 'antlr4';
import { OmniscriptError } from '../errors';

export default class OmniscriptLexer extends Lexer {
  static readonly EOF = -1;

  public _tokenStartLine: number = 1;
  public _tokenStartColumn: number = 0;
  public _tokenStartCharIndex: number = 0;

  constructor(input: CharStream) {
    if (!input) {
      throw new OmniscriptError('No input provided to lexer');
    }
    super(input);
  }

  nextToken(): any {
    try {
      // Skip whitespace
      while (this._input && this._input.LA(1) <= 32 && this._input.LA(1) !== -1) {
        this._input.consume();
      }

      // Update token start position before consuming
      // CharStream does not have line/column, so default to 1/0
      this._tokenStartLine = 1;
      this._tokenStartColumn = 0;
      this._tokenStartCharIndex = this._input ? this._input.index : 0;

      if (!this._input || this._input.LA(1) === -1) {
        return this.makeToken(OmniscriptLexer.EOF, "<EOF>");
      }

      const token = super.nextToken();
      if (!token) {
        throw new OmniscriptError('Failed to create token');
      }
      return token;
    } catch (error) {
      if (error instanceof OmniscriptError) {
        throw error;
      }
      throw new OmniscriptError(`Lexer error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private makeToken(type: number, text: string): any {
    return {
      type,
      text,
      channel: 0,
      line: this._tokenStartLine,
      column: this._tokenStartColumn,
      start: this._tokenStartCharIndex,
      stop: this._input ? this._input.index - 1 : 0,
      tokenIndex: -1,
      source: {
        sourceName: '',
        inputStream: this._input
      }
    };
  }

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
  static readonly TRY = 20;      // Structured error handling
  static readonly CATCH = 21;    // Structured error handling
  static readonly FINALLY = 22;  // Structured error handling
  static readonly RESULT = 23;   // Functional-style error handling
  static readonly OK = 24;       // Functional-style error handling
  static readonly ERROR = 25;    // Functional-style error handling
  static readonly REACT_COMPONENT = 26; // React component keyword
  static readonly JSX = 27;             // JSX syntax
  static readonly DJANGO_TEMPLATE = 28; // Django template syntax
  static readonly DJANGO_BLOCK = 29;    // Django block keyword
  static readonly DJANGO_VARIABLE = 30; // Django variable syntax
}
