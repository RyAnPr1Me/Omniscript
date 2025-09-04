/**
 * Comprehensive benchmarking tools for Omniscript
 * Provides performance analysis, profiling, and optimization insights
 */

import { debug } from "../debug";

export interface BenchmarkOptions {
  iterations: number;
  warmupIterations: number;
  timeout: number;
  memoryTracking: boolean;
  cpuProfiling: boolean;
  collectGC: boolean;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  throughput: number; // operations per second
  memoryUsage?: MemoryUsage;
  cpuProfile?: CPUProfile;
  warnings: string[];
  optimizations: string[];
}

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  peakUsage: number;
  gcRuns: number;
}

export interface CPUProfile {
  totalCPUTime: number;
  userCPUTime: number;
  systemCPUTime: number;
  samples: Array<{
    timestamp: number;
    cpuUsage: number;
  }>;
}

export interface ComparisonResult {
  baseline: BenchmarkResult;
  comparison: BenchmarkResult;
  speedup: number;
  memoryDifference?: number;
  significance: "significant" | "marginal" | "insignificant";
  recommendation: string;
}

/**
 * High-performance benchmarking suite
 */
export class BenchmarkSuite {
  private options: BenchmarkOptions;
  private results: Map<string, BenchmarkResult> = new Map();

  constructor(options: Partial<BenchmarkOptions> = {}) {
    this.options = {
      iterations: options.iterations ?? 1000,
      warmupIterations: options.warmupIterations ?? 100,
      timeout: options.timeout ?? 30000,
      memoryTracking: options.memoryTracking ?? true,
      cpuProfiling: options.cpuProfiling ?? false,
      collectGC: options.collectGC ?? false,
    };

    debug.info("Benchmark", "Benchmark suite initialized", this.options);
  }

  /**
   * Run a single benchmark
   */
  async benchmark(
    name: string,
    fn: () => any,
    options?: Partial<BenchmarkOptions>,
  ): Promise<BenchmarkResult> {
    const benchOptions = { ...this.options, ...options };

    debug.info("Benchmark", `Starting benchmark: ${name}`);

    // Warmup phase
    await this.warmup(fn, benchOptions.warmupIterations);

    // Force garbage collection before benchmark if enabled
    if (benchOptions.collectGC && global.gc) {
      global.gc();
    }

    const times: number[] = [];
    const memorySnapshots: MemoryUsage[] = [];
    const cpuSamples: Array<{ timestamp: number; cpuUsage: number }> = [];

    const startTime = Date.now();
    let initialMemory: MemoryUsage | undefined;

    if (benchOptions.memoryTracking) {
      initialMemory = this.getMemoryUsage();
    }

    // Main benchmark loop
    for (let i = 0; i < benchOptions.iterations; i++) {
      // Check timeout
      if (Date.now() - startTime > benchOptions.timeout) {
        debug.warn(
          "Benchmark",
          `Benchmark '${name}' timed out after ${i} iterations`,
        );
        break;
      }

      // Take CPU sample if profiling enabled
      if (benchOptions.cpuProfiling) {
        cpuSamples.push({
          timestamp: Date.now(),
          cpuUsage: process.cpuUsage().user / 1000000, // Convert to ms
        });
      }

      // Run the function and measure time
      const fnStart = performance.now();
      await fn();
      const fnEnd = performance.now();

      times.push(fnEnd - fnStart);

      // Memory tracking
      if (benchOptions.memoryTracking && i % 100 === 0) {
        memorySnapshots.push(this.getMemoryUsage());
      }
    }

    const result = this.calculateResult(
      name,
      times,
      memorySnapshots,
      cpuSamples,
      initialMemory,
    );
    this.results.set(name, result);

    debug.info("Benchmark", `Completed benchmark: ${name}`, {
      averageTime: result.averageTime,
      throughput: result.throughput,
    });

    return result;
  }

