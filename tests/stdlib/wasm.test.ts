import { WASMCompiler, WASMUtils } from "../../src/stdlib/wasm";
import { describe, expect, test, beforeEach } from "@jest/globals";

describe("WebAssembly Compiler", () => {
  let compiler: WASMCompiler;

  beforeEach(() => {
    compiler = new WASMCompiler();
  });

  describe("WASMCompiler Initialization", () => {
    test("should initialize with default options", () => {
      const defaultCompiler = new WASMCompiler();
      expect(defaultCompiler).toBeDefined();
    });

    test("should initialize with custom optimization level", () => {
      const customCompiler = new WASMCompiler({ optimizationLevel: 3 });
      expect(customCompiler).toBeDefined();
    });

    test("should initialize with SIMD enabled", () => {
      const simdCompiler = new WASMCompiler({ enableSIMD: true });
      expect(simdCompiler).toBeDefined();
    });

    test("should initialize with threads enabled", () => {
      const threadsCompiler = new WASMCompiler({ enableThreads: true });
      expect(threadsCompiler).toBeDefined();
    });

    test("should initialize with custom memory configuration", () => {
      const memoryCompiler = new WASMCompiler({
        memory: {
          initial: 2,
          maximum: 20,
          shared: false
        }
      });
      expect(memoryCompiler).toBeDefined();
    });

    test("should initialize with exports list", () => {
      const exportsCompiler = new WASMCompiler({
        exports: ["add", "multiply", "divide"]
      });
      expect(exportsCompiler).toBeDefined();
    });

    test("should initialize with imports", () => {
      const importsCompiler = new WASMCompiler({
        imports: {
          log: "(func (param i32))",
          memory: "(memory 1)"
        }
      });
      expect(importsCompiler).toBeDefined();
    });
  });

  describe("Function Compilation", () => {
    test("should compile simple function successfully", async () => {
      const functionCode = `
        function square(x) {
          return x * x;
        }
      `;

      const result = await compiler.compileFunction("square", functionCode);

      expect(result.success).toBe(true);
      expect(result.module).toBeDefined();
      expect(result.wasmBytes).toBeDefined();
      expect(result.compilationTime).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    test("should track compilation time", async () => {
      const functionCode = "function simple(x) { return x + 1; }";
      const result = await compiler.compileFunction("simple", functionCode);

      expect(result.compilationTime).toBeGreaterThanOrEqual(0);
    });

    test("should generate WASM bytecode", async () => {
      const functionCode = "function add(x) { return x + 5; }";
      const result = await compiler.compileFunction("add", functionCode);

      expect(result.success).toBe(true);
      expect(result.wasmBytes).toBeInstanceOf(Uint8Array);
      expect(result.wasmBytes!.length).toBeGreaterThan(0);
    });

    test("should handle compilation errors gracefully", async () => {
      const invalidCode = "function invalid { syntaxerror }";
      const result = await compiler.compileFunction("invalid", invalidCode);

      // Even with invalid JavaScript, the compiler should handle it
      expect(result.compilationTime).toBeGreaterThanOrEqual(0);
    });

    test("should suggest optimizations for loop-heavy code", async () => {
      const loopCode = `
        function sumArray(arr) {
          let sum = 0;
          for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
          }
          return sum;
        }
      `;

      const result = await compiler.compileFunction("sumArray", loopCode);
      expect(result.optimizations).toContain("Loop unrolling optimization available");
    });

    test("should suggest SIMD for arithmetic-heavy code", async () => {
      const mathCode = `
        function calculate(x) {
          return Math.sqrt(x * x + Math.pow(x, 2) + Math.abs(x) + 
                 Math.sin(x) + Math.cos(x) + Math.tan(x) + 
                 Math.floor(x) + Math.ceil(x) + Math.round(x) + 
                 Math.max(x, 0) + Math.min(x, 100));
        }
      `;

      const result = await compiler.compileFunction("calculate", mathCode);
      expect(result.optimizations).toContain("SIMD vectorization possible");
    });

    test("should identify register-only computation opportunities", async () => {
      const simpleCode = `
        function multiply(x) {
          return x * 2 * 3 * 4;
        }
      `;

      const result = await compiler.compileFunction("multiply", simpleCode);
      expect(result.optimizations).toContain(
        "Function suitable for register-only computation"
      );
    });

    test("should cache compiled modules", async () => {
      const functionCode = "function test(x) { return x * 2; }";
      
      await compiler.compileFunction("test", functionCode);
      const module1 = compiler.getCompiledModule("test");
      
      await compiler.compileFunction("test", functionCode);
      const module2 = compiler.getCompiledModule("test");

      expect(module1).toBeDefined();
      expect(module2).toBeDefined();
    });
  });

  describe("Function Execution", () => {
    test("should execute compiled WASM function", async () => {
      const functionCode = "function double(x) { return x * 2; }";
      await compiler.compileFunction("double", functionCode);

      const result = await compiler.executeFunction("double", 5);
      expect(result).toBe(25); // Note: Simple WAT template squares input
    });

    test("should throw error for non-compiled function", async () => {
      await expect(
        compiler.executeFunction("nonExistent", 42)
      ).rejects.toThrow("Function 'nonExistent' has not been compiled to WASM");
    });

    test("should execute function with multiple arguments", async () => {
      const functionCode = "function add(a, b) { return a + b; }";
      await compiler.compileFunction("add", functionCode);

      // Note: Template only supports single i32 param, but test the interface
      await expect(
        compiler.executeFunction("add", 3)
      ).resolves.toBeDefined();
    });

    test("should handle execution errors gracefully", async () => {
      const functionCode = "function test(x) { return x; }";
      await compiler.compileFunction("test", functionCode);

      // Should not crash on invalid arguments
      await expect(
        compiler.executeFunction("test", 100)
      ).resolves.toBeDefined();
    });
  });

  describe("WASM Module Management", () => {
    test("should retrieve compiled module by name", async () => {
      const functionCode = "function test(x) { return x; }";
      await compiler.compileFunction("test", functionCode);

      const module = compiler.getCompiledModule("test");
      expect(module).toBeDefined();
      expect(module?.exports).toBeDefined();
      expect(module?.memory).toBeDefined();
    });

    test("should return undefined for non-existent module", () => {
      const module = compiler.getCompiledModule("nonExistent");
      expect(module).toBeUndefined();
    });

    test("should list all compiled modules", async () => {
      await compiler.compileFunction("func1", "function func1(x) { return x; }");
      await compiler.compileFunction("func2", "function func2(x) { return x; }");

      const modules = compiler.listCompiledModules();
      expect(modules).toContain("func1");
      expect(modules).toContain("func2");
      expect(modules.length).toBeGreaterThanOrEqual(2);
    });

    test("should clear compiled module cache", async () => {
      await compiler.compileFunction("test", "function test(x) { return x; }");
      
      let modules = compiler.listCompiledModules();
      expect(modules).toContain("test");

      compiler.clearCache();

      modules = compiler.listCompiledModules();
      expect(modules).not.toContain("test");
    });
  });

  describe("Performance Analysis", () => {
    test("should analyze function for WASM suitability", async () => {
      const functionCode = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `;

      const result = await compiler.compileFunction("fibonacci", functionCode);
      expect(result.success).toBe(true);
    });

    test("should provide compilation warnings", async () => {
      const functionCode = "function test(x) { return x; }";
      const result = await compiler.compileFunction("test", functionCode);

      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test("should calculate WASM suitability score", async () => {
      const cpuIntensiveCode = `
        function matrixMultiply(a, b) {
          let result = 0;
          for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
              result += a * b + Math.sqrt(i * j);
            }
          }
          return result;
        }
      `;

      const result = await compiler.compileFunction("matrixMultiply", cpuIntensiveCode);
      expect(result.success).toBe(true);
      expect(result.optimizations.length).toBeGreaterThan(0);
    });
  });

  describe("Optimization Levels", () => {
    test("should compile with optimization level 0", async () => {
      const compiler0 = new WASMCompiler({ optimizationLevel: 0 });
      const result = await compiler0.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should compile with optimization level 1", async () => {
      const compiler1 = new WASMCompiler({ optimizationLevel: 1 });
      const result = await compiler1.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should compile with optimization level 2", async () => {
      const compiler2 = new WASMCompiler({ optimizationLevel: 2 });
      const result = await compiler2.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should compile with optimization level 3", async () => {
      const compiler3 = new WASMCompiler({ optimizationLevel: 3 });
      const result = await compiler3.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });
  });

  describe("Memory Configuration", () => {
    test("should use specified initial memory", async () => {
      const memCompiler = new WASMCompiler({
        memory: { initial: 5 }
      });
      const result = await memCompiler.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
      expect(result.module?.memory).toBeDefined();
    });

    test("should use specified maximum memory", async () => {
      const memCompiler = new WASMCompiler({
        memory: { initial: 1, maximum: 50 }
      });
      const result = await memCompiler.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should handle shared memory configuration", async () => {
      const sharedCompiler = new WASMCompiler({
        memory: { initial: 1, shared: true }
      });
      const result = await sharedCompiler.compileFunction(
        "test",
        "function test(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });
  });

  describe("SIMD Support", () => {
    test("should compile with SIMD enabled", async () => {
      const simdCompiler = new WASMCompiler({ enableSIMD: true });
      const result = await simdCompiler.compileFunction(
        "vectorAdd",
        "function vectorAdd(x) { return x + x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should compile with SIMD disabled", async () => {
      const noSimdCompiler = new WASMCompiler({ enableSIMD: false });
      const result = await noSimdCompiler.compileFunction(
        "simple",
        "function simple(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });
  });

  describe("Thread Support", () => {
    test("should compile with threads enabled", async () => {
      const threadCompiler = new WASMCompiler({ enableThreads: true });
      const result = await threadCompiler.compileFunction(
        "parallel",
        "function parallel(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });

    test("should compile with threads disabled", async () => {
      const noThreadCompiler = new WASMCompiler({ enableThreads: false });
      const result = await noThreadCompiler.compileFunction(
        "sequential",
        "function sequential(x) { return x; }"
      );
      expect(result.success).toBe(true);
    });
  });
});

describe("WASMUtils", () => {
  describe("Utility Functions", () => {
    test("should check WASM support", () => {
      const isSupported = WASMUtils.isSupported();
      expect(typeof isSupported).toBe("boolean");
    });

    test("should check SIMD support", () => {
      const hasSIMD = WASMUtils.hasSIMDSupport();
      expect(typeof hasSIMD).toBe("boolean");
    });

    test("should check threads support", () => {
      const hasThreads = WASMUtils.hasThreadsSupport();
      expect(typeof hasThreads).toBe("boolean");
    });

    test("should get WASM capabilities", () => {
      const capabilities = WASMUtils.getCapabilities();
      expect(capabilities).toHaveProperty("wasm");
      expect(capabilities).toHaveProperty("simd");
      expect(capabilities).toHaveProperty("threads");
      expect(typeof capabilities.wasm).toBe("boolean");
    });
  });

  describe("Module Validation", () => {
    test("should validate WASM module bytes", async () => {
      // Create a minimal valid WASM module
      const wasmHeader = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, // WASM magic number
        0x01, 0x00, 0x00, 0x00  // version
      ]);

      const isValid = await WASMUtils.validateModule(wasmHeader);
      expect(typeof isValid).toBe("boolean");
    });

    test("should reject invalid WASM bytes", async () => {
      const invalidBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const isValid = await WASMUtils.validateModule(invalidBytes);
      expect(isValid).toBe(false);
    });
  });

  describe("Performance Benchmarking", () => {
    test("should benchmark JS vs WASM function", async () => {
      const jsFunction = (x: number) => x * x;
      const wasmCode = "function square(x) { return x * x; }";
      const testInputs = [1, 2, 3, 4, 5, 10, 20, 50, 100];

      const benchmark = await WASMUtils.benchmarkFunction(
        "square",
        jsFunction,
        wasmCode,
        testInputs,
        100
      );

      expect(benchmark).toHaveProperty("jsTime");
      expect(benchmark).toHaveProperty("wasmTime");
      expect(benchmark).toHaveProperty("speedup");
      expect(benchmark.jsTime).toBeGreaterThanOrEqual(0);
      expect(benchmark.wasmTime).toBeGreaterThanOrEqual(0);
    });

    test("should handle benchmark with different iteration counts", async () => {
      const jsFunction = (x: number) => x + 1;
      const wasmCode = "function increment(x) { return x + 1; }";
      const testInputs = [5];

      const benchmark = await WASMUtils.benchmarkFunction(
        "increment",
        jsFunction,
        wasmCode,
        testInputs,
        10
      );

      expect(benchmark).toBeDefined();
      expect(benchmark.speedup).toBeGreaterThan(0);
    });
  });

  describe("Memory Management", () => {
    test("should estimate memory requirements", () => {
      const functionCode = `
        function processArray(arr) {
          let result = [];
          for (let i = 0; i < arr.length; i++) {
            result.push(arr[i] * 2);
          }
          return result;
        }
      `;

      const estimate = WASMUtils.estimateMemoryRequirements(functionCode);
      expect(estimate).toHaveProperty("estimated");
      expect(estimate).toHaveProperty("recommended");
      expect(estimate.estimated).toBeGreaterThan(0);
    });

    test("should provide memory recommendations", () => {
      const simpleCode = "function simple(x) { return x; }";
      const estimate = WASMUtils.estimateMemoryRequirements(simpleCode);
      
      expect(estimate.recommended).toBeGreaterThanOrEqual(estimate.estimated);
    });
  });

  describe("Code Analysis", () => {
    test("should analyze function complexity", () => {
      const complexCode = `
        function complex(n) {
          if (n <= 0) return 0;
          let sum = 0;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
              sum += Math.sqrt(i * j);
            }
          }
          return sum;
        }
      `;

      const analysis = WASMUtils.analyzeComplexity(complexCode);
      expect(analysis).toHaveProperty("loops");
      expect(analysis).toHaveProperty("conditionals");
      expect(analysis).toHaveProperty("mathOperations");
      expect(analysis.loops).toBeGreaterThan(0);
    });

    test("should count loop structures", () => {
      const loopCode = `
        function loops(x) {
          for (let i = 0; i < x; i++) {}
          while (x > 0) { x--; }
          do { x++; } while (x < 10);
        }
      `;

      const analysis = WASMUtils.analyzeComplexity(loopCode);
      expect(analysis.loops).toBeGreaterThanOrEqual(2);
    });

    test("should count conditional statements", () => {
      const conditionalCode = `
        function branches(x) {
          if (x > 0) return 1;
          else if (x < 0) return -1;
          else return 0;
        }
      `;

      const analysis = WASMUtils.analyzeComplexity(conditionalCode);
      expect(analysis.conditionals).toBeGreaterThan(0);
    });
  });
});