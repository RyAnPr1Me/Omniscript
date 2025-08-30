import { Compiler, CompilerOptions } from '../../src/compiler';
import { AOTCompiler } from '../../src/compiler/aot';
import { Parser } from '../../src/parser';
import { Omniscript } from '../../src/index';

interface BenchmarkResult {
  name: string;
  duration: number;
  compilationsPerSecond: number;
}

class CompilationBenchmark {
  private parser = new Parser();
  
  async runBenchmark(): Promise<void> {
    console.log('🚀 Running Compilation Engine Performance Benchmark\n');
    
    const testProgram = `
      fn fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      fn factorial(n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      }
      
      fn quicksort(arr) {
        if (arr.length <= 1) return arr;
        let pivot = arr[0];
        let left = [];
        let right = [];
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] < pivot) {
            left.push(arr[i]);
          } else {
            right.push(arr[i]);
          }
        }
        return quicksort(left).concat([pivot]).concat(quicksort(right));
      }
    `;

    const ast = this.parser.parse(testProgram);
    const iterations = 1000;

    const results: BenchmarkResult[] = [];

    // Standard compilation
    results.push(await this.benchmarkCompiler(
      'Standard Compilation (All optimizations)',
      new Compiler(),
      ast,
      iterations
    ));

    // Fast mode compilation
    results.push(await this.benchmarkCompiler(
      'Fast Mode (Skip type checking)',
      new Compiler({ fastMode: true, skipTypeChecking: true }),
      ast,
      iterations
    ));

    // Fast mode with caching
    results.push(await this.benchmarkCompiler(
      'Fast Mode + Caching',
      new Compiler({ fastMode: true, skipTypeChecking: true, enableCaching: true }),
      ast,
      iterations
    ));

    // AOT compilation level 0
    results.push(await this.benchmarkAOT(
      'AOT Level 0 (No optimization)',
      new AOTCompiler({ optimizationLevel: 0 }),
      ast,
      iterations
    ));

    // AOT compilation level 1
    results.push(await this.benchmarkAOT(
      'AOT Level 1 (Basic optimization)',
      new AOTCompiler({ optimizationLevel: 1 }),
      ast,
      iterations
    ));

    // AOT compilation level 2
    results.push(await this.benchmarkAOT(
      'AOT Level 2 (Standard optimization)',
      new AOTCompiler({ optimizationLevel: 2 }),
      ast,
      iterations
    ));

    // Skip optimization completely
    results.push(await this.benchmarkCompiler(
      'No Optimization (Raw bytecode)',
      new Compiler({ skipOptimization: true, skipTypeChecking: true }),
      ast,
      iterations
    ));

    this.printResults(results);
    this.testEndToEndPerformance();
  }

  private async benchmarkCompiler(
    name: string, 
    compiler: Compiler, 
    ast: any, 
    iterations: number
  ): Promise<BenchmarkResult> {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      compiler.compile(ast);
    }
    
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    const compilationsPerSecond = Math.round((iterations / duration) * 1000);

    return { name, duration, compilationsPerSecond };
  }

  private async benchmarkAOT(
    name: string, 
    aotCompiler: AOTCompiler, 
    ast: any, 
    iterations: number
  ): Promise<BenchmarkResult> {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      aotCompiler.compileToMachineCode(ast);
    }
    
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    const compilationsPerSecond = Math.round((iterations / duration) * 1000);

    return { name, duration, compilationsPerSecond };
  }

  private printResults(results: BenchmarkResult[]): void {
    console.log('📊 Benchmark Results:');
    console.log('=' .repeat(80));
    console.log('| Mode                              | Duration (ms) | Compilations/sec |');
    console.log('|' + '-'.repeat(78) + '|');
    
    results.forEach(result => {
      const nameCol = result.name.padEnd(35);
      const durationCol = result.duration.toFixed(2).padStart(12);
      const rateCol = result.compilationsPerSecond.toString().padStart(15);
      console.log(`| ${nameCol} | ${durationCol} | ${rateCol} |`);
    });
    
    console.log('=' .repeat(80));
    
    // Calculate speed improvements
    const baseline = results[0]; // Standard compilation
    console.log('\n🏆 Speed Improvements vs Standard Compilation:');
    results.slice(1).forEach(result => {
      const improvement = ((result.compilationsPerSecond / baseline.compilationsPerSecond) - 1) * 100;
      const sign = improvement > 0 ? '+' : '';
      console.log(`  ${result.name}: ${sign}${improvement.toFixed(1)}%`);
    });
    console.log();
  }

  private async testEndToEndPerformance(): Promise<void> {
    console.log('🔄 End-to-End Performance Test:\n');
    
    const testCode = `2 + 3 * 4`;

    // Standard mode
    const standard = new Omniscript();
    const standardStart = process.hrtime.bigint();
    await standard.execute(testCode);
    const standardEnd = process.hrtime.bigint();
    const standardTime = Number(standardEnd - standardStart) / 1000000;

    // Fast mode
    const fast = new Omniscript({ fastMode: true });
    const fastStart = process.hrtime.bigint();
    await fast.execute(testCode);
    const fastEnd = process.hrtime.bigint();
    const fastTime = Number(fastEnd - fastStart) / 1000000;

    console.log(`Standard mode: ${standardTime.toFixed(3)}ms`);
    console.log(`Fast mode: ${fastTime.toFixed(3)}ms`);
    
    const improvement = ((standardTime / fastTime) - 1) * 100;
    console.log(`Fast mode is ${improvement.toFixed(1)}% faster for end-to-end execution\n`);
  }
}

// Run benchmark if this file is executed directly
if (require.main === module) {
  const benchmark = new CompilationBenchmark();
  benchmark.runBenchmark().catch(console.error);
}

export { CompilationBenchmark };