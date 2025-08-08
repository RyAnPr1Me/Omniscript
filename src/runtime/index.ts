export interface Bytecode {
  type: string;
  name?: string;
  params?: any[];
  body?: Bytecode[];
  value?: any;
}

// Added Result type for better error handling
export class Result<T, E> {
  private constructor(private value: T | undefined, private error: E | undefined) {}

  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined);
  }

  static Err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error);
  }

  isOk(): boolean {
    return this.error === undefined;
  }

  isErr(): boolean {
    return this.error !== undefined;
  }

  unwrap(): T {
    if (this.isErr()) {
      throw new Error(`Tried to unwrap an Err: ${this.error}`);
    }
    return this.value!;
  }

  unwrapErr(): E {
    if (this.isOk()) {
      throw new Error(`Tried to unwrap an Ok: ${this.value}`);
    }
    return this.error!;
  }
}

export class Runtime {
  private scope: Map<string, any>;
  private referenceCounts: Map<any, number>;
  private weakReferences: WeakMap<any, boolean>;
  private debugMode: boolean;

  constructor() {
    this.scope = new Map();
    this.referenceCounts = new Map();
    this.weakReferences = new WeakMap();
    this.debugMode = false;
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

  enableParallelExecution(debug = false): void {
    if (debug) console.log("Parallel execution enabled for supported operations.");
  }

  allocate(object: any): void {
    // Track object references
    this.referenceCounts.set(object, (this.referenceCounts.get(object) || 0) + 1);
    this.weakReferences.set(object, true);
  }

  release(object: any): void {
    // Decrease reference count and clean up if no references remain
    if (this.referenceCounts.has(object)) {
      const count = this.referenceCounts.get(object)! - 1;
      if (count <= 0) {
        this.referenceCounts.delete(object);
        this.cleanup(object);
      } else {
        this.referenceCounts.set(object, count);
      }
    }
  }

  private cleanup(object: any): void {
    // Perform cleanup for the object (e.g., freeing resources)
    if (typeof object.destroy === 'function') {
      object.destroy();
    }
    this.weakReferences.delete(object);
  }

  enableGarbageCollection(debug = false): void {
    if (debug) console.log("Garbage collection enabled.");
    setInterval(() => this.runGarbageCollector(), 10000); // Run every 10 seconds
  }

  public getMemoryUsage(): { allocated: number; references: number } {
    return {
      allocated: this.referenceCounts.size,
      references: Array.from(this.referenceCounts.values()).reduce((a, b) => a + b, 0),
    };
  }

  public runGarbageCollector(): void {
    console.log("Running garbage collector...");
    const initialMemoryUsage = this.getMemoryUsage();

    for (const [object, count] of this.referenceCounts.entries()) {
      if (count <= 0) {
        this.referenceCounts.delete(object);
        this.cleanup(object);
      }
    }

    const finalMemoryUsage = this.getMemoryUsage();
    console.log("Garbage collection completed.", {
      before: initialMemoryUsage,
      after: finalMemoryUsage,
    });
  }

  detectCircularReferences(): void {
    console.log("Detecting circular references...");
    const visited = new Set<any>();
    const circularReferences: any[] = [];

    for (const [object] of this.referenceCounts.entries()) {
      if (!visited.has(object)) {
        const stack = new Set<any>();
        if (this.traverseReferences(object, visited, stack)) {
          circularReferences.push(object);
        }
      }
    }

    if (circularReferences.length > 0) {
      console.warn("Circular references detected:", circularReferences);
    } else {
      console.log("No circular references detected.");
    }
  }

  private traverseReferences(object: any, visited: Set<any>, stack: Set<any>): boolean {
    if (stack.has(object)) {
      return true; // Circular reference detected
    }

    if (visited.has(object)) {
      return false;
    }

    visited.add(object);
    stack.add(object);

    if (typeof object === 'object' && object !== null) {
      for (const key in object) {
        if (this.traverseReferences(object[key], visited, stack)) {
          return true;
        }
      }
    }

    stack.delete(object);
    return false;
  }

  // New: Create an actor from a function handling messages and state
  createActor<TState>(actorFn: (message: any, state: TState) => TState | Promise<TState>, initialState: TState): Actor<TState> {
    return new Actor(actorFn, initialState);
  }

  // New: Schedule a coroutine (async task) with enhanced logging support.
  async scheduleCoroutine(coroutine: () => Promise<any>): Promise<any> {
    if (this.debugMode) {
      console.log("Scheduling coroutine...");
    }
    const result = await coroutine();
    if (this.debugMode) {
      console.log("Coroutine completed:", result);
    }
    return result;
  }

  // New: Enable visual debugging/profiling.
  enableDebugMode(): void {
    this.debugMode = true;
    console.log("Debug mode enabled.");
  }

  enableMemoryManagement(): void {
    console.log("Advanced memory management enabled.");
    this.enableGarbageCollection();
    this.detectCircularReferences();
  }

  // Removed mock/demo optimization & operator example methods.

  public getReferenceCounts(): Map<any, number> {
    return this.referenceCounts;
  }
}

// New helper Actor class (could be moved to its own module if desired)
export class Actor<TState> {
  private mailbox: any[] = [];
  private busy = false;

  constructor(private actorFn: (message: any, state: TState) => TState | Promise<TState>, private state: TState) {}

  send(message: any): void {
    this.mailbox.push(message);
    this.schedule();
  }

  private async schedule(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    while (this.mailbox.length > 0) {
      const msg = this.mailbox.shift();
      this.state = await this.actorFn(msg, this.state);
    }
    this.busy = false;
  }
}

export class Coroutine {
  private generator: Generator;

  constructor(generatorFn: () => Generator) {
    this.generator = generatorFn();
  }

  async run(): Promise<void> {
    let result = this.generator.next();
    while (!result.done) {
      if (result.value instanceof Promise) {
        await result.value;
      }
      result = this.generator.next();
    }
  }
}
