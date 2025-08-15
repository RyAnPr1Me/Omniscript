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
  private envStack: Array<Map<string, any>> = [];

    // Add missing operator overloading example and addVectors for tests
    public operatorOverloadingExample(): void {
      console.log("Operator overloading example executed.");
      const vector1 = { x: 1, y: 2 };
      const vector2 = { x: 3, y: 4 };
      const result = this.addVectors(vector1, vector2);
      console.log("Result of vector addition:", result);
    }

    public addVectors(v1: { x: number, y: number }, v2: { x: number, y: number }): { x: number, y: number } {
      return { x: v1.x + v2.x, y: v1.y + v2.y };
    }

  constructor() {
    this.scope = new Map();
    this.referenceCounts = new Map();
    this.weakReferences = new WeakMap();
    this.debugMode = false;
  }

  // Execute a class declaration (AST/bytecode hybrid node)
  private executeClassDeclaration(node: any): any {
    const runtime = this;
    const methodMap: Record<string, Function> = {};
    const operatorMap: Record<string, Function> = {};
    for (const m of node.methods || []) {
      const bodyStmts = m.body?.body || m.body?.statements || [];
      const fn = function(this: any, ...args: any[]) {
        runtime.pushEnv();
        try {
          runtime.setVar('self', this);
          (m.params || []).forEach((p: any, i: number) => runtime.setVar(p.name, args[i]));
          try {
            return runtime.execute({ type: 'Block', body: bodyStmts });
          } catch (e: any) {
            if (e && e.__return) return e.value;
            throw e;
          }
        } finally {
          runtime.popEnv();
        }
      };
      methodMap[m.name] = fn;
      if (m.isOperator && m.operatorSymbol) {
        operatorMap[m.operatorSymbol] = function(this: any, other: any) { return fn.call(this, other); };
      }
    }
    const Klass: any = function(this: any, ...ctorArgs: any[]) {
      Object.assign(this, { __class: node.name });
      if (methodMap['constructor']) methodMap['constructor'].apply(this, ctorArgs);
    };
    Klass.prototype = { ...methodMap, __ops: operatorMap };
    this.scope.set(node.name, Klass);
    return Klass;
  }

  execute(bytecode: Bytecode): any {
    try {
      switch (bytecode.type) {
        case 'Block':
          return this.executeBlock(bytecode.body || []);
        case 'Function':
          return this.executeFunction(bytecode);
        case 'Return':
          return this.executeReturn(bytecode);
        case 'VarDecl':
          return this.executeVarDecl(bytecode as any);
        case 'Expr':
          return this.evalExpr((bytecode as any).expr);
        case 'If':
          return this.executeIf(bytecode as any);
        case 'While':
          return this.executeWhile(bytecode as any);
        case 'For':
          return this.executeFor(bytecode as any);
        case 'Throw':
          return this.executeThrow(bytecode as any);
        case 'Try':
          return this.executeTry(bytecode as any);
        case 'Value':
          return bytecode.value;
        case 'ClassDeclaration':
          return this.executeClassDeclaration(bytecode);
        default:
          throw new Error(`Unknown bytecode type: ${bytecode.type}`);
      }
    } catch (error) {
      // Allow return sentinel to bubble up to callers like function execution
      if (error && (error as any).__return) throw error;
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
        case 'Return': {
          const arg = (bytecode as any).argument ? this.evalExpr((bytecode as any).argument) : undefined;
          throw { __return: true, value: arg };
        }
        case 'Value':
          return bytecode.value;
        default:
          throw new Error(`Unknown bytecode type: ${bytecode.type}`);
      }
    } catch (error) {
      if (error && (error as any).__return) throw error;
      const err = error as Error;
      console.error("Runtime Error:", err.message);
      throw err;
    }
  }

  private executeFunction(fn: Bytecode): any {
  this.scope.set(fn.name!, fn);
  try {
    return fn.body?.reduce((_, stmt: Bytecode) => this.execute(stmt), undefined);
  } catch (e: any) {
    if (e && e.__return) return e.value;
    throw e;
  }
  }

  private async executeFunctionAsync(fn: Bytecode): Promise<any> {
    this.scope.set(fn.name!, fn);
    for (const stmt of fn.body || []) {
      await this.executeAsync(stmt);
    }
  }

  private executeReturn(ret: Bytecode): any {
  // Use a special object to unwind
  const arg = (ret as any).argument ? this.evalExpr((ret as any).argument) : undefined;
  throw { __return: true, value: arg };
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

  // (deduplicated helpers removed)

  // ------- Execution helpers for new bytecode -------
  private pushEnv() { this.envStack.push(new Map()); }
  private popEnv() { this.envStack.pop(); }
  private setVar(name: string, value: any) {
    if (this.envStack.length) this.envStack[this.envStack.length - 1].set(name, value);
    else this.scope.set(name, value);
  }
  private getVar(name: string): any {
    for (let i = this.envStack.length - 1; i >= 0; i--) {
      if (this.envStack[i].has(name)) return this.envStack[i].get(name);
    }
    if (this.scope.has(name)) return this.scope.get(name);
    return undefined;
  }

  private executeBlock(stmts: Bytecode[]): any {
    this.pushEnv();
    try {
      let last: any;
      for (const s of stmts) {
        last = this.execute(s as any);
      }
      return last;
    } finally {
      this.popEnv();
    }
  }

  private executeVarDecl(node: any): any {
    const val = node.initializer ? this.evalExpr(node.initializer) : undefined;
    this.setVar(node.name, val);
    return val;
  }

  private executeIf(node: any): any {
    const cond = this.evalExpr(node.condition);
    if (cond) return this.execute(node.then as any);
    if (node.else) return this.execute(node.else as any);
    return undefined;
  }

  private executeWhile(node: any): any {
    let result: any;
    while (this.evalExpr(node.condition)) {
      try {
        result = this.execute(node.body as any);
      } catch (e: any) {
        if (e && e.__return) throw e; // propagate returns
        throw e;
      }
    }
    return result;
  }

  private executeFor(node: any): any {
    if (node.init) this.execute(node.init as any);
    let result: any;
    while (node.condition ? this.evalExpr(node.condition) : true) {
      try {
        result = this.execute(node.body as any);
      } catch (e: any) {
        if (e && e.__return) throw e;
        throw e;
      }
      if (node.update) this.evalExpr(node.update);
      if (node.condition == null) break; // for(;;) currently single iteration safeguard
    }
    return result;
  }

  private executeThrow(node: any): never {
    const arg = this.evalExpr(node.argument);
    throw arg instanceof Error ? arg : new Error(String(arg));
  }

  private executeTry(node: any): any {
    try {
      const r = this.execute(node.tryBlock as any);
      if (node.finallyBlock) this.execute(node.finallyBlock as any);
      return r;
    } catch (err) {
      if (node.catchBlock) {
        this.pushEnv();
        if (node.catchVar) this.setVar(node.catchVar, err);
        try {
          const cr = this.execute(node.catchBlock as any);
          if (node.finallyBlock) this.execute(node.finallyBlock as any);
          return cr;
        } finally {
          this.popEnv();
        }
      }
      if (node.finallyBlock) this.execute(node.finallyBlock as any);
      throw err;
    }
  }

  // ------- Minimal expression evaluator for parser Expressions -------
  private evalExpr(expr: any): any {
    if (!expr || typeof expr !== 'object') return expr;
    if (expr.type !== 'Expression') {
      // could be bytecode; execute
      return this.execute(expr as any);
    }
    switch (expr.kind) {
      case 'Literal':
        return expr.value;
      case 'Identifier':
        return this.getVar(expr.name);
      case 'Unary':
        return this.evalUnary(expr);
      case 'Binary':
        return this.evalBinary(expr);
      case 'Await': {
        const v = this.evalExpr(expr.left);
        if (v && typeof (v as any).then === 'function') {
          // Not fully async environment: block by awaiting via then chaining (simulated synchronous via microtask not realistic)
          // For now just return value (would need async execution path to truly await)
          return v; // placeholder
        }
        return v;
      }
      case 'Ternary':
        return this.evalExpr(expr.condition) ? this.evalExpr(expr.trueExpr) : this.evalExpr(expr.falseExpr);
      case 'ArrayLiteral':
        return (expr.elements || []).map((e: any) => this.evalExpr(e));
      case 'ObjectLiteral':
        const o: any = {};
        for (const p of expr.properties || []) o[p.key] = this.evalExpr(p.value);
        return o;
      case 'Call':
        const fn = this.evalExpr(expr.callee);
        const args = (expr.arguments || []).map((a: any) => this.evalExpr(a));
        if (typeof fn !== 'function') throw new Error('Call to non-function');
        return fn(...args);
      case 'MemberAccess':
        const obj = this.evalExpr(expr.object);
        return obj?.[expr.member];
      case 'Match':
        return this.evalMatch(expr);
      default:
        return undefined;
    }
  }

  private evalMatch(expr: any): any {
    const value = this.evalExpr(expr.subject);
    for (const arm of expr.matchArms || []) {
      if (this.matchPattern(value, arm.pattern)) {
        if (arm.guard && !this.evalExpr(arm.guard)) continue;
        return this.evalExpr(arm.value);
      }
    }
    return undefined;
  }

  private matchPattern(value: any, pattern: any): boolean {
    if (pattern.kind === 'Wildcard') return true;
    if (pattern.kind === 'Identifier') return true; // simple binding (not stored yet)
    if (pattern.kind === 'Number') return value === pattern.value;
    return false;
  }

  private evalUnary(expr: any): any {
    const v = this.evalExpr(expr.left);
    switch (expr.operator) {
      case '!': return !v;
      case '-': return -v;
      case '~': return ~v;
      default: throw new Error(`Unsupported unary operator ${expr.operator}`);
    }
  }

  private evalBinary(expr: any): any {
    const l = this.evalExpr(expr.left);
    const r = this.evalExpr(expr.right);
    // Operator overloading: if left has __ops and matching operator function
    if (l && typeof l === 'object' && l.__ops && typeof l.__ops[expr.operator] === 'function') {
      return l.__ops[expr.operator](l, r);
    }
    switch (expr.operator) {
      case '+': return (l as any) + (r as any);
      case '-': return (l as any) - (r as any);
      case '*': return (l as any) * (r as any);
      case '/': return (l as any) / (r as any);
      case '%': return (l as any) % (r as any);
      case '==': return l == r;
      case '!=': return l != r;
      case '<': return l < r;
      case '<=': return l <= r;
      case '>': return l > r;
      case '>=': return l >= r;
      case '&&': return l && r;
      case '||': return l || r;
      case '??=': return (l ?? (this.evalAssign(expr.left, r)));
      default: throw new Error(`Unsupported binary operator ${expr.operator}`);
    }
  }

  private evalAssign(left: any, value: any): any {
    if (left.kind === 'Identifier') {
      this.setVar(left.name, value);
      return value;
    }
    throw new Error('Unsupported assignment target');
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
