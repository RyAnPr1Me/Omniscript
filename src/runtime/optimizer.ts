/**
 * Runtime optimizer for Omniscript
 * Provides JIT compilation, dead code elimination, and performance optimizations
 */

export interface OptimizationProfile {
  callCounts: Map<string, number>;
  hotFunctions: Set<string>;
  memoryUsage: Map<string, number>;
  executionTimes: Map<string, number[]>;
}

export interface OptimizedBytecode {
  original: any[];
  optimized: any[];
  optimizations: string[];
  speedup: number;
}

/**
 * Just-In-Time compiler for hot code paths
 */
export class JITCompiler {
  private compiledFunctions = new Map<string, (...args: any[]) => any>();
  private compilationThreshold = 10;
  private profile: OptimizationProfile;

  constructor(profile: OptimizationProfile) {
    this.profile = profile;
  }

  get compiledFunctionCount(): number {
    return this.compiledFunctions.size;
  }

  shouldCompile(functionName: string): boolean {
    const callCount = this.profile.callCounts.get(functionName) || 0;
    return (
      callCount >= this.compilationThreshold &&
      !this.compiledFunctions.has(functionName)
    );
  }

  compile(functionName: string, bytecode: any[]): (...args: any[]) => any {
    if (this.compiledFunctions.has(functionName)) {
      return this.compiledFunctions.get(functionName)!;
    }

    // Generate optimized JavaScript code
    const jsCode = this.generateOptimizedCode(bytecode);

    try {
      // Create function with optimizations
      const compiledFn = new Function("runtime", "args", jsCode) as (
        ...args: any[]
      ) => any;
      this.compiledFunctions.set(functionName, compiledFn);

      console.log(`JIT compiled function: ${functionName}`);
      return compiledFn;
    } catch (error) {
      console.warn(`JIT compilation failed for ${functionName}:`, error);
      // Fallback to interpreter
      return this.createInterpreterFallback(bytecode);
    }
  }

  private generateOptimizedCode(bytecode: any[]): string {
    const lines: string[] = [];
    lines.push("let result = undefined;");
    lines.push("let stack = [];");
    lines.push("let locals = new Map();");

    for (let i = 0; i < bytecode.length; i++) {
      const instruction = bytecode[i];
      lines.push(this.compileInstruction(instruction, i));
    }

    lines.push("return result;");
    return lines.join("\n");
  }

  private compileInstruction(instruction: any, index: number): string {
    switch (instruction.type) {
      case "LOAD_CONST":
        return `stack.push(${JSON.stringify(instruction.value)});`;

      case "LOAD_VAR":
        return `stack.push(locals.get('${instruction.name}') || runtime.getVariable('${instruction.name}'));`;

      case "STORE_VAR":
        return `locals.set('${instruction.name}', stack.pop());`;

      case "ADD":
        return `{ let b = stack.pop(); let a = stack.pop(); stack.push(a + b); }`;

      case "SUBTRACT":
        return `{ let b = stack.pop(); let a = stack.pop(); stack.push(a - b); }`;

      case "MULTIPLY":
        return `{ let b = stack.pop(); let a = stack.pop(); stack.push(a * b); }`;

      case "DIVIDE":
        return `{ let b = stack.pop(); let a = stack.pop(); stack.push(a / b); }`;

      case "CALL":
        return `{ 
          let args = []; 
          for(let i = 0; i < ${instruction.argCount}; i++) args.unshift(stack.pop());
          let fn = stack.pop();
          result = fn.apply(null, args);
          stack.push(result);
        }`;

      case "RETURN":
        return `result = stack.pop(); return result;`;

      case "JUMP":
        return `// Jump to ${instruction.target} - handled by control flow`;

      case "JUMP_IF_FALSE":
        return `if (!stack.pop()) { /* jump to ${instruction.target} */ }`;

      default:
        return `runtime.executeInstruction(${JSON.stringify(instruction)});`;
    }
  }

  private createInterpreterFallback(
    bytecode: any[],
  ): (runtime: any, args: any[]) => any {
    return (runtime: any, args: any[]) => {
      return runtime.execute(bytecode, args);
    };
  }

  getCompiledFunction(name: string): ((...args: any[]) => any) | undefined {
    return this.compiledFunctions.get(name);
  }

  clearCache(): void {
    this.compiledFunctions.clear();
  }
}

/**
 * Dead code elimination optimizer
 */
