import { Parser } from './parser';
import { Compiler } from './compiler';
import { Runtime } from './runtime';

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
    const ast = this.parser.parse(source);
    const bytecode = this.compiler.compile(ast);
    return this.runtime.execute(bytecode);
  }
}

export { Parser } from './parser';
export { Compiler } from './compiler';
export { Runtime } from './runtime';