  /**
   * Compare two functions
   */
  async compare(
    name1: string,
    fn1: () => any,
    name2: string,
    fn2: () => any,
    options?: Partial<BenchmarkOptions>,
  ): Promise<ComparisonResult> {
    const result1 = await this.benchmark(name1, fn1, options);
    const result2 = await this.benchmark(name2, fn2, options);

    const speedup = result1.averageTime / result2.averageTime;
    const memoryDifference =
      result1.memoryUsage && result2.memoryUsage
        ? result1.memoryUsage.heapUsed - result2.memoryUsage.heapUsed
        : undefined;

    // Statistical significance test (simple heuristic)
    const significance = this.calculateSignificance(result1, result2);
    const recommendation = this.generateRecommendation(
      result1,
      result2,
      speedup,
    );

    return {
      baseline: result1,
      comparison: result2,
      speedup,
      memoryDifference,
      significance,
      recommendation,
    };
  }

  /**
   * Run multiple benchmarks and generate report
   */
  async suite(
    benchmarks: Array<{ name: string; fn: () => any }>,
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const { name, fn } of benchmarks) {
      const result = await this.benchmark(name, fn);
      results.push(result);
    }

    this.generateSuiteReport(results);
    return results;
  }

  /**
   * Benchmark with different input sizes for complexity analysis
   */
  async complexityAnalysis(
    name: string,
    fn: (size: number) => any,
    sizes: number[] = [10, 100, 1000, 10000],
  ): Promise<
    Array<{ size: number; result: BenchmarkResult; complexity?: string }>
  > {
    const results: Array<{
      size: number;
      result: BenchmarkResult;
      complexity?: string;
    }> = [];

    for (const size of sizes) {
      const result = await this.benchmark(`${name}_${size}`, () => fn(size), {
        iterations: Math.max(10, Math.floor(1000 / Math.log10(size + 1))),
      });

      results.push({ size, result });
    }

    // Analyze complexity
    const complexityAnalysis = this.analyzeComplexity(results);

    debug.info(
      "Benchmark",
      `Complexity analysis for ${name}:`,
      complexityAnalysis,
    );

    return results;
  }

  /**
   * Get all benchmark results
   */
  getResults(): Map<string, BenchmarkResult> {
    return new Map(this.results);
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results.clear();
  }

  private async warmup(fn: () => any, iterations: number): Promise<void> {
    for (let i = 0; i < iterations; i++) {
      await fn();
    }
  }

  private getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      peakUsage: usage.heapUsed, // Simplified - would need tracking for real peak
      gcRuns: 0, // Would need GC hooks for accurate counting
    };
  }

  private calculateResult(
    name: string,
    times: number[],
    memorySnapshots: MemoryUsage[],
    cpuSamples: Array<{ timestamp: number; cpuUsage: number }>,
    initialMemory?: MemoryUsage,
  ): BenchmarkResult {
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime =
      times.length > 0
        ? Math.min(...times.slice(0, Math.min(1000, times.length)))
        : 0;
    const maxTime =
      times.length > 0
        ? Math.max(...times.slice(0, Math.min(1000, times.length)))
        : 0;

    // Calculate standard deviation
    const squaredDiffs = times.map((time) => Math.pow(time - averageTime, 2));
    const standardDeviation = Math.sqrt(
      squaredDiffs.reduce((sum, diff) => sum + diff, 0) / times.length,
    );

    const throughput = 1000 / averageTime; // operations per second

    // Memory analysis
    let memoryUsage: MemoryUsage | undefined;
    if (memorySnapshots.length > 0) {
      const finalMemory = memorySnapshots[memorySnapshots.length - 1];
      memoryUsage = {
        ...finalMemory,
        peakUsage: Math.max(...memorySnapshots.map((snap) => snap.heapUsed)),
      };
    }

    // CPU profiling
    let cpuProfile: CPUProfile | undefined;
    if (cpuSamples.length > 0) {
      cpuProfile = {
        totalCPUTime:
          cpuSamples[cpuSamples.length - 1].cpuUsage - cpuSamples[0].cpuUsage,
        userCPUTime: 0, // Simplified
        systemCPUTime: 0, // Simplified
        samples: cpuSamples,
      };
    }

    // Generate warnings and optimization suggestions
    const warnings = this.generateWarnings(
      averageTime,
      standardDeviation,
      memoryUsage,
    );
    const optimizations = this.generateOptimizations(
      name,
      averageTime,
      throughput,
      memoryUsage,
    );

    return {
      name,
      iterations: times.length,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
      throughput,
      memoryUsage,
      cpuProfile,
      warnings,
      optimizations,
    };
  }

  private generateWarnings(
    averageTime: number,
    standardDeviation: number,
    memoryUsage?: MemoryUsage,
  ): string[] {
    const warnings: string[] = [];

    if (standardDeviation > averageTime * 0.5) {
      warnings.push(
        "High variance in execution times - results may be unreliable",
      );
    }

    if (averageTime > 100) {
      warnings.push("Slow execution time - consider optimization");
    }

    if (memoryUsage && memoryUsage.heapUsed > 100 * 1024 * 1024) {
      warnings.push("High memory usage detected");
    }

    return warnings;
  }

  private generateOptimizations(
    name: string,
    averageTime: number,
    throughput: number,
    memoryUsage?: MemoryUsage,
  ): string[] {
    const optimizations: string[] = [];

    if (throughput < 1000) {
      optimizations.push(
        "Consider algorithm optimization for better throughput",
      );
    }

    if (memoryUsage && memoryUsage.heapUsed > 50 * 1024 * 1024) {
      optimizations.push("Consider memory optimization techniques");
      optimizations.push(
        "Enable object pooling for frequently allocated objects",
      );
    }

    if (averageTime > 10 && name.includes("loop")) {
      optimizations.push("Consider loop unrolling or vectorization");
    }

    if (name.includes("async") && averageTime > 1) {
      optimizations.push("Consider batching async operations");
    }

    return optimizations;
  }

  private calculateSignificance(
    result1: BenchmarkResult,
    result2: BenchmarkResult,
  ): "significant" | "marginal" | "insignificant" {
    const difference = Math.abs(result1.averageTime - result2.averageTime);
    const pooledStdDev = Math.sqrt(
      (Math.pow(result1.standardDeviation, 2) +
        Math.pow(result2.standardDeviation, 2)) /
        2,
    );

    const effect = difference / pooledStdDev;

    if (effect > 1.0) return "significant";
    if (effect > 0.5) return "marginal";
    return "insignificant";
  }

  private generateRecommendation(
    result1: BenchmarkResult,
    result2: BenchmarkResult,
    speedup: number,
  ): string {
    if (speedup > 1.2) {
      return `${result2.name} is ${speedup.toFixed(2)}x faster than ${result1.name} - consider using it for better performance`;
    } else if (speedup < 0.8) {
      return `${result1.name} is ${(1 / speedup).toFixed(2)}x faster than ${result2.name} - stick with the baseline`;
    } else {
      return "Performance difference is minimal - choose based on other factors like readability or maintainability";
    }
  }

  private analyzeComplexity(
    results: Array<{ size: number; result: BenchmarkResult }>,
  ): string {
    if (results.length < 3) return "Insufficient data for complexity analysis";

    // Simple heuristic based on time ratios
    const ratios = [];
    for (let i = 1; i < results.length; i++) {
      const sizeRatio = results[i].size / results[i - 1].size;
      const timeRatio =
        results[i].result.averageTime / results[i - 1].result.averageTime;
      ratios.push(timeRatio / sizeRatio);
    }

    const avgRatio =
      ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;

    if (avgRatio < 1.2) return "O(1) - Constant time";
    if (avgRatio < 2) return "O(n) - Linear time";
    if (avgRatio < 4) return "O(n log n) - Linearithmic time";
    if (avgRatio < 10) return "O(n²) - Quadratic time";
    return "O(n³) or worse - Consider algorithm optimization";
  }

  private generateSuiteReport(results: BenchmarkResult[]): void {
    console.log("\n🏆 Benchmark Suite Report");
    console.log("═".repeat(50));

    // Sort by throughput (fastest first)
    const sorted = [...results].sort((a, b) => b.throughput - a.throughput);

    sorted.forEach((result, index) => {
      const medal =
        index === 0
          ? "🥇"
          : index === 1
            ? "🥈"
            : index === 2
              ? "🥉"
              : `${index + 1}.`;
      console.log(
        `${medal} ${result.name}: ${result.throughput.toFixed(0)} ops/sec (${result.averageTime.toFixed(3)}ms avg)`,
      );
    });

    console.log("\n📊 Detailed Statistics:");
    sorted.forEach((result) => {
      console.log(`\n${result.name}:`);
      console.log(`  Average: ${result.averageTime.toFixed(3)}ms`);
      console.log(
        `  Min/Max: ${result.minTime.toFixed(3)}ms / ${result.maxTime.toFixed(3)}ms`,
      );
      console.log(`  Std Dev: ${result.standardDeviation.toFixed(3)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} ops/sec`);

      if (result.memoryUsage) {
        console.log(
          `  Memory: ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`,
        );
      }

      if (result.warnings.length > 0) {
        console.log(`  ⚠️  Warnings: ${result.warnings.join(", ")}`);
      }

      if (result.optimizations.length > 0) {
        console.log(
          `  💡 Optimizations: ${result.optimizations.slice(0, 2).join(", ")}`,
        );
      }
    });
  }
}