export class DeadCodeEliminator {
  eliminate(bytecode: any[]): OptimizedBytecode {
    const original = [...bytecode];
    const reachable = new Set<number>();
    const optimizations: string[] = [];

    // Mark reachable code
    this.markReachable(bytecode, 0, reachable);

    // Remove unreachable instructions
    const optimized = bytecode.filter((_, index) => reachable.has(index));

    if (optimized.length < original.length) {
      const removedCount = original.length - optimized.length;
      optimizations.push(`Removed ${removedCount} unreachable instructions`);
    }

    return {
      original,
      optimized,
      optimizations,
      speedup: original.length / optimized.length,
    };
  }

  private markReachable(
    bytecode: any[],
    start: number,
    reachable: Set<number>,
  ): void {
    if (reachable.has(start) || start >= bytecode.length) return;

    reachable.add(start);
    const instruction = bytecode[start];

    switch (instruction.type) {
      case "JUMP":
        this.markReachable(bytecode, instruction.target, reachable);
        break;

      case "JUMP_IF_FALSE":
      case "JUMP_IF_TRUE":
        this.markReachable(bytecode, instruction.target, reachable);
        this.markReachable(bytecode, start + 1, reachable);
        break;

      case "RETURN":
      case "THROW":
        // Don't mark next instruction as reachable
        break;

      default:
        this.markReachable(bytecode, start + 1, reachable);
    }
  }
}

/**
 * Constant folding optimizer
 */
export class ConstantFolder {
  fold(bytecode: any[]): OptimizedBytecode {
    const original = [...bytecode];
    const optimized = [...bytecode];
    const optimizations: string[] = [];

    let changed = true;
    while (changed) {
      changed = false;

      for (let i = 0; i < optimized.length - 1; i++) {
        const result = this.tryFoldAt(optimized, i);
        if (result) {
          optimized.splice(i, result.removeCount, ...result.newInstructions);
          optimizations.push(result.description);
          changed = true;
          break;
        }
      }
    }

    return {
      original,
      optimized,
      optimizations,
      speedup: original.length / optimized.length,
    };
  }

  private tryFoldAt(
    bytecode: any[],
    index: number,
  ): {
    removeCount: number;
    newInstructions: any[];
    description: string;
  } | null {
    const inst1 = bytecode[index];
    const inst2 = bytecode[index + 1];
    const inst3 = bytecode[index + 2];

    // Enhanced constant folding for arithmetic operations
    if (
      inst1?.type === "LOAD_CONST" &&
      inst2?.type === "LOAD_CONST" &&
      typeof inst1.value === "number" &&
      typeof inst2.value === "number"
    ) {
      let result: number | null = null;
      let operation = "";

      switch (inst3?.type) {
        case "ADD":
          result = inst1.value + inst2.value;
          operation = `${inst1.value} + ${inst2.value}`;
          break;
        case "SUBTRACT":
          result = inst1.value - inst2.value;
          operation = `${inst1.value} - ${inst2.value}`;
          break;
        case "MULTIPLY":
          result = inst1.value * inst2.value;
          operation = `${inst1.value} * ${inst2.value}`;
          break;
        case "DIVIDE":
          if (inst2.value !== 0) {
            result = inst1.value / inst2.value;
            operation = `${inst1.value} / ${inst2.value}`;
          }
          break;
        case "POWER":
          result = Math.pow(inst1.value, inst2.value);
          operation = `${inst1.value} ** ${inst2.value}`;
          break;
        case "MODULO":
          if (inst2.value !== 0) {
            result = inst1.value % inst2.value;
            operation = `${inst1.value} % ${inst2.value}`;
          }
          break;
        case "BITWISE_AND":
          result = inst1.value & inst2.value;
          operation = `${inst1.value} & ${inst2.value}`;
          break;
        case "BITWISE_OR":
          result = inst1.value | inst2.value;
          operation = `${inst1.value} | ${inst2.value}`;
          break;
        case "BITWISE_XOR":
          result = inst1.value ^ inst2.value;
          operation = `${inst1.value} ^ ${inst2.value}`;
          break;
        case "LEFT_SHIFT":
          result = inst1.value << inst2.value;
          operation = `${inst1.value} << ${inst2.value}`;
          break;
        case "RIGHT_SHIFT":
          result = inst1.value >> inst2.value;
          operation = `${inst1.value} >> ${inst2.value}`;
          break;
      }

      if (result !== null && isFinite(result)) {
        return {
          removeCount: 3,
          newInstructions: [{ type: "LOAD_CONST", value: result }],
          description: `Folded constants: ${operation} = ${result}`,
        };
      }
    }

    // Fold string concatenation
    if (
      inst1?.type === "LOAD_CONST" &&
      inst2?.type === "LOAD_CONST" &&
      inst3?.type === "ADD" &&
      (typeof inst1.value === "string" || typeof inst2.value === "string")
    ) {
      const result = String(inst1.value) + String(inst2.value);
      return {
        removeCount: 3,
        newInstructions: [{ type: "LOAD_CONST", value: result }],
        description: `Folded string concatenation: "${inst1.value}" + "${inst2.value}" = "${result}"`,
      };
    }

    // Fold unary operations with single instruction lookahead
    if (inst1?.type === "LOAD_CONST" && typeof inst1.value === "number") {
      let result: number | null = null;
      let operation = "";

      switch (inst2?.type) {
        case "NEGATE":
          result = -inst1.value;
          operation = `-${inst1.value}`;
          break;
        case "BITWISE_NOT":
          result = ~inst1.value;
          operation = `~${inst1.value}`;
          break;
        case "ABS":
          result = Math.abs(inst1.value);
          operation = `abs(${inst1.value})`;
          break;
        case "SQRT":
          if (inst1.value >= 0) {
            result = Math.sqrt(inst1.value);
            operation = `sqrt(${inst1.value})`;
          }
          break;
        case "FLOOR":
          result = Math.floor(inst1.value);
          operation = `floor(${inst1.value})`;
          break;
        case "CEIL":
          result = Math.ceil(inst1.value);
          operation = `ceil(${inst1.value})`;
          break;
      }

      if (result !== null && isFinite(result)) {
        return {
          removeCount: 2,
          newInstructions: [{ type: "LOAD_CONST", value: result }],
          description: `Folded unary operation: ${operation} = ${result}`,
        };
      }
    }

    return null;
  }
}

