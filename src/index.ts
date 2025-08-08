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
      return this.runtime.execute(bytecode);
    } catch (err) {
      const fparser = new FunctionalParser();
      const prog = fparser.parse(source);
      return evalFunctional(prog);
    }
  }
}

export { Parser } from './parser';
export { Compiler } from './compiler';
export { Runtime } from './runtime';
