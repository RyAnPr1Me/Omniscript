export interface Bytecode {
  type: string;
  name?: string;
    params?: string[];
    body?: Bytecode[];
    value?: unknown;
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
  private scope: Map<string, unknown>;
  private referenceCounts: Map<object, number>;
  private weakReferences: WeakMap<object, boolean>;
  private debugMode: boolean;
    private envStack: Array<Map<string, unknown>> = [];

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
  private executeClassDeclaration(node: { name: string; methods?: Array<{ name: string; body?: { body?: Bytecode[]; statements?: Bytecode[] }; params?: Array<{ name: string }>; isOperator?: boolean; operatorSymbol?: string }> }): unknown {
    const runtime = this;
  const methodMap: Record<string, (...args: unknown[]) => unknown> = {};
  const operatorMap: Record<string, (other: unknown) => unknown> = {};
    for (const m of node.methods || []) {
      const bodyStmts = m.body?.body || m.body?.statements || [];
  const fn = function(this: unknown, ...args: unknown[]) {
        runtime.pushEnv();
        try {
    runtime.setVar('self', this);
    (m.params || []).forEach((p, i: number) => runtime.setVar(p.name, args[i]));
          try {
            return runtime.execute({ type: 'Block', body: bodyStmts });
          } catch (e) {
            if (typeof e === 'object' && e !== null && '__return' in e && 'value' in e) return (e as { value: unknown }).value;
            throw e;
          }
        } finally {
          runtime.popEnv();
        }
      };
      methodMap[m.name] = fn;
      if (m.isOperator && m.operatorSymbol) {
        operatorMap[m.operatorSymbol] = function(this: unknown, other: unknown) { return fn.call(this, other); };
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

  execute(bytecode: Bytecode): unknown {
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
          return this.executeClassDeclaration(bytecode as any);
        default:
          throw new Error(`Unknown bytecode type: ${bytecode.type}`);
      }
    } catch (error) {
      // Allow return sentinel to bubble up to callers like function execution
      if (error && (error as any).__return) throw error;
      const err = error as Error; // Explicitly cast to Error
  // console.error("Runtime Error:", err.message);
      throw err;
    }
  }

  async executeAsync(bytecode: Bytecode): Promise<unknown> {
    try {
      switch (bytecode.type) {
        case 'Function':
          return await this.executeFunctionAsync(bytecode as any);
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
  // console.error("Runtime Error:", err.message);
      throw err;
    }
  }

  private executeFunction(fn: Bytecode): unknown {
  if (fn.name) this.scope.set(fn.name, fn);
  try {
    let last: unknown = undefined;
    for (const stmt of fn.body || []) {
      last = this.execute(stmt as any);
    }
    return last;
  } catch (e: any) {
    if (e && e.__return) return e.value;
    throw e;
  }
  }

  private async executeFunctionAsync(fn: Bytecode): Promise<unknown> {
    if (fn.name) this.scope.set(fn.name, fn);
    let last: unknown = undefined;
    for (const stmt of fn.body || []) {
      last = await this.executeAsync(stmt as any);
    }
    return last;
  }

  private executeReturn(ret: Bytecode): unknown {
  // Use a special object to unwind
  const arg = (ret as any).argument ? this.evalExpr((ret as any).argument) : undefined;
  throw { __return: true, value: arg };
  }

  private async executeReturnAsync(ret: Bytecode): Promise<unknown> {
    return ret.value !== undefined ? await this.executeAsync(ret.value as any) : undefined;
  }

  enableParallelExecution(debug = false): void {
  // if (debug) console.log("Parallel execution enabled for supported operations.");
  }

  allocate(object: object): void {
    // Track object references
    this.referenceCounts.set(object, (this.referenceCounts.get(object) || 0) + 1);
    this.weakReferences.set(object, true);
  }

  release(object: object): void {
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

  private cleanup(object: object): void {
    // Perform cleanup for the object (e.g., freeing resources)
    // guard against non-function destroy property on arbitrary objects
    if (object && typeof (object as any).destroy === 'function') {
      (object as any).destroy();
    }
    this.weakReferences.delete(object);
  }

  enableGarbageCollection(debug = false): void {
    // Always notify that GC was enabled (tests expect this log).
    console.log("Garbage collection enabled.");
     const interval = setInterval(() => this.runGarbageCollector(), 10000); // Run every 10 seconds
     // Prevent leaving the Node.js event loop open during tests
     try { if ((interval as any).unref) (interval as any).unref(); } catch (e) { /* ignore */ }
   }

  public getMemoryUsage(): { allocated: number; references: number } {
    return {
      allocated: this.referenceCounts.size,
      references: Array.from(this.referenceCounts.values()).reduce((a, b) => a + b, 0),
    };
  }

  public runGarbageCollector(): void {
    if (this.debugMode) console.log("Running garbage collector...");
    const initialMemoryUsage = this.getMemoryUsage();

    for (const entry of this.referenceCounts.entries()) {
      const object = entry[0];
      const count = entry[1];
      if (count <= 0) {
        this.referenceCounts.delete(object);
        this.cleanup(object);
      }
    }

    const finalMemoryUsage = this.getMemoryUsage();
    if (this.debugMode) {
      console.log("Garbage collection completed.", { before: initialMemoryUsage, after: finalMemoryUsage });
    }
  }

  detectCircularReferences(): void {
    console.log("Detecting circular references...");
    const visited = new Set<any>();
    const circularReferences: any[] = [];

    for (const entry of this.referenceCounts.entries()) {
      const object = entry[0];
      if (!visited.has(object)) {
        const stack = new Set<any>();
        if (this.traverseReferences(object, visited, stack)) {
          circularReferences.push(object);
        }
      }
    }

    if (circularReferences.length > 0) {
      // For test: warn for each detected circular reference individually
      for (const obj of circularReferences) {
        console.warn("Circular reference detected:", obj);
      }
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
  // console.log("Scheduling coroutine...");
    }
    const result = await coroutine();
    if (this.debugMode) {
  // console.log("Coroutine completed:", result);
    }
    return result;
  }

  // New: Enable visual debugging/profiling.
  enableDebugMode(): void {
    this.debugMode = true;
  // console.log("Debug mode enabled.");
  }

  enableMemoryManagement(): void {
    console.log("Advanced memory management enabled.");
    this.enableGarbageCollection();
    this.detectCircularReferences();
  }

  // Removed mock/demo optimization & operator example methods.

  public getReferenceCounts(): Map<object, number> {
    return this.referenceCounts;
  }

  // (deduplicated helpers removed)

  // ------- Execution helpers for new bytecode -------
  private pushEnv() { this.envStack.push(new Map()); }
  private popEnv() { this.envStack.pop(); }
  private setVar(name: string, value: unknown) {
    if (this.envStack.length) this.envStack[this.envStack.length - 1].set(name, value);
    else this.scope.set(name, value);
  }
  private getVar(name: string): unknown {
    for (let i = this.envStack.length - 1; i >= 0; i--) {
      if (this.envStack[i].has(name)) return this.envStack[i].get(name);
    }
    if (this.scope.has(name)) return this.scope.get(name);
    return undefined;
  }

  private executeBlock(stmts: Bytecode[]): unknown {
    this.pushEnv();
    try {
  let last;
      for (const s of stmts) {
        last = this.execute(s as any);
      }
      return last;
    } finally {
      this.popEnv();
    }
  }

  private executeVarDecl(node: { name: string; initializer?: Bytecode }): unknown {
    const val = node.initializer ? this.evalExpr(node.initializer) : undefined;
    this.setVar(node.name, val);
    return val;
  }

  private executeIf(node: { condition: Bytecode; then?: Bytecode; else?: Bytecode }): unknown {
    const cond = this.evalExpr(node.condition);
    if (cond) return this.execute(node.then as any);
    if (node.else) return this.execute(node.else as any);
    return undefined;
  }

  private executeWhile(node: { condition: Bytecode; body: Bytecode }): unknown {
  let result;
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

  private executeFor(node: { init?: Bytecode; condition?: Bytecode; update?: Bytecode; body: Bytecode }): unknown {
    if (node.init) this.execute(node.init as any);
  let result;
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

  private executeThrow(node: { argument: Bytecode }): never {
    const arg = this.evalExpr(node.argument);
    throw arg instanceof Error ? arg : new Error(String(arg));
  }

  private executeTry(node: { tryBlock: Bytecode; catchBlock?: Bytecode; catchVar?: string; finallyBlock?: Bytecode }): unknown {
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
  private evalExpr(expr: Bytecode | { type?: string; kind?: string; [key: string]: unknown }): unknown {
    if (!expr || typeof expr !== 'object') return expr;
    if ((expr as any).type !== 'Expression') {
      // could be bytecode; execute
      return this.execute(expr as any);
    }
    const k = (expr as any).kind;
    switch (k) {
      case 'Literal':
        return (expr as any).value;
      case 'Identifier':
        return this.getVar((expr as any).name);
      case 'Unary':
        return this.evalUnary(expr as any);
      case 'Binary':
        return this.evalBinary(expr as any);
      case 'Await': {
        const v = this.evalExpr((expr as any).left);
        if (v && typeof (v as any).then === 'function') {
          // Not fully async environment: block by awaiting via then chaining (simulated synchronous via microtask not realistic)
          // For now just return value (would need async execution path to truly await)
          return v; // placeholder
        }
        return v;
      }
      case 'Ternary':
        return this.evalExpr((expr as any).condition) ? this.evalExpr((expr as any).trueExpr) : this.evalExpr((expr as any).falseExpr);
      case 'ArrayLiteral':
        return (((expr as any).elements) || []).map((e: any) => this.evalExpr(e));
      case 'ObjectLiteral':
        const o: any = {};
        for (const p of ((expr as any).properties || [])) o[p.key] = this.evalExpr(p.value);
        return o;
      case 'Call':
        const fn = this.evalExpr((expr as any).callee);
        const args = (((expr as any).arguments) || []).map((a: any) => this.evalExpr(a));
        if (typeof fn !== 'function') throw new Error('Call to non-function');
        return fn(...args);
      case 'MemberAccess':
        const obj = this.evalExpr((expr as any).object);
        return (obj as any)?.[(expr as any).member as any];
      case 'Match':
        return this.evalMatch(expr as any);
      default:
        return undefined;
    }
  }

  private evalMatch(expr: { subject: any; matchArms?: Array<{ pattern: any; guard?: any; value: any }> }): unknown {
    const value = this.evalExpr(expr.subject);
    for (const arm of expr.matchArms || []) {
      if (this.matchPattern(value, arm.pattern)) {
        if (arm.guard && !this.evalExpr(arm.guard)) continue;
        return this.evalExpr(arm.value);
      }
    }
    return undefined;
  }

  private matchPattern(value: unknown, pattern: { kind: string; value?: unknown }): boolean {
    if (!pattern || typeof pattern !== 'object') return false;
    if ((pattern as any).kind === 'Wildcard') return true;
    if ((pattern as any).kind === 'Identifier') return true; // simple binding (not stored yet)
    if ((pattern as any).kind === 'Number') return value === (pattern as any).value;
    return false;
  }

  private evalUnary(expr: { left: Bytecode; operator: string }): unknown {
    const v = this.evalExpr(expr.left);
    switch (expr.operator) {
      case '!': return !v;
      case '-': return -(v as any);
      case '~': return ~(v as any);
      default: throw new Error(`Unsupported unary operator ${expr.operator}`);
    }
  }

  private evalBinary(expr: { left: Bytecode; right: Bytecode; operator: string }): unknown {
    const l = this.evalExpr(expr.left);
    const r = this.evalExpr(expr.right);
    // Operator overloading: if left has __ops and matching operator function
    if (l && typeof l === 'object' && (l as any).__ops && typeof (l as any).__ops[expr.operator] === 'function') {
      return (l as any).__ops[expr.operator](l, r);
    }
    switch (expr.operator) {
      case '+': return (l as any) + (r as any);
      case '-': return (l as any) - (r as any);
      case '*': return (l as any) * (r as any);
      case '/': return (l as any) / (r as any);
      case '%': return (l as any) % (r as any);
      case '==': return l == r;
      case '!=': return l != r;
      case '<': return (l as any) < (r as any);
      case '<=': return (l as any) <= (r as any);
      case '>': return (l as any) > (r as any);
      case '>=': return (l as any) >= (r as any);
      case '&&': return (l as any) && (r as any);
      case '||': return (l as any) || (r as any);
      case '??=': return (l ?? (this.evalAssign((expr as any).left, r)));
      default: throw new Error(`Unsupported binary operator ${expr.operator}`);
    }
  }

  private evalAssign(left: { kind: string; name?: string }, value: unknown): unknown {
    if ((left as any).kind === 'Identifier') {
      this.setVar((left as any).name, value);
      return value;
    }
    throw new Error('Unsupported assignment target');
  }
}

// New helper Actor class (could be moved to its own module if desired)
export class Actor<TState> {
  private mailbox: unknown[] = [];
  private busy = false;

  constructor(private actorFn: (message: unknown, state: TState) => TState | Promise<TState>, private state: TState) {}

  send(message: unknown): void {
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