/**
 * Inline caching for method calls to improve runtime performance
 */
export class InlineCache {
  private methodCache = new Map<
    string,
    {
      method: (...args: any[]) => any;
      type: string;
      hitCount: number;
      lastUsed: number;
    }
  >();
  private maxCacheSize = 1000;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  lookupMethod(
    object: any,
    methodName: string,
  ): ((...args: any[]) => any) | null {
    const objectType = this.getObjectType(object);
    const cacheKey = `${objectType}::${methodName}`;
    const cached = this.methodCache.get(cacheKey);

    if (cached && object[methodName] === cached.method) {
      // Cache hit
      cached.hitCount++;
      cached.lastUsed = Date.now();
      this.stats.hits++;
      return cached.method;
    }

    // Cache miss - need to resolve method
    this.stats.misses++;
    const method = object[methodName];

    if (typeof method === "function") {
      this.cacheMethod(cacheKey, method, objectType);
      return method;
    }

    return null;
  }

  private cacheMethod(
    cacheKey: string,
    method: (...args: any[]) => any,
    objectType: string,
  ): void {
    // Evict least recently used if cache is full
    if (this.methodCache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.methodCache.set(cacheKey, {
      method,
      type: objectType,
      hitCount: 1,
      lastUsed: Date.now(),
    });
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, value] of this.methodCache.entries()) {
      if (value.lastUsed < oldestTime) {
        oldestTime = value.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.methodCache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private getObjectType(object: any): string {
    if (object === null) return "null";
    if (object === undefined) return "undefined";

    // Use constructor name for object type identification
    if (object.constructor && object.constructor.name) {
      return object.constructor.name;
    }

    // Fallback to typeof for primitives
    return typeof object;
  }

  getCacheStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      cacheSize: this.methodCache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }

  clearCache(): void {
    this.methodCache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
}

/**
 * Peephole optimizer for local optimizations
 */
export class PeepholeOptimizer {
  optimize(bytecode: any[]): OptimizedBytecode {
    const original = [...bytecode];
    const optimized = [...bytecode];
    const optimizations: string[] = [];

    let changed = true;
    while (changed) {
      changed = false;

      for (let i = 0; i < optimized.length - 1; i++) {
        const result = this.tryOptimizeAt(optimized, i);
        if (result) {
          optimized.splice(i, result.removeCount, ...result.newInstructions);
          optimizations.push(result.description);
          changed = true;
          break;
        }
      }
    }

    return {
      original,
      optimized,
      optimizations,
      speedup: original.length / optimized.length,
    };
  }

  private tryOptimizeAt(
    bytecode: any[],
    index: number,
  ): {
    removeCount: number;
    newInstructions: any[];
    description: string;
  } | null {
    const inst1 = bytecode[index];
    const inst2 = bytecode[index + 1];

    // Remove redundant loads: LOAD_VAR x, LOAD_VAR x -> LOAD_VAR x, DUP
    if (
      inst1?.type === "LOAD_VAR" &&
      inst2?.type === "LOAD_VAR" &&
      inst1.name === inst2.name
    ) {
      return {
        removeCount: 2,
        newInstructions: [
          { type: "LOAD_VAR", name: inst1.name },
          { type: "DUP" },
        ],
        description: `Optimized duplicate variable load: ${inst1.name}`,
      };
    }

    // Remove store-load pairs: STORE_VAR x, LOAD_VAR x -> DUP, STORE_VAR x
    if (
      inst1?.type === "STORE_VAR" &&
      inst2?.type === "LOAD_VAR" &&
      inst1.name === inst2.name
    ) {
      return {
        removeCount: 2,
        newInstructions: [
          { type: "DUP" },
          { type: "STORE_VAR", name: inst1.name },
        ],
        description: `Optimized store-load pair: ${inst1.name}`,
      };
    }

    return null;
  }
}

/**
 * Main runtime optimizer that combines all optimization passes
 */
export class RuntimeOptimizer {
  private jitCompiler: JITCompiler;
  private deadCodeEliminator = new DeadCodeEliminator();
  private constantFolder = new ConstantFolder();
  private peepholeOptimizer = new PeepholeOptimizer();
  private profile: OptimizationProfile;

  constructor() {
    this.profile = {
      callCounts: new Map(),
      hotFunctions: new Set(),
      memoryUsage: new Map(),
      executionTimes: new Map(),
    };
    this.jitCompiler = new JITCompiler(this.profile);
  }

  optimizeBytecode(bytecode: any[]): OptimizedBytecode {
    // Apply optimization passes in order
    let result = this.deadCodeEliminator.eliminate(bytecode);
    result = this.constantFolder.fold(result.optimized);
    result = this.peepholeOptimizer.optimize(result.optimized);

    const totalSpeedup = bytecode.length / result.optimized.length;

    return {
      original: bytecode,
      optimized: result.optimized,
      optimizations: result.optimizations,
      speedup: totalSpeedup,
    };
  }

  profileFunction(name: string, executionTime: number): void {
    // Update call count
    const currentCount = this.profile.callCounts.get(name) || 0;
    this.profile.callCounts.set(name, currentCount + 1);

    // Track execution times
    const times = this.profile.executionTimes.get(name) || [];
    times.push(executionTime);
    this.profile.executionTimes.set(name, times);

    // Mark as hot if called frequently
    if (currentCount + 1 >= 10) {
      this.profile.hotFunctions.add(name);
    }
  }

  shouldJITCompile(functionName: string): boolean {
    return this.jitCompiler.shouldCompile(functionName);
  }

  compileFunction(name: string, bytecode: any[]): (...args: any[]) => any {
    return this.jitCompiler.compile(name, bytecode);
  }

  getCompiledFunction(name: string): ((...args: any[]) => any) | undefined {
    return this.jitCompiler.getCompiledFunction(name);
  }

  getProfile(): OptimizationProfile {
    return { ...this.profile };
  }

  getHotFunctions(): string[] {
    return Array.from(this.profile.hotFunctions);
  }

  getOptimizationReport(): {
    totalFunctions: number;
    hotFunctions: number;
    compiledFunctions: number;
    averageExecutionTimes: Map<string, number>;
  } {
    const averageExecutionTimes = new Map<string, number>();

    for (const [name, times] of this.profile.executionTimes) {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      averageExecutionTimes.set(name, average);
    }

    return {
      totalFunctions: this.profile.callCounts.size,
      hotFunctions: this.profile.hotFunctions.size,
      compiledFunctions: this.jitCompiler.compiledFunctionCount,
      averageExecutionTimes,
    };
  }

  reset(): void {
    this.profile.callCounts.clear();
    this.profile.hotFunctions.clear();
    this.profile.memoryUsage.clear();
    this.profile.executionTimes.clear();
    this.jitCompiler.clearCache();
  }
}

export default RuntimeOptimizer;
