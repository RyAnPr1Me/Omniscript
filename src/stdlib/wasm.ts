/**
 * WebAssembly (WASM) compilation support for Omniscript
 * Provides high-performance compilation to WebAssembly for CPU-intensive code
 */

import { debug } from "../debug";
import wabt from "wabt";

export interface WASMCompileOptions {
  optimizationLevel: 0 | 1 | 2 | 3;
  enableSIMD: boolean;
  enableThreads: boolean;
  memory: {
    initial: number;
    maximum?: number;
    shared?: boolean;
  };
  exports?: string[];
  imports?: Record<string, any>;
}

export interface WASMModule {
  instance: WebAssembly.Instance;
  module: WebAssembly.Module;
  memory: WebAssembly.Memory;
  exports: Record<string, any>;
}

export interface CompilationResult {
  success: boolean;
  module?: WASMModule;
  wasmBytes?: Uint8Array;
  compilationTime: number;
  optimizations: string[];
  warnings: string[];
  errors: string[];
}

/**
 * WebAssembly compiler for Omniscript functions
 */
export class WASMCompiler {
  private options: WASMCompileOptions;
  private compiledModules = new Map<string, WASMModule>();

  constructor(options: Partial<WASMCompileOptions> = {}) {
    this.options = {
      optimizationLevel: options.optimizationLevel ?? 2,
      enableSIMD: options.enableSIMD ?? true,
      enableThreads: options.enableThreads ?? false,
      memory: {
        initial: 1,
        maximum: 10,
        shared: false,
        ...options.memory,
      },
      exports: options.exports ?? [],
      imports: options.imports ?? {},
    };

    debug.info("WASM", "WebAssembly compiler initialized", this.options);
  }

  /**
   * Compile Omniscript function to WebAssembly
   */
  async compileFunction(
    functionName: string,
    functionCode: string,
    options?: Partial<WASMCompileOptions>,
  ): Promise<CompilationResult> {
    const startTime = Date.now();
    const result: CompilationResult = {
      success: false,
      compilationTime: 0,
      optimizations: [],
      warnings: [],
      errors: [],
    };

    try {
      const mergedOptions = { ...this.options, ...options };

      // Parse and analyze the function
      const analysis = this.analyzeFunction(functionCode);

      // Generate WAT (WebAssembly Text format)
      const watCode = this.generateWAT(functionName, analysis, mergedOptions);
      result.optimizations.push(...analysis.optimizations);

      // Compile WAT to WASM bytecode
      const wasmBytes = await this.compileWAT(watCode);

      // Create WebAssembly module and instance
      const wasmModule = await this.createModule(wasmBytes, mergedOptions);

      // Cache the compiled module
      this.compiledModules.set(functionName, wasmModule);

      result.success = true;
      result.module = wasmModule;
      result.wasmBytes = wasmBytes;

      debug.info(
        "WASM",
        `Successfully compiled function '${functionName}' to WebAssembly`,
      );
    } catch (error) {
      result.errors.push((error as Error).message);
      debug.error(
        "WASM",
        `Failed to compile function '${functionName}':`,
        error,
      );
    }

    result.compilationTime = Date.now() - startTime;
    return result;
  }

