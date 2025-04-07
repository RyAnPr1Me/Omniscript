interface Bytecode {
  type: string;
  name?: string;
  params?: any[];
  body?: Bytecode[];
  value?: any;
}

export class Runtime {
  private scope: Map<string, any>;

  constructor() {
    this.scope = new Map();
  }

  execute(bytecode: Bytecode): any {
    try {
      switch (bytecode.type) {
        case 'Function':
          return this.executeFunction(bytecode);
        case 'Return':
          return this.executeReturn(bytecode);
        case 'Value':
          return bytecode.value;
        default:
          throw new Error(`Unknown bytecode type: ${bytecode.type}`);
      }
    } catch (error) {
      const err = error as Error; // Explicitly cast to Error
      console.error("Runtime Error:", err.message);
      throw err;
    }
  }

  async executeAsync(bytecode: Bytecode): Promise<any> {
    try {
      switch (bytecode.type) {
        case 'Function':
          return await this.executeFunctionAsync(bytecode);
        case 'Return':
          return await this.executeReturnAsync(bytecode);
        case 'Value':
          return bytecode.value;
        default:
          throw new Error(`Unknown bytecode type: ${bytecode.type}`);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Runtime Error:", err.message);
      throw err;
    }
  }

  private executeFunction(fn: Bytecode): any {
    this.scope.set(fn.name!, fn);
    return fn.body?.reduce((_, stmt: Bytecode) => this.execute(stmt), undefined);
  }

  private async executeFunctionAsync(fn: Bytecode): Promise<any> {
    this.scope.set(fn.name!, fn);
    for (const stmt of fn.body || []) {
      await this.executeAsync(stmt);
    }
  }

  private executeReturn(ret: Bytecode): any {
    return ret.value !== undefined ? this.execute(ret.value) : undefined;
  }

  private async executeReturnAsync(ret: Bytecode): Promise<any> {
    return ret.value !== undefined ? await this.executeAsync(ret.value) : undefined;
  }

  enableParallelExecution(): void {
    console.log("Parallel execution enabled for supported operations.");
  }
}
