import { Parser } from './parser';
import { Compiler, CompilerOptions } from './compiler';
import { Runtime } from './runtime';
import { FunctionalParser } from './functional/parser';
import { evaluate as evalFunctional } from './functional/eval';

export interface OmniscriptOptions {
  compiler?: CompilerOptions;
  fastMode?: boolean;
}

export class Omniscript {
  private parser: Parser;
  private compiler: Compiler;
  private runtime: Runtime;

  constructor(options: OmniscriptOptions = {}) {
    this.parser = new Parser();
    
    // Configure compiler with performance optimizations
    const compilerOptions: CompilerOptions = {
      fastMode: options.fastMode || false,
      skipTypeChecking: options.fastMode || false,
      skipOptimization: false,
      enableCaching: true,
      useAOT: options.fastMode || false,
      aotOptions: {
        target: 'bytecode',
        optimizationLevel: options.fastMode ? 1 : 2,
        enableInlining: true
      },
      ...options.compiler
    };
    
    this.compiler = new Compiler(compilerOptions);
    this.runtime = new Runtime();
  }

  async execute(source: string): Promise<any> {
    // Check if source contains functional syntax that ANTLR can't handle properly
    const hasFunctionalSyntax = /fn\s*\([^)]*\)\s*=>/g.test(source) || 
                               /\([^)]*\)\s*=>/g.test(source) ||  // Also detect (args) => syntax
                               /if\s+\w+\s+then\s+/.test(source) ||
                               // /match\s+\w+\s*\{/.test(source) ||  // Temporarily disable this to test ANTLR
                               /\bvar\s+\w+\s*=/.test(source) ||  // Also detect var bindings
                               /\bdef\s+\w+\s*=/.test(source) ||  // Also detect def bindings
                               /\bobject\s+\w+\s*\{/.test(source) ||  // Also detect object definitions
                               /\bclass\s+\w+\s*\{/.test(source) ||  // Also detect class definitions
                               /\bimport\s+\{/.test(source) ||  // Also detect import statements
                               /\\\|>/.test(source) ||  // Also detect pipeline operations
                               /\b(curry|memoize|just|nothing|left|right|head|tail|cons|flip|add|inc)\s*\(/.test(source) || // Detect functional builtins
                               /\)\s*\(/.test(source); // Detect curried function calls like add(2)(3)
    
    if (hasFunctionalSyntax) {
      // Use functional parser directly for functional syntax
      try {
        let src = source;
        // Convert arrow function syntax to fn syntax, but avoid method definitions
        // Look for patterns like `var x = (args) =>` or `= (args) =>` or start of line `(args) =>` or `prop: (args) =>`
        src = src.replace(/(^|[=,:]\s*)\(([^)]*)\)\s*=>/g, '$1fn($2) =>');
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
      const result = this.runtime.execute(bytecode as any);
      return result;
    } catch (err) {
      // Preprocess: wrap immediately-invoked lambdas `fn(...)=>... (args)` -> `(fn(...)=>...)(args)`
      try {
        let src = source;
        // Convert arrow function syntax to fn syntax, but avoid method definitions
        // Look for patterns like `var x = (args) =>` or `= (args) =>` or start of line `(args) =>` or `prop: (args) =>`
        src = src.replace(/(^|[=,:]\s*)\(([^)]*)\)\s*=>/g, '$1fn($2) =>');
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
export { Compiler, CompilerOptions } from './compiler';
export { AOTCompiler, AOTCompilerOptions } from './compiler/aot';
export { Runtime } from './runtime';
export { SecurityManager, SandboxedEnvironment, SecurityError, ResourceMonitor } from './security';
export { TypeScriptDocGenerator, MarkdownDocGenerator } from './docs-generator';
// Temporarily comment out SSR export to fix CLI
// export { SSRRenderer, SSRBuilder } from './ssr';
