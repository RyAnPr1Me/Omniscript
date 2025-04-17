import { CharStreams, CommonTokenStream } from 'antlr4';
import OmniscriptLexer from './OmniscriptLexer';
import OmniscriptParser from './OmniscriptParser';
import { Expression, ExpressionKind, Operator, ASTNode } from './types';
import { OmniscriptError } from '../errors';

export class Parser {
  parse(source: string) {
    if (!source || typeof source !== 'string') {
      throw new Error('Invalid source input');
    }

    try {
      const inputStream = CharStreams.fromString(source);
      const lexer = new OmniscriptLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new OmniscriptParser(tokenStream);
      
      // Set error handling strategy
      parser.removeErrorListeners();
      parser.addErrorListener({
        syntaxError: (recognizer: any, offendingSymbol: any, line: number, column: number, msg: string) => {
          throw new Error(`${msg} at line ${line}:${column}`);
        }
      });

      return parser.program();
    } catch (error) {
      throw new Error(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  parseExpression(expr: Expression | string): Expression {
    if (typeof expr === 'string') {
      const inputStream = CharStreams.fromString(expr);
      const lexer = new OmniscriptLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new OmniscriptParser(tokenStream);
      return parser.expression();
    }
    return expr;
  }

  parsePatternMatching(node: ASTNode): any {
    if (node.type === 'MatchExpression') {
      return {
        type: 'Match',
        subject: node.subject ? this.parseExpression(node.subject) : null,
        arms: (node.arms || []).map((arm: any) => this.parseMatchArm(arm))
      };
    }
    throw new Error(`Unsupported node type for pattern matching: ${node.type}`);
  }

  private parseMatchArm(arm: any): any {
    return {
      pattern: this.parsePattern(arm.pattern),
      expression: this.parseExpression(arm.expression)
    };
  }

  private parsePattern(pattern: any): any {
    switch (pattern.kind) {
      case 'literal':
        return { type: 'LiteralPattern', value: pattern.value };
      case 'object':
        return {
          type: 'ObjectPattern',
          properties: pattern.properties.map((prop: any) => ({
            key: prop.key,
            value: this.parsePattern(prop.value)
          }))
        };
      case 'array':
        return {
          type: 'ArrayPattern',
          elements: pattern.elements.map((el: any) => this.parsePattern(el))
        };
      case 'wildcard':
        return { type: 'WildcardPattern' };
      case 'variable':
        return { type: 'VariablePattern', name: pattern.name };
      default:
        throw new Error(`Unknown pattern kind: ${pattern.kind}`);
    }
  }

  private parseMatchExpression(node: ASTNode): any {
    return {
      type: 'MatchExpression',
      subject: node.subject ? this.parseExpression(node.subject) : null,
      arms: (node.arms || []).map((arm: any) => this.parseMatchArm(arm))
    };
  }
}
