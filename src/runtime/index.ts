import * as llvm from 'llvm-bindings';

export class Runtime {
  private engine: llvm.ExecutionEngine;

  constructor() {
    llvm.initializeNativeTarget();
    llvm.initializeNativeAsmPrinter();
  }

  execute(module: llvm.Module) {
    this.engine = llvm.createExecutionEngineForModule(module);
    const mainFn = module.getFunction("main");
    
    if (mainFn) {
      return this.engine.runFunction(mainFn, []);
    }
    return null;
  }

  async executeAsync(module: llvm.Module) {
    return new Promise((resolve) => {
      resolve(this.execute(module));
    });
  }
}
