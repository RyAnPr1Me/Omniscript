"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4_1 = require("antlr4");
class OmniscriptLexer extends antlr4_1.Lexer {
    constructor(input) {
        super(input);
    }
}
// Remove unsupported emitToken method
// Use the default emit method provided by the Lexer class
// Remove unsupported recover method
// Use the default error handling provided by the Lexer class
// Add support for additional tokens
OmniscriptLexer.NEWLINE = 1;
OmniscriptLexer.INDENT = 2;
OmniscriptLexer.DEDENT = 3;
OmniscriptLexer.MATCH = 4; // Pattern matching keyword
OmniscriptLexer.CASE = 5; // Case keyword for pattern matching
OmniscriptLexer.AS = 6; // Pattern binding
OmniscriptLexer.WHEN = 7; // Pattern guard
OmniscriptLexer.IS = 8; // Type testing
OmniscriptLexer.SOME = 9; // Optional matching
OmniscriptLexer.NONE = 10; // Optional matching
OmniscriptLexer.YIELD = 11; // Generator functions
OmniscriptLexer.WITH = 12; // Resource management
OmniscriptLexer.DO = 13; // Expression blocks
OmniscriptLexer.UNLESS = 14; // Inverted if
OmniscriptLexer.UNTIL = 15; // Inverted while
OmniscriptLexer.ABSTRACT = 16; // Abstract classes/methods
OmniscriptLexer.IMPLEMENTS = 17; // Interface implementation
OmniscriptLexer.TYPEOF = 18; // Type queries
OmniscriptLexer.INFER = 19; // Type inference
OmniscriptLexer.TRY = 20; // Structured error handling
OmniscriptLexer.CATCH = 21; // Structured error handling
OmniscriptLexer.FINALLY = 22; // Structured error handling
OmniscriptLexer.RESULT = 23; // Functional-style error handling
OmniscriptLexer.OK = 24; // Functional-style error handling
OmniscriptLexer.ERROR = 25; // Functional-style error handling
OmniscriptLexer.REACT_COMPONENT = 26; // React component keyword
OmniscriptLexer.JSX = 27; // JSX syntax
OmniscriptLexer.DJANGO_TEMPLATE = 28; // Django template syntax
OmniscriptLexer.DJANGO_BLOCK = 29; // Django block keyword
OmniscriptLexer.DJANGO_VARIABLE = 30; // Django variable syntax
exports.default = OmniscriptLexer;
