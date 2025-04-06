import { CharStreams, CommonTokenStream } from 'antlr4';
import OmniscriptLexer from './OmniscriptLexer';
import OmniscriptParser from './OmniscriptParser';

export class Parser {
  parse(source: string) {
    const inputStream = CharStreams.fromString(source);
    const lexer = new OmniscriptLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new OmniscriptParser(tokenStream);
    
    return parser.program();
  }

  parseExpression(expr: string) {
    const inputStream = CharStreams.fromString(expr);
    const lexer = new OmniscriptLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new OmniscriptParser(tokenStream);
    
    return parser.expression();
  }
}
