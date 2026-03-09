import { debug } from "../debug";

export interface SIMDOperations {
  add(a: number[], b: number[]): number[];
  subtract(a: number[], b: number[]): number[];
  multiply(a: number[], b: number[]): number[];
  divide(a: number[], b: number[]): number[];
  dot(a: number[], b: number[]): number;
  magnitude(a: number[]): number;
  normalize(a: number[]): number[];

  // Advanced operations
  fma(a: number[], b: number[], c: number[]): number[]; // Fused multiply-add
  reduce(a: number[], operation: "sum" | "min" | "max" | "mean"): number;
  transform(a: number[], fn: (x: number) => number): number[];
  convolve(signal: number[], kernel: number[]): number[];
  crossCorrelation(a: number[], b: number[]): number[];

  // Statistics operations
  mean(a: number[]): number;
  variance(a: number[]): number;
  standardDeviation(a: number[]): number;
  covariance(a: number[], b: number[]): number;
  correlation(a: number[], b: number[]): number;
}

export class SIMDProcessor implements SIMDOperations {
  private useParallel: boolean = false;

  constructor(useParallel: boolean = false) {
    this.useParallel = useParallel;
    debug.info(
      "SIMD",
      `SIMD processor initialized with parallel execution: ${useParallel}`,
    );
  }

  enableParallelExecution(): void {
    this.useParallel = true;
    debug.info("SIMD", "Parallel execution enabled for SIMD operations");
  }

  add(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug(
      "SIMD",
      `Performing vector addition on arrays of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x + y);
    }

    return a.map((x, i) => x + b[i]);
  }

  subtract(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug(
      "SIMD",
      `Performing vector subtraction on arrays of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x - y);
    }