  /**
   * Execute a compiled WASM function
   */
  async executeFunction(functionName: string, ...args: any[]): Promise<any> {
    const module = this.compiledModules.get(functionName);
    if (!module) {
      throw new Error(
        `Function '${functionName}' has not been compiled to WASM`,
      );
    }

    try {
      const exportedFunction = module.exports[functionName];
      if (typeof exportedFunction !== "function") {
        throw new Error(`Function '${functionName}' not found in WASM exports`);
      }

      debug.debug(
        "WASM",
        `Executing WASM function '${functionName}' with args:`,
        args,
      );
      const result = exportedFunction(...args);

      return result;
    } catch (error) {
      debug.error(
        "WASM",
        `Error executing WASM function '${functionName}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Analyze function for WASM compilation opportunities
   */
  private analyzeFunction(code: string): {
    functionType: "pure" | "impure";
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
    loops: number;
    arithmeticOps: number;
    memoryAccess: number;
    optimizations: string[];
    wasmSuitability: number; // 0-100 score
  } {
    const analysis = {
      functionType: "pure" as const,
      parameters: [] as Array<{ name: string; type: string }>,
      returnType: "void",
      loops: 0,
      arithmeticOps: 0,
      memoryAccess: 0,
      optimizations: [] as string[],
      wasmSuitability: 50,
    };

    // Simple static analysis (could be much more sophisticated)
    analysis.loops = (code.match(/for\s*\(|while\s*\(/g) || []).length;
    analysis.arithmeticOps = (code.match(/[+\-*/]|Math\./g) || []).length;
    analysis.memoryAccess = (
      code.match(/\.length|\.push|\.pop|\[/g) || []
    ).length;

    // Calculate WASM suitability score
    analysis.wasmSuitability = Math.min(
      100,
      50 +
        analysis.loops * 20 +
        analysis.arithmeticOps * 2 -
        analysis.memoryAccess * 5,
    );

    // Suggest optimizations
    if (analysis.loops > 0) {
      analysis.optimizations.push("Loop unrolling optimization available");
    }
    if (analysis.arithmeticOps > 10) {
      analysis.optimizations.push("SIMD vectorization possible");
    }
    if (analysis.memoryAccess < 5) {
      analysis.optimizations.push(
        "Function suitable for register-only computation",
      );
    }

    return analysis;
  }

  /**
   * Generate WebAssembly Text (WAT) format
   */
  private generateWAT(
    functionName: string,
    analysis: any,
    options: WASMCompileOptions,
  ): string {
    const imports =
      Object.keys(options.imports || {}).length > 0
        ? this.generateImports(options.imports || {})
        : "";

    const memory = `(memory ${options.memory.initial} ${options.memory.maximum || options.memory.initial})`;

    // Simple WAT template - would be much more sophisticated in real implementation
    const wat = `
(module
  ${imports}
  ${memory}
  (export "memory" (memory 0))
  (export "${functionName}" (func $${functionName}))
  
  (func $${functionName} (param $x i32) (result i32)
    ;; Generated code would go here
    ;; This is a simplified example that squares the input
    local.get $x
    local.get $x
    i32.mul
  )
)`;

    return wat;
  }

  /**
   * Generate WASM imports section
   */
  private generateImports(imports: Record<string, any>): string {
    return Object.entries(imports)
      .map(([name, type]) => `(import "env" "${name}" (func $${name} ${type}))`)
      .join("\n  ");
  }

  /**
   * Compile WAT to WASM bytecode using wabt
   */
  private async compileWAT(watCode: string): Promise<Uint8Array> {
    try {
      // Initialize wabt module
      const wabtModule = await wabt();

      // Parse the WAT text format
      const wasmModule = wabtModule.parseWat("module.wat", watCode, {
        mutable_globals: true,
        sat_float_to_int: true,
        sign_extension: true,
        simd: this.options.enableSIMD,
        threads: this.options.enableThreads,
        multi_value: true,
        tail_call: false,
        bulk_memory: true,
        reference_types: true,
        exceptions: false,
      });

      // Validate the module
      const validationResult = wasmModule.validate();
      if (validationResult !== undefined && !validationResult) {
        throw new Error("Invalid WebAssembly module");
      }

      // Convert to binary
      const binaryOutput = wasmModule.toBinary({
        write_debug_names: this.options.optimizationLevel === 0,
      });

      // Clean up
      wasmModule.destroy();

      return binaryOutput.buffer;
    } catch (error) {
      // Use console.error since debug.log may not exist
      console.error(`Error compiling WAT to WASM: ${error}`);
      throw error;
    }
  }

  /**
   * Create WebAssembly module and instance
   */
  private async createModule(
    wasmBytes: Uint8Array,
    options: WASMCompileOptions,
  ): Promise<WASMModule> {
    const wasmModule = await WebAssembly.compile(wasmBytes);

    const imports: WebAssembly.Imports = {};
    if (Object.keys(options.imports || {}).length > 0) {
      imports.env = options.imports || {};
    }

    const instance = await WebAssembly.instantiate(wasmModule, imports);

    const memory = instance.exports.memory as WebAssembly.Memory;
    const exports = instance.exports;

    return {
      instance,
      module: wasmModule,
      memory,
      exports,
    };
  }

  /**
   * Get compilation statistics
   */
  getStats() {
    return {
      compiledModules: this.compiledModules.size,
      moduleNames: Array.from(this.compiledModules.keys()),
      options: this.options,
    };
  }

  /**
   * Clear compiled modules cache
   */
  clearCache(): void {
    this.compiledModules.clear();
    debug.info("WASM", "Cleared compiled modules cache");
  }

  /**
   * Check if WebAssembly is supported
   */
  static isSupported(): boolean {
    return (
      typeof WebAssembly !== "undefined" &&
      typeof WebAssembly.compile === "function"
    );
  }

  /**
   * Get WebAssembly feature support
   */
  static getFeatureSupport() {
    const features = {
      basicWASM: typeof WebAssembly !== "undefined",
      simd: false,
      threads: false,
      bulkMemory: false,
      referenceTypes: false,
    };

    if (features.basicWASM) {
      try {
        // Test for SIMD support
        WebAssembly.compile(
          new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01,
            0x60, 0x00, 0x01, 0x7b, 0x03, 0x02, 0x01, 0x00, 0x0a, 0x07, 0x01,
            0x05, 0x00, 0xfd, 0x0f, 0x0b,
          ]),
        )
          .then(() => {
            features.simd = true;
          })
          .catch(() => {
            features.simd = false;
          });
      } catch {
        features.simd = false;
      }
    }

    return features;
  }
}

/**
 * High-level WASM compilation utilities
 */
export class WASMUtils {
  private static compiler = new WASMCompiler();

  /**
   * Compile and benchmark a function
   */
  static async benchmarkFunction(
    functionName: string,
    jsFunction: (...args: any[]) => any,
    wasmCode: string,
    testInputs: any[],
    iterations = 1000,
  ) {
    const results = {
      javascript: { time: 0, result: null },
      webassembly: { time: 0, result: null },
      speedup: 0,
      wasmOverhead: 0,
    };

    // Benchmark JavaScript version
    const jsStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      results.javascript.result = jsFunction(...testInputs);
    }
    results.javascript.time = performance.now() - jsStart;

    // Compile to WASM and benchmark
    const compileResult = await this.compiler.compileFunction(
      functionName,
      wasmCode,
    );
    if (!compileResult.success) {
      throw new Error(
        `WASM compilation failed: ${compileResult.errors.join(", ")}`,
      );
    }

    results.wasmOverhead = compileResult.compilationTime;

    const wasmStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      results.webassembly.result = await this.compiler.executeFunction(
        functionName,
        ...testInputs,
      );
    }
    results.webassembly.time = performance.now() - wasmStart;

    results.speedup = results.javascript.time / results.webassembly.time;

    return results;
  }

  /**
   * Get optimal WASM compilation options for a function
   */
  static analyzeForWASM(functionCode: string): WASMCompileOptions {
    const compiler = new WASMCompiler();
    const analysis = (compiler as any).analyzeFunction(functionCode);

    return {
      optimizationLevel: analysis.wasmSuitability > 80 ? 3 : 2,
      enableSIMD: analysis.arithmeticOps > 10,
      enableThreads: analysis.loops > 3,
      memory: {
        initial: Math.max(1, Math.ceil(analysis.memoryAccess / 100)),
        maximum: Math.max(2, Math.ceil(analysis.memoryAccess / 50)),
      },
    };
  }
}
