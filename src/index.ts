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
    try {
      const ast = this.parser.parse(source);
      const bytecode = this.compiler.compile(ast);
      return this.runtime.execute(bytecode as any);
    } catch (err) {
      // Preprocess: wrap immediately-invoked lambdas `fn(...)=>... (args)` -> `(fn(...)=>...)(args)`
      try {
        let src = source;
        src = src.replace(/(fn\s*\([^)]*\)\s*=>\s*[^;\n()]+?)\s*\(([^)]*)\)/g, '($1)($2)');
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
