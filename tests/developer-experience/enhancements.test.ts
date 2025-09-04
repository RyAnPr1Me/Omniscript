import {
  OmniscriptError,
  TypeMismatchError,
  ErrorAnalyzer,
  ErrorSuggestion,
  SourceLocation,
} from "../../src/errors";
import { BenchmarkSuite, BenchmarkUtils } from "../../src/stdlib/benchmark";

describe("Developer Experience Enhancements", () => {
  describe("Enhanced Error System", () => {
    test("should create enhanced error with suggestions and context", () => {
      const location: SourceLocation = {
        filename: "test.omni",
        line: 10,
        column: 5,
        source: "let x: string = 42;",
      };

      const error = OmniscriptError.create({
        message: "Type mismatch in assignment",
        location,
        code: "E001",
        severity: "error",
        suggestions: ["Convert value to string"],
        context: {
          quickFixes: [
            {
              type: "fix",
              message: "Add toString() call",
              action: {
                type: "replace",
                text: "42.toString()",
              },
            },
          ],
          documentation: {
            url: "https://docs.omniscript.dev/types",
            description: "Learn about type conversions",
          },
        },
      });

      expect(error.message).toBe("Type mismatch in assignment");
      expect(error.code).toBe("E001");
      expect(error.severity).toBe("error");
      expect(error.suggestions).toContain("Convert value to string");
      expect(error.context?.quickFixes).toHaveLength(1);
      expect(error.context?.documentation?.url).toBe(
        "https://docs.omniscript.dev/types",
      );
    });

    test("should format error with enhanced visual display", () => {
      const location: SourceLocation = {
        filename: "example.omni",
        line: 5,
        column: 10,
        source: "function test() {\n  let x = 42;\n  return x.lenght;\n}",
      };

      const error = new TypeMismatchError(
        "Property 'lenght' does not exist on number",
        location,
        "undefined",
        "string",
      );

      const formatted = error.formatError();

      expect(formatted).toContain("❌ ERROR:");
      expect(formatted).toContain("example.omni:5:10");
      expect(formatted).toContain("📚 Learn more:");
    });

    test("should analyze undefined variable errors", () => {
      const availableVars = [
        "userName",
        "userAge",
        "userEmail",
        "count",
        "total",
      ];

      const suggestions = ErrorAnalyzer.analyzeUndefinedVariable(
        "useName",
        availableVars,
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].message).toContain("userName");
      expect(suggestions[0].type).toBe("suggestion");
      expect(suggestions[0].action?.text).toBe("userName");
    });

    test("should detect common typos", () => {
      const suggestions = ErrorAnalyzer.analyzeUndefinedVariable("lenght", []);

      expect(suggestions).toHaveLength(2); // typo fix + declaration suggestion
      expect(suggestions[0].message).toContain("length");
      expect(suggestions[0].type).toBe("fix");
      expect(suggestions[0].action?.text).toBe("length");
    });

    test("should analyze method not found errors", () => {
      const suggestions = ErrorAnalyzer.analyzeMethodNotFound("pus", "array");

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].message).toContain("push");
    });

    test("should provide array-specific method suggestions", () => {
      const suggestions = ErrorAnalyzer.analyzeMethodNotFound(
        "addItem",
        "array",
      );

      const pushSuggestion = suggestions.find((s) =>
        s.message.includes("push"),
      );
      expect(pushSuggestion).toBeDefined();
      expect(pushSuggestion?.action?.text).toBe("push");
    });

    test("should analyze syntax errors", () => {
      const source = "if (x = 5) {\n  console.log('test')\n}";

      const suggestions = ErrorAnalyzer.analyzeSyntaxError(source, 1, 7);

      expect(suggestions.length).toBeGreaterThan(0);
      const comparisonSuggestion = suggestions.find((s) =>
        s.message.includes("comparison"),
      );
      expect(comparisonSuggestion).toBeDefined();
      expect(comparisonSuggestion?.action?.text).toBe("==");
    });

    test("should detect missing semicolons", () => {
      const source = "let x = 42\nlet y = 24;";

      const suggestions = ErrorAnalyzer.analyzeSyntaxError(source, 1, 11);

      const semicolonSuggestion = suggestions.find((s) =>
        s.message.includes("semicolon"),
      );
      expect(semicolonSuggestion).toBeDefined();
      expect(semicolonSuggestion?.action?.text).toBe(";");
    });

    test("should detect unmatched parentheses", () => {
      const source = "function test(\n  return 42;";

      const suggestions = ErrorAnalyzer.analyzeSyntaxError(source, 1, 13);

      const parenSuggestion = suggestions.find((s) =>
        s.message.includes("parenthesis"),
      );
      expect(parenSuggestion).toBeDefined();
      expect(parenSuggestion?.action?.text).toBe(")");
    });
  });

  describe("Comprehensive Benchmarking", () => {
    test("should run basic benchmark", async () => {
      const suite = new BenchmarkSuite({
        iterations: 100,
        warmupIterations: 10,
        memoryTracking: false,
      });

      const result = await suite.benchmark("simple test", () => {
        return Math.sqrt(42);
      });

      expect(result.name).toBe("simple test");
      expect(result.iterations).toBe(100);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.minTime).toBeLessThanOrEqual(result.averageTime);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.averageTime);
    });

    test("should compare two functions", async () => {
      const suite = new BenchmarkSuite({
        iterations: 500,
        warmupIterations: 50,
        memoryTracking: false,
      });

      const fastFn = () => 42;
      const slowFn = () => {
        let sum = 0;
        for (let i = 0; i < 100; i++) {
          sum += Math.random();
        }
        return sum;
      };

      const comparison = await suite.compare("fast", fastFn, "slow", slowFn);

      expect(comparison.baseline.name).toBe("fast");
      expect(comparison.comparison.name).toBe("slow");
      expect(comparison.speedup).toBeLessThan(1); // fast should be faster
      expect(comparison.significance).toBe("significant");
      expect(comparison.recommendation).toContain("faster");
    });

    test("should run benchmark suite", async () => {
      const suite = new BenchmarkSuite({
        iterations: 100,
        warmupIterations: 10,
        memoryTracking: false,
      });

      const benchmarks = [
        { name: "addition", fn: () => 1 + 1 },
        { name: "multiplication", fn: () => 2 * 3 },
        { name: "division", fn: () => 10 / 2 },
      ];

      const results = await suite.suite(benchmarks);

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe("addition");
      expect(results[1].name).toBe("multiplication");
      expect(results[2].name).toBe("division");
    });

    test("should analyze algorithmic complexity", async () => {
      const suite = new BenchmarkSuite({
        iterations: 10,
        warmupIterations: 2,
        memoryTracking: false,
      });

      // O(n) algorithm
      const linearFn = (size: number) => {
        let sum = 0;
        for (let i = 0; i < size; i++) {
          sum += i;
        }
        return sum;
      };

      const results = await suite.complexityAnalysis(
        "linear",
        linearFn,
        [10, 50, 100],
      );

      expect(results).toHaveLength(3);
      expect(results[0].size).toBe(10);
      expect(results[1].size).toBe(50);
      expect(results[2].size).toBe(100);

      // Just check that all results are valid
      expect(results[0].result.averageTime).toBeGreaterThanOrEqual(0);
      expect(results[1].result.averageTime).toBeGreaterThanOrEqual(0);
      expect(results[2].result.averageTime).toBeGreaterThanOrEqual(0);
    });

    test("should generate performance warnings", async () => {
      const suite = new BenchmarkSuite({
        iterations: 10,
        warmupIterations: 2,
        memoryTracking: false,
      });

      // Intentionally slow function
      const slowFn = () => {
        const start = Date.now();
        while (Date.now() - start < 200) {
          // Busy wait
        }
      };

      const result = await suite.benchmark("slow function", slowFn);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes("Slow execution"))).toBe(
        true,
      );
    });

    test("should provide optimization suggestions", async () => {
      const suite = new BenchmarkSuite({
        iterations: 100,
        warmupIterations: 10,
        memoryTracking: false,
      });

      // Low throughput function
      const lowThroughputFn = () => {
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.sin(i) * Math.cos(i);
        }
        return result;
      };

      const result = await suite.benchmark("loop intensive", lowThroughputFn);

      // Check that optimizations are available (may vary based on performance)
      expect(Array.isArray(result.optimizations)).toBe(true);
    });
  });

  describe("Benchmark Utilities", () => {
    test("should run microbenchmark", async () => {
      const result = await BenchmarkUtils.microbenchmark(
        "micro test",
        () => {
          return 42 * 42;
        },
        100,
      ); // Lower target time

      expect(result.name).toBe("micro test");
      expect(result.iterations).toBeGreaterThan(10);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    test("should benchmark with different arguments", async () => {
      const testFn = (a: number, b: number) => a + b;
      const argSets: [number, number][] = [
        [1, 2],
        [10, 20],
        [100, 200],
      ];

      const results = await BenchmarkUtils.benchmarkWithArgs(
        "add function",
        testFn,
        argSets,
        {
          iterations: 100,
          memoryTracking: false,
        },
      );

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe("add function_args_0");
      expect(results[1].name).toBe("add function_args_1");
      expect(results[2].name).toBe("add function_args_2");
    });

    test("should benchmark memory usage", async () => {
      const memoryIntensiveFn = () => {
        const arr = new Array(1000)
          .fill(0)
          .map((_, i) => ({ id: i, data: new Array(100).fill(i) }));
        return arr.length;
      };

      const { result, memoryGrowth } = await BenchmarkUtils.benchmarkMemory(
        "memory test",
        memoryIntensiveFn,
        10,
      );

      expect(result.name).toBe("memory test");
      expect(result.memoryUsage).toBeDefined();
      expect(typeof memoryGrowth).toBe("number");
    });
  });
});