/**
 * Utility functions for common benchmarking scenarios
 */
export class BenchmarkUtils {
  /**
   * Benchmark a function with different argument sets
   */
  static async benchmarkWithArgs<T extends any[]>(
    name: string,
    fn: (...args: T) => any,
    argSets: T[],
    options?: Partial<BenchmarkOptions>,
  ): Promise<BenchmarkResult[]> {
    const suite = new BenchmarkSuite(options);
    const results: BenchmarkResult[] = [];

    for (let i = 0; i < argSets.length; i++) {
      const args = argSets[i];
      const result = await suite.benchmark(`${name}_args_${i}`, () =>
        fn(...args),
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Create a micro-benchmark for a small code snippet
   */
  static async microbenchmark(
    name: string,
    fn: () => any,
    targetTime = 1000, // Target 1 second of execution
  ): Promise<BenchmarkResult> {
    // Estimate iterations needed
    const estimationRuns = 10;
    const start = performance.now();
    for (let i = 0; i < estimationRuns; i++) {
      fn();
    }
    const estimationTime = performance.now() - start;

    const estimatedIterations = Math.max(
      100,
      Math.floor((targetTime / estimationTime) * estimationRuns),
    );

    const suite = new BenchmarkSuite({
      iterations: estimatedIterations,
      warmupIterations: Math.floor(estimatedIterations * 0.1),
      memoryTracking: false, // Disable for micro-benchmarks
    });

    return suite.benchmark(name, fn);
  }

  /**
   * Benchmark memory allocation patterns
   */
  static async benchmarkMemory(
    name: string,
    fn: () => any,
    iterations = 100,
  ): Promise<{ result: BenchmarkResult; memoryGrowth: number }> {
    // Force GC if available
    if (global.gc) global.gc();

    const initialMemory = process.memoryUsage().heapUsed;

    const suite = new BenchmarkSuite({
      iterations,
      memoryTracking: true,
      collectGC: true,
    });

    const result = await suite.benchmark(name, fn);

    // Force GC again
    if (global.gc) global.gc();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;

    return { result, memoryGrowth };
  }
}
