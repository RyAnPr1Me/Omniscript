"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const antlr4_1 = require("antlr4");
const OmniscriptLexer_1 = __importDefault(require("./OmniscriptLexer"));
const OmniscriptParser_1 = __importDefault(require("./OmniscriptParser"));
class Parser {
    parse(source) {
        const inputStream = antlr4_1.CharStreams.fromString(source);
        const lexer = new OmniscriptLexer_1.default(inputStream);
        const tokenStream = new antlr4_1.CommonTokenStream(lexer);
        const parser = new OmniscriptParser_1.default(tokenStream);
        return parser.program();
    }
    parseExpression(expr) {
        const inputStream = antlr4_1.CharStreams.fromString(expr);
        const lexer = new OmniscriptLexer_1.default(inputStream);
        const tokenStream = new antlr4_1.CommonTokenStream(lexer);
        const parser = new OmniscriptParser_1.default(tokenStream);
        return parser.expression();
    }
}
exports.Parser = Parser;