    return a.map((x, i) => x - b[i]);
  }

  multiply(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug(
      "SIMD",
      `Performing vector multiplication on arrays of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x * y);
    }

    return a.map((x, i) => x * b[i]);
  }

  divide(a: number[], b: number[]): number[] {
    this.validateArrays(a, b);
    debug.debug(
      "SIMD",
      `Performing vector division on arrays of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelOperation(a, b, (x, y) => x / y);
    }

    return a.map((x, i) => x / b[i]);
  }

  dot(a: number[], b: number[]): number {
    this.validateArrays(a, b);
    debug.debug(
      "SIMD",
      `Computing dot product of arrays of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelReduce(
        a,
        b,
        (x, y) => x * y,
        (acc, val) => acc + val,
        0,
      );
    }

    return a.reduce((sum, x, i) => sum + x * b[i], 0);
  }

  magnitude(a: number[]): number {
    debug.debug("SIMD", `Computing magnitude of array of length ${a.length}`);

    if (this.useParallel && a.length > 1000) {
      const squares = this.parallelUnaryOperation(a, (x) => x * x);
      return Math.sqrt(squares.reduce((sum, x) => sum + x, 0));
    }

    return Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  }

  normalize(a: number[]): number[] {
    debug.debug("SIMD", `Normalizing array of length ${a.length}`);
    const mag = this.magnitude(a);

    if (mag === 0) return a.slice(); // Return copy if zero magnitude

    if (this.useParallel && a.length > 1000) {
      return this.parallelUnaryOperation(a, (x) => x / mag);
    }

    return a.map((x) => x / mag);
  }

  // Matrix operations
  matrixMultiply(a: number[][], b: number[][]): number[][] {
    if (a[0].length !== b.length) {
      throw new Error("Matrix dimensions do not match for multiplication");
    }

    debug.debug(
      "SIMD",
      `Performing matrix multiplication ${a.length}x${a[0].length} * ${b.length}x${b[0].length}`,
    );

    const result: number[][] = [];

    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }

    return result;
  }

  // Parallel operation helpers
  private parallelOperation(
    a: number[],
    b: number[],
    op: (x: number, y: number) => number,
  ): number[] {
    const chunkSize = Math.ceil(a.length / 4); // Use 4 chunks for demonstration
    const results: number[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, a.length);
      const chunkA = a.slice(i, end);
      const chunkB = b.slice(i, end);
      const chunkResult = chunkA.map((x, idx) => op(x, chunkB[idx]));
      results.push(...chunkResult);
    }

    return results;
  }

  private parallelReduce(
    a: number[],
    b: number[],
    op: (x: number, y: number) => number,
    reducer: (acc: number, val: number) => number,
    initial: number,
  ): number {
    const chunkSize = Math.ceil(a.length / 4);
    const partialResults: number[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, a.length);
      const chunkA = a.slice(i, end);
      const chunkB = b.slice(i, end);

      const chunkResult = chunkA.reduce((sum, x, idx) => {
        return reducer(sum, op(x, chunkB[idx]));
      }, initial);

      partialResults.push(chunkResult);
    }

    return partialResults.reduce(reducer, initial);
  }

  private async processChunk(
    a: number[],
    b: number[],
    op: (x: number, y: number) => number,
  ): Promise<number[]> {
    // Simulate async processing
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(a.map((x, i) => op(x, b[i])));
      });
    });
  }

  private async processUnaryChunk(
    a: number[],
    op: (x: number) => number,
  ): Promise<number[]> {
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(a.map(op));
      });
    });
  }

  private validateArrays(a: number[], b: number[]): void {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      throw new Error("Both arguments must be arrays");
    }
    if (a.length !== b.length) {
      throw new Error("Arrays must have the same length");
    }
  }

  // Advanced SIMD operations
  fma(a: number[], b: number[], c: number[]): number[] {
    if (a.length !== b.length || b.length !== c.length) {
      throw new Error("All arrays must have the same length for FMA operation");
    }
    debug.debug(
      "SIMD",
      `Performing fused multiply-add on arrays of length ${a.length}`,
    );

    return a.map((x, i) => x * b[i] + c[i]);
  }

  reduce(a: number[], operation: "sum" | "min" | "max" | "mean"): number {
    if (!Array.isArray(a) || a.length === 0) {
      throw new Error("Array must be non-empty for reduce operation");
    }

    debug.debug(
      "SIMD",
      `Performing ${operation} reduction on array of length ${a.length}`,
    );

    switch (operation) {
      case "sum":
        return a.reduce((sum, x) => sum + x, 0);
      case "min":
        return Math.min(...a);
      case "max":
        return Math.max(...a);
      case "mean":
        return a.reduce((sum, x) => sum + x, 0) / a.length;
      default:
        throw new Error(`Unknown reduction operation: ${operation}`);
    }
  }

  transform(a: number[], fn: (x: number) => number): number[] {
    debug.debug(
      "SIMD",
      `Performing transformation on array of length ${a.length}`,
    );

    if (this.useParallel && a.length > 1000) {
      return this.parallelUnaryOperation(a, fn);
    }

    return a.map(fn);
  }

  convolve(signal: number[], kernel: number[]): number[] {
    debug.debug(
      "SIMD",
      `Performing convolution: signal(${signal.length}) * kernel(${kernel.length})`,
    );

    const result: number[] = [];
    const outputSize = signal.length - kernel.length + 1;

    for (let i = 0; i < outputSize; i++) {
      let sum = 0;
      for (let j = 0; j < kernel.length; j++) {
        sum += signal[i + j] * kernel[j];
      }
      result.push(sum);
    }

    return result;
  }

  crossCorrelation(a: number[], b: number[]): number[] {
    debug.debug(
      "SIMD",
      `Performing cross-correlation between arrays of length ${a.length} and ${b.length}`,
    );

    const result: number[] = [];
    const maxLag = Math.min(a.length, b.length) - 1;

    for (let lag = -maxLag; lag <= maxLag; lag++) {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < a.length; i++) {
        const j = i + lag;
        if (j >= 0 && j < b.length) {
          sum += a[i] * b[j];
          count++;
        }
      }

      result.push(count > 0 ? sum / count : 0);
    }

    return result;
  }

  // Statistical operations
  mean(a: number[]): number {
    if (a.length === 0) return 0;
    return this.reduce(a, "sum") / a.length;
  }

  variance(a: number[]): number {
    if (a.length === 0) return 0;

    const meanVal = this.mean(a);
    const squaredDiffs = a.map((x) => Math.pow(x - meanVal, 2));
    return this.mean(squaredDiffs);
  }

  standardDeviation(a: number[]): number {
    return Math.sqrt(this.variance(a));
  }

  covariance(a: number[], b: number[]): number {
    this.validateArrays(a, b);

    const meanA = this.mean(a);
    const meanB = this.mean(b);

    const covariances = a.map((x, i) => (x - meanA) * (b[i] - meanB));
    return this.mean(covariances);
  }

  correlation(a: number[], b: number[]): number {
    const cov = this.covariance(a, b);
    const stdA = this.standardDeviation(a);
    const stdB = this.standardDeviation(b);

    if (stdA === 0 || stdB === 0) return 0;

    return cov / (stdA * stdB);
  }

  // Enhanced parallel operations
  private parallelUnaryOperation(
    a: number[],
    op: (x: number) => number,
  ): number[] {
    const chunkSize = Math.ceil(a.length / 4);
    const chunks: Promise<number[]>[] = [];

    for (let i = 0; i < a.length; i += chunkSize) {
      const chunk = a.slice(i, i + chunkSize);
      chunks.push(this.processUnaryChunk(chunk, op));
    }

    // Note: This is synchronous for now, would need proper async support
    return a.map(op);
  }
}

// Export a default instance
export const simd = new SIMDProcessor();
