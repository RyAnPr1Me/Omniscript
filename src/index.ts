import { Parser } from './parser';
import { Compiler } from './compiler';
import { Runtime } from './runtime';
import { FunctionalParser } from './functional/parser';
import { evaluate as evalFunctional } from './functional/eval';

export class Omniscript {
  private parser: Parser;
  private compiler: Compiler;
  private runtime: Runtime;

  constructor() {
    this.parser = new Parser();
    this.compiler = new Compiler();
    this.runtime = new Runtime();
  }

  async execute(source: string): Promise<any> {
    // Check if source contains functional syntax that ANTLR can't handle properly
    const hasFunctionalSyntax = /fn\s*\([^)]*\)\s*=>/g.test(source) || 
                               /\([^)]*\)\s*=>/g.test(source) ||  // Also detect (args) => syntax
                               /if\s+\w+\s+then\s+/.test(source) ||
                               /match\s+\w+\s*\{/.test(source) ||
                               /\blet\s+\w+\s*=/.test(source) ||  // Also detect let bindings
                               /\bclass\s+\w+\s*\{/.test(source) ||  // Also detect class definitions
                               /\|>/.test(source);  // Also detect pipeline operations
    
    if (hasFunctionalSyntax) {
      // Use functional parser directly for functional syntax
      try {
        let src = source;
        // Convert arrow function syntax to fn syntax, but avoid method definitions
        // Look for patterns like `let x = (args) =>` or `= (args) =>` or start of line `(args) =>`
        src = src.replace(/(^|[=,]\s*)\(([^)]*)\)\s*=>/g, '$1fn($2) =>');
        // More specific regex for immediately invoked lambdas that won't break nested lambdas
        // Only match when the lambda expression is followed by a space and then parentheses
        src = src.replace(/(fn\s*\([^)]*\)\s*=>\s*[^;\n()]+?)\s+\(([^)]*)\)/g, '($1)($2)');
        const fparser = new FunctionalParser();
        const prog = fparser.parse(src);
        const result = evalFunctional(prog);
        return result;
      } catch (e) {
        // Fall through to ANTLR if functional parser fails
      }
    }
    
    try {
      const ast = this.parser.parse(source);
      const bytecode = this.compiler.compile(ast);
      return this.runtime.execute(bytecode as any);
    } catch (err) {
      // Preprocess: wrap immediately-invoked lambdas `fn(...)=>... (args)` -> `(fn(...)=>...)(args)`
      try {
        let src = source;
        // Convert arrow function syntax to fn syntax, but avoid method definitions
        // Look for patterns like `let x = (args) =>` or `= (args) =>` or start of line `(args) =>`
        src = src.replace(/(^|[=,]\s*)\(([^)]*)\)\s*=>/g, '$1fn($2) =>');
        // More specific regex for immediately invoked lambdas that won't break nested lambdas
        src = src.replace(/(fn\s*\([^)]*\)\s*=>\s*[^;\n()]+?)\s+\(([^)]*)\)/g, '($1)($2)');
        const fparser = new FunctionalParser();
        const prog = fparser.parse(src);
        return evalFunctional(prog);
      } catch (e) {
        // If functional fallback also fails, rethrow original error
        throw err;
      }
    }
  }
}

export { Parser } from './parser';
export { Compiler } from './compiler';
export { Runtime } from './runtime';
